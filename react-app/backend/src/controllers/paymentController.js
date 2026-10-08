import { store, formatCurrency } from '../data/mockData.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { emitSocketEvent } from '../socket.js';

const getNextTransactionId = () => {
  const date = new Date();
  return `TXN-${date.toISOString().slice(0, 10).replace(/-/g, '')}-${String(store.payments.length + 1).padStart(3, '0')}`;
};

export const createPayment = (req, res) => {
  const { billId, amount } = req.body;

  if (typeof billId !== 'string' || !Number.isFinite(amount) || amount <= 0) {
    return errorResponse(res, 'A bill ID and positive payment amount are required', 400);
  }
  const bill = store.bills.find((item) => item.id === billId
    && item.householdId === req.user.householdId);
  if (!bill) return errorResponse(res, 'Bill not found', 404);
  if (Number(amount) !== Number(bill.amount)) {
    return errorResponse(res, 'Payment amount must match the bill amount', 400);
  }
  if (['PAID', 'SUCCESS'].includes(String(bill.status).toUpperCase())) {
    return errorResponse(res, 'This bill has already been paid', 409);
  }
  if (store.payments.some((item) => item.billId === billId && ['PENDING', 'PROCESSING', 'SUCCESS'].includes(item.status))) {
    return errorResponse(res, 'A payment already exists for this bill', 409);
  }

  const payment = {
    id: `p-${Date.now()}`,
    billId,
    householdId: req.user.householdId,
    userId: req.user.id,
    amount,
    status: 'PENDING',
    transactionId: getNextTransactionId(),
    method: 'Demo Payment Gateway',
    createdAt: new Date().toISOString(),
  };

  store.payments.unshift(payment);
  return successResponse(res, 'Payment initialized', { payment });
};

export const processPayment = (req, res) => {
  const { paymentId } = req.body;
  const payment = store.payments.find((item) => item.id === paymentId);

  if (!payment) {
    return errorResponse(res, 'Payment not found', 404);
  }
  if (req.user.role !== 'PLATFORM_ADMIN' && payment.householdId !== req.user.householdId) {
    return errorResponse(res, 'Payment not found', 404);
  }
  if (payment.status !== 'PENDING') {
    return errorResponse(res, 'Only pending payments can be processed', 409);
  }

  payment.status = 'PROCESSING';
  const updateResponse = { ...payment };

  setTimeout(() => {
    payment.status = 'SUCCESS';
    const bill = store.bills.find((item) => item.id === payment.billId);
    if (bill) bill.status = 'PAID';
    const notification = {
      id: `n-${Date.now()}`,
      userId: payment.userId,
      type: 'PAYMENT',
      title: 'Payment successful',
      description: `Your payment of ${formatCurrency(payment.amount)} has been processed successfully.`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    store.notifications.unshift(notification);
    emitSocketEvent('paymentUpdated', { payment }, `user:${payment.userId}`);
    emitSocketEvent('notificationCreated', { userId: payment.userId, notification }, `user:${payment.userId}`);
  }, 1200);

  return successResponse(res, 'Payment processing started', { payment: updateResponse });
};

export const getPayments = (req, res) => {
  const payments = store.payments.filter((payment) => !req.user || req.user.role === 'PLATFORM_ADMIN' || payment.userId === req.user.id || payment.householdId === req.user.householdId);
  return successResponse(res, 'Payments fetched', { payments });
};

export const getPaymentById = (req, res) => {
  const payment = store.payments.find((item) => item.id === req.params.id);
  if (!payment) {
    return errorResponse(res, 'Payment not found', 404);
  }
  if (req.user.role !== 'PLATFORM_ADMIN' && payment.householdId !== req.user.householdId) {
    return errorResponse(res, 'Payment not found', 404);
  }

  return successResponse(res, 'Payment fetched', { payment });
};

export const refundPayment = (req, res) => {
  const payment = store.payments.find((item) => item.id === req.params.id);
  if (!payment) {
    return errorResponse(res, 'Payment not found', 404);
  }
  if (req.user.role !== 'PLATFORM_ADMIN'
    && !(req.user.role === 'HOUSEHOLD_ADMIN' && payment.householdId === req.user.householdId)) {
    return errorResponse(res, 'You do not have permission to refund this payment', 403);
  }
  if (payment.status !== 'SUCCESS') {
    return errorResponse(res, 'Only successful payments can be refunded', 409);
  }

  payment.status = 'REFUNDED';
  const bill = store.bills.find((item) => item.id === payment.billId);
  if (bill) bill.status = 'PENDING';
  return successResponse(res, 'Refund requested successfully', { payment });
};
