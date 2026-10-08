import { store } from '../data/mockData.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getPredictions = (req, res) => {
  const predictions = store.predictions.filter((prediction) => prediction.userId === req.user.id || req.user.role === 'PLATFORM_ADMIN');
  return successResponse(res, 'Predictions fetched', { predictions });
};

export const generatePrediction = (req, res) => {
  const bill = Number(req.body.currentBill);
  if (!Number.isFinite(bill) || bill <= 0 || bill > 100000000) {
    return errorResponse(res, 'Current bill must be a positive amount below 100,000,000', 400);
  }
  const previousBills = [7800, 8100, 8350, bill];
  const projected = Math.round(bill * 1.03);

  const prediction = {
    id: `pr-${Date.now()}`,
    householdId: req.user.householdId,
    userId: req.user.id,
    currentBill: bill,
    previousBills,
    predictedBill: projected,
    percentageChange: Number((((projected - previousBills[0]) / previousBills[0]) * 100).toFixed(1)),
    usageTrend: projected > bill ? 'UP' : 'DOWN',
    source: 'Estimated using historical usage',
    generatedAt: new Date().toISOString(),
  };

  store.predictions.unshift(prediction);
  return successResponse(res, 'Prediction generated', { prediction });
};

export const getPredictionById = (req, res) => {
  const prediction = store.predictions.find((item) => item.id === req.params.id);
  if (!prediction || (req.user.role !== 'PLATFORM_ADMIN' && prediction.userId !== req.user.id)) {
    return errorResponse(res, 'Prediction not found', 404);
  }

  return successResponse(res, 'Prediction fetched', { prediction });
};
