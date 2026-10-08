import { store, formatCurrency } from '../data/mockData.js';
import { successResponse, errorResponse } from '../utils/response.js';

const canAccessBill = (req, bill) => bill
  && (req.user.role === 'PLATFORM_ADMIN' || bill.householdId === req.user.householdId);

export const getAllBills = (req, res) => {
  const bills = store.bills.filter((bill) => !req.user || !req.user.householdId || bill.householdId === req.user.householdId);
  return successResponse(res, 'Bills fetched', { bills });
};

export const getBillById = (req, res) => {
  const bill = store.bills.find((item) => item.id === req.params.id);
  if (!canAccessBill(req, bill)) {
    return errorResponse(res, 'Bill not found', 404);
  }

  return successResponse(res, 'Bill fetched', { bill });
};

export const syncBills = (req, res) => {
  if (!req.user.householdId) {
    return errorResponse(res, 'Create or join a household before syncing bills', 400);
  }
  const householdId = req.user.householdId;
  const newBills = [
    { id: `b-${Date.now()}-e`, householdId, utilityType: 'ELECTRICITY', provider: 'BESCOM', billingPeriod: '2026-11', dueDate: '2026-11-18', amount: 2780, usage: 460, usageUnit: 'kWh', status: 'PENDING', generatedAt: new Date().toISOString(), splits: [] },
    { id: `b-${Date.now()}-w`, householdId, utilityType: 'WATER', provider: 'BWSSB', billingPeriod: '2026-11', dueDate: '2026-11-15', amount: 690, usage: 20, usageUnit: 'KL', status: 'PENDING', generatedAt: new Date().toISOString(), splits: [] },
    { id: `b-${Date.now()}-i`, householdId, utilityType: 'INTERNET', provider: 'ACT Fibernet', billingPeriod: '2026-11', dueDate: '2026-11-20', amount: 899, usage: 850, usageUnit: 'GB', status: 'PENDING', generatedAt: new Date().toISOString(), splits: [] },
  ];

  store.bills.unshift(...newBills);

  return successResponse(res, 'Bills synced successfully', { bills: newBills });
};

export const calculateSplit = (req, res) => {
  const { totalBill, splitType = 'EQUAL', members = [], percentages = {}, customAdjustments = {} } = req.body;

  if (!Number.isFinite(totalBill) || totalBill <= 0 || !Array.isArray(members) || !members.length) {
    return errorResponse(res, 'A positive bill total and at least one member are required', 400);
  }
  if (!['EQUAL', 'PERCENTAGE', 'CUSTOM'].includes(splitType)) {
    return errorResponse(res, 'Unsupported split type', 400);
  }
  const memberIds = members.map((member) => typeof member === 'string' ? member : member?.id);
  if (memberIds.some((id) => typeof id !== 'string') || new Set(memberIds).size !== memberIds.length) {
    return errorResponse(res, 'Provide a unique list of household member IDs', 400);
  }
  const householdMembers = memberIds.map((id) => store.users.find((user) => user.id === id && user.householdId === req.user.householdId));
  if (householdMembers.some((member) => !member)) {
    return errorResponse(res, 'Every selected member must belong to your household', 400);
  }
  const shares = householdMembers.map((member) => {
    if (splitType === 'PERCENTAGE') return Number(percentages?.[member.id]);
    if (splitType === 'CUSTOM') return Number(customAdjustments?.[member.id]);
    return 100 / householdMembers.length;
  });
  if (splitType === 'PERCENTAGE' || splitType === 'CUSTOM') {
    const values = shares;
    if (values.some((share) => !Number.isFinite(share) || share < 0)
      || Math.abs(values.reduce((sum, share) => sum + share, 0) - 100) > 0.01) {
      return errorResponse(res, 'Member percentages must be non-negative and total 100', 400);
    }
  }

  const cents = Math.round(totalBill * 100);
  const parts = shares.map((share, index) => {
    const exact = cents * share / 100;
    return { index, cents: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });
  let undistributed = cents - parts.reduce((sum, part) => sum + part.cents, 0);
  [...parts].sort((left, right) => right.remainder - left.remainder)
    .slice(0, undistributed)
    .forEach((part) => { parts[part.index].cents += 1; });
  const computed = householdMembers.map((member, index) => ({
    id: member.id,
    name: member.name,
    share: shares[index],
    amount: parts[index].cents / 100,
  }));

  return successResponse(res, 'Split calculated', { splits: computed, total: totalBill, formattedTotal: formatCurrency(totalBill) });
};

export const getBillSplits = (req, res) => {
  const bill = store.bills.find((item) => item.id === req.params.id);
  if (!canAccessBill(req, bill)) {
    return errorResponse(res, 'Bill not found', 404);
  }

  const splits = bill.splits || [];

  return successResponse(res, 'Bill splits fetched', { splits, total: bill.amount });
};
