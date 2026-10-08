import { store } from '../data/mockData.js';
import { successResponse } from '../utils/response.js';

export const getPlatformOverview = (req, res) => {
  const stats = {
    totalUsers: store.users.length,
    totalHouseholds: store.households.length,
    totalBills: store.bills.length,
    totalPayments: store.payments.length,
    pendingPayments: store.payments.filter((payment) => payment.status !== 'SUCCESS' && payment.status !== 'REFUNDED').length,
    openDisputes: store.disputes.filter((dispute) => dispute.status === 'OPEN' || dispute.status === 'UNDER_REVIEW').length,
  };

  return successResponse(res, 'Platform overview fetched', { stats });
};

export const getPlatformUsers = (req, res) => {
  const users = store.users.map((user) => Object.fromEntries(
    Object.entries(user).filter(([key]) => key !== 'passwordHash'),
  ));
  return successResponse(res, 'Users fetched', { users });
};

export const getPlatformHouseholds = (req, res) => {
  return successResponse(res, 'Households fetched', { households: store.households });
};

export const getPlatformBills = (req, res) => {
  return successResponse(res, 'Bills fetched', { bills: store.bills });
};

export const getPlatformPayments = (req, res) => {
  return successResponse(res, 'Payments fetched', { payments: store.payments });
};

export const getPlatformDisputes = (req, res) => {
  return successResponse(res, 'Disputes fetched', { disputes: store.disputes });
};
