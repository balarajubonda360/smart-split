import { store, formatCurrency } from '../data/mockData.js';
import { successResponse } from '../utils/response.js';

const getUtilityBills = (req, utilityType) =>
  store.bills.filter((bill) => bill.utilityType === utilityType
    && (req.user.role === 'PLATFORM_ADMIN' || bill.householdId === req.user.householdId));

const respondWithBills = (req, res, utilityType, label) => {
  const bills = getUtilityBills(req, utilityType);
  const total = bills.reduce((sum, item) => sum + item.amount, 0);
  return successResponse(res, `${label} bills fetched`, { bills, summary: { total, formattedTotal: formatCurrency(total) } });
};

export const getElectricityBills = (req, res) => respondWithBills(req, res, 'ELECTRICITY', 'Electricity');
export const getWaterBills = (req, res) => respondWithBills(req, res, 'WATER', 'Water');

export const getInternetBills = (req, res) => respondWithBills(req, res, 'INTERNET', 'Internet');
