import { store } from '../data/mockData.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getLoyaltyBalance = (req, res) => {
  const totalPoints = store.loyaltyTransactions
    .filter((transaction) => transaction.userId === req.user.id)
    .reduce((sum, transaction) => sum + transaction.points, 0);

  return successResponse(res, 'Loyalty balance fetched', {
    balance: totalPoints,
    cashback: Math.max(totalPoints * 4, 0),
    history: store.loyaltyTransactions.filter((transaction) => transaction.userId === req.user.id),
  });
};

export const getLoyaltyHistory = (req, res) => {
  return successResponse(res, 'Loyalty history fetched', {
    history: store.loyaltyTransactions.filter((transaction) => transaction.userId === req.user.id),
  });
};

export const earnPoints = (req, res) => {
  const points = Number(req.body.points);
  if (!Number.isSafeInteger(points) || points <= 0 || points > 100000) {
    return errorResponse(res, 'Points must be a positive whole number below 100,000', 400);
  }
  const transaction = {
    id: `lt-${Date.now()}`,
    userId: req.user.id,
    type: 'EARN',
    points,
    amount: req.body.amount || 0,
    description: req.body.description || 'Successful payment',
    createdAt: new Date().toISOString(),
  };

  store.loyaltyTransactions.unshift(transaction);
  return successResponse(res, 'Points earned', { transaction });
};

export const redeemPoints = (req, res) => {
  const points = Number(req.body.points);
  if (!Number.isSafeInteger(points) || points <= 0) {
    return errorResponse(res, 'Points must be a positive whole number', 400);
  }
  const balance = store.loyaltyTransactions
    .filter((transaction) => transaction.userId === req.user.id)
    .reduce((sum, transaction) => sum + transaction.points, 0);
  if (points > balance) return errorResponse(res, 'Insufficient points for this redemption', 409);
  const transaction = {
    id: `lt-${Date.now()}`,
    userId: req.user.id,
    type: 'REDEEM',
    points: -Math.abs(points),
    amount: points * 4,
    description: req.body.description || 'Cashback redeemed',
    createdAt: new Date().toISOString(),
  };

  store.loyaltyTransactions.unshift(transaction);
  return successResponse(res, 'Points redeemed', { transaction });
};
