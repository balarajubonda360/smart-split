import test from 'node:test';
import assert from 'node:assert/strict';
import { store, getUserByEmail } from '../src/data/mockData.js';
import { registerUser } from '../src/controllers/authController.js';
import { createPayment } from '../src/controllers/paymentController.js';
import { getBillById, calculateSplit } from '../src/controllers/billController.js';
import { getPlatformUsers } from '../src/controllers/adminController.js';

const mockResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test('public registration ignores client-supplied privileged roles and household IDs', async () => {
  const email = `privilege-check-${Date.now()}@example.test`;
  const response = mockResponse();
  await registerUser({
    body: { name: 'Test Resident', email, password: 'strong-test-password', role: 'PLATFORM_ADMIN', householdId: 'h-001' },
  }, response);

  const created = getUserByEmail(email);
  assert.equal(response.statusCode, 201);
  assert.equal(created.role, 'HOUSEHOLD_MEMBER');
  assert.equal(created.householdId, null);
  assert.equal('passwordHash' in response.body.data.user, false);
});

test('a user cannot fetch a bill from a different household', () => {
  const householdBill = store.bills.find((bill) => bill.householdId === 'h-001');
  assert.ok(householdBill);
  const response = mockResponse();
  getBillById({ params: { id: householdBill.id }, user: { id: 'u-004', role: 'HOUSEHOLD_MEMBER', householdId: 'h-002' } }, response);
  assert.equal(response.statusCode, 404);
});

test('payment creation uses the authenticated user, not a body-supplied user ID', () => {
  const bill = {
    id: `security-payment-${Date.now()}`,
    householdId: 'h-001',
    amount: 125,
    status: 'PENDING',
  };
  store.bills.push(bill);
  const response = mockResponse();
  try {
    createPayment({
      body: { billId: bill.id, amount: bill.amount, userId: 'u-platform' },
      user: { id: 'u-member', role: 'HOUSEHOLD_MEMBER', householdId: 'h-001' },
    }, response);
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.payment.userId, 'u-member');
  } finally {
    store.bills.splice(store.bills.indexOf(bill), 1);
    const paymentIndex = store.payments.findIndex((payment) => payment.billId === bill.id);
    if (paymentIndex !== -1) store.payments.splice(paymentIndex, 1);
  }
});

test('percentage splits reject values that do not total 100 percent', () => {
  const response = mockResponse();
  calculateSplit({
    body: { totalBill: 100, splitType: 'PERCENTAGE', members: ['u-member', 'u-admin'], percentages: { 'u-member': 40, 'u-admin': 40 } },
    user: { id: 'u-admin', role: 'HOUSEHOLD_ADMIN', householdId: 'h-001' },
  }, response);
  assert.equal(response.statusCode, 400);
});

test('platform user listings never include password hashes', () => {
  const response = mockResponse();
  getPlatformUsers({}, response);
  assert.ok(response.body.data.users.length > 0);
  assert.equal(response.body.data.users.some((user) => 'passwordHash' in user), false);
});
