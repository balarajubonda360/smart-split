import express from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} from '../controllers/authController.js';
import {
  getHouseholds,
  createHousehold,
  getHouseholdById,
  addHouseholdMember,
  getHouseholdMembersRoute,
  removeHouseholdMember,
  getHouseholdSummary,
} from '../controllers/householdController.js';
import {
  getElectricityBills,
  getWaterBills,
  getInternetBills,
} from '../controllers/utilityController.js';
import {
  getAllBills,
  getBillById,
  syncBills,
  calculateSplit,
  getBillSplits,
} from '../controllers/billController.js';
import {
  createPayment,
  processPayment,
  getPayments,
  getPaymentById,
  refundPayment,
} from '../controllers/paymentController.js';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notificationController.js';
import {
  getMonthlyReport,
  getUtilityReport,
  getMemberReport,
  getPaymentReport,
} from '../controllers/reportController.js';
import {
  getLoyaltyBalance,
  getLoyaltyHistory,
  earnPoints,
  redeemPoints,
} from '../controllers/loyaltyController.js';
import {
  createDispute,
  getDisputes,
  updateDisputeStatus,
} from '../controllers/disputeController.js';
import {
  getPredictions,
  generatePrediction,
  getPredictionById,
} from '../controllers/predictionController.js';
import { getPlatformOverview, getPlatformUsers, getPlatformHouseholds, getPlatformBills, getPlatformPayments, getPlatformDisputes } from '../controllers/adminController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getAutopay, saveAutopay, updateAutopay, deleteAutopay } from '../controllers/autopayController.js';

const router = express.Router();

router.post('/auth/register', asyncHandler(registerUser));
router.post('/auth/login', asyncHandler(loginUser));
router.get('/auth/me', protect, getCurrentUser);
router.post('/auth/logout', protect, logoutUser);

router.get('/households', protect, getHouseholds);
router.post('/households', protect, createHousehold);
router.get('/households/summary', protect, getHouseholdSummary);
router.get('/households/:id', protect, getHouseholdById);
router.post('/households/:id/members', protect, requireRole('HOUSEHOLD_ADMIN'), asyncHandler(addHouseholdMember));
router.get('/households/:id/members', protect, getHouseholdMembersRoute);
router.delete('/members/:memberId', protect, requireRole('HOUSEHOLD_ADMIN'), removeHouseholdMember);

router.get('/utilities/electricity/bills', protect, getElectricityBills);
router.get('/utilities/water/bills', protect, getWaterBills);
router.get('/utilities/internet/bills', protect, getInternetBills);

router.get('/bills', protect, getAllBills);
router.get('/bills/:id', protect, getBillById);
router.post('/bills/sync', protect, syncBills);
router.post('/splits/calculate', protect, calculateSplit);
router.get('/bills/:id/splits', protect, getBillSplits);

router.post('/payments/create', protect, createPayment);
router.post('/payments/process', protect, processPayment);
router.get('/payments', protect, getPayments);
router.get('/payments/:id', protect, getPaymentById);
router.post('/payments/:id/refund', protect, refundPayment);

router.get('/autopay', protect, getAutopay);
router.post('/autopay', protect, saveAutopay);
router.put('/autopay/:id', protect, updateAutopay);
router.delete('/autopay/:id', protect, deleteAutopay);

router.get('/predictions', protect, getPredictions);
router.post('/predictions/generate', protect, generatePrediction);
router.get('/predictions/:id', protect, getPredictionById);

router.post('/disputes', protect, createDispute);
router.get('/disputes', protect, getDisputes);
router.put('/disputes/:id/status', protect, updateDisputeStatus);

router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);
router.put('/notifications/read-all', protect, markAllNotificationsRead);

router.get('/reports/monthly', protect, getMonthlyReport);
router.get('/reports/utilities', protect, getUtilityReport);
router.get('/reports/members', protect, getMemberReport);
router.get('/reports/payments', protect, getPaymentReport);

router.get('/loyalty/balance', protect, getLoyaltyBalance);
router.get('/loyalty/history', protect, getLoyaltyHistory);
router.post('/loyalty/earn', protect, requireRole('PLATFORM_ADMIN'), earnPoints);
router.post('/loyalty/redeem', protect, redeemPoints);

router.get('/admin/overview', protect, requireRole('PLATFORM_ADMIN'), getPlatformOverview);
router.get('/admin/users', protect, requireRole('PLATFORM_ADMIN'), getPlatformUsers);
router.get('/admin/households', protect, requireRole('PLATFORM_ADMIN'), getPlatformHouseholds);
router.get('/admin/bills', protect, requireRole('PLATFORM_ADMIN'), getPlatformBills);
router.get('/admin/payments', protect, requireRole('PLATFORM_ADMIN'), getPlatformPayments);
router.get('/admin/disputes', protect, requireRole('PLATFORM_ADMIN'), getPlatformDisputes);

router.get('/health', (req, res) => res.json({ success: true, message: 'SmartSplit API healthy', data: { status: 'ok' } }));

export default router;
