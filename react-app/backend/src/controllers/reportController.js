import { store } from '../data/mockData.js';
import { successResponse } from '../utils/response.js';

const getVisibleHouseholdIds = (req) => req.user.role === 'PLATFORM_ADMIN'
  ? new Set(store.households.map((household) => household.id))
  : new Set(req.user.householdId ? [req.user.householdId] : []);
const getVisibleBills = (req) => {
  const householdIds = getVisibleHouseholdIds(req);
  return store.bills.filter((bill) => householdIds.has(bill.householdId));
};

export const getMonthlyReport = (req, res) => {
  const totals = new Map();
  getVisibleBills(req).forEach((bill) => {
    const month = bill.billingPeriod || 'Unknown';
    totals.set(month, (totals.get(month) || 0) + Number(bill.amount || 0));
  });
  return successResponse(res, 'Monthly report fetched', [...totals].map(([month, spending]) => ({ month, spending })));
};

export const getUtilityReport = (req, res) => {
  const totals = new Map();
  getVisibleBills(req).forEach((bill) => {
    totals.set(bill.utilityType, (totals.get(bill.utilityType) || 0) + Number(bill.amount || 0));
  });
  return successResponse(res, 'Utility report fetched', [...totals].map(([name, value]) => ({ name, value })));
};

export const getMemberReport = (req, res) => {
  const bills = getVisibleBills(req);
  const householdIds = getVisibleHouseholdIds(req);
  const members = store.users.filter((user) => householdIds.has(user.householdId) && user.status === 'ACTIVE');
  const totals = members.map((member) => ({
    name: member.name,
    value: bills.reduce((sum, bill) => sum + Number(bill.splits.find((split) => split.memberId === member.id)?.amount || 0), 0),
  }));
  return successResponse(res, 'Member report fetched', totals);
};

export const getPaymentReport = (req, res) => {
  const householdIds = getVisibleHouseholdIds(req);
  const totals = new Map();
  store.payments.filter((payment) => householdIds.has(payment.householdId)).forEach((payment) => {
    const status = payment.status === 'SUCCESS' ? 'Paid' : 'Pending';
    totals.set(status, (totals.get(status) || 0) + Number(payment.amount || 0));
  });
  return successResponse(res, 'Payment report fetched', [...totals].map(([name, value]) => ({ name, value })));
};
