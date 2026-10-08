import { store } from '../data/mockData.js';
import { successResponse, errorResponse } from '../utils/response.js';

const supportedPreferences = ['AUTO_DEBIT', 'UPI', 'CARD'];

const validateRule = (body) => {
  const maxAmount = Number(body.maxAmount);
  if (!Number.isFinite(maxAmount) || maxAmount <= 0) return 'Maximum amount must be greater than zero';
  if (!supportedPreferences.includes(body.preference)) return 'Choose a supported payment preference';
  if (typeof body.enabled !== 'boolean') return 'Auto-pay enabled must be true or false';
  if (body.nextPaymentDate) {
    const parsedDate = new Date(`${body.nextPaymentDate}T00:00:00.000Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.nextPaymentDate)
      || Number.isNaN(parsedDate.getTime())
      || parsedDate.toISOString().slice(0, 10) !== body.nextPaymentDate) {
      return 'Enter a valid next payment date';
    }
  }
  return null;
};

export const getAutopay = (req, res) => {
  const rule = store.autopayRules.find((item) => item.userId === req.user.id) || null;
  return successResponse(res, 'Auto-pay settings fetched', { rule });
};

export const saveAutopay = (req, res) => {
  const validationError = validateRule(req.body);
  if (validationError) return errorResponse(res, validationError, 400);
  if (!req.user.householdId) return errorResponse(res, 'Create or join a household before enabling auto-pay', 400);

  let rule = store.autopayRules.find((item) => item.userId === req.user.id);
  if (rule) {
    Object.assign(rule, {
      enabled: Boolean(req.body.enabled),
      maxAmount: Number(req.body.maxAmount),
      preference: req.body.preference,
      nextPaymentDate: req.body.nextPaymentDate,
    });
  } else {
    rule = {
      id: `ap-${Date.now()}`,
      householdId: req.user.householdId,
      userId: req.user.id,
      enabled: Boolean(req.body.enabled),
      maxAmount: Number(req.body.maxAmount),
      preference: req.body.preference,
      nextPaymentDate: req.body.nextPaymentDate,
      createdAt: new Date().toISOString(),
    };
    store.autopayRules.push(rule);
  }

  return successResponse(res, 'Auto-pay settings saved', { rule });
};

export const updateAutopay = (req, res) => {
  const rule = store.autopayRules.find((item) => item.id === req.params.id && item.userId === req.user.id);
  if (!rule) return errorResponse(res, 'Auto-pay rule not found', 404);
  const validationError = validateRule({ ...rule, ...req.body });
  if (validationError) return errorResponse(res, validationError, 400);
  const updates = {};
  ['enabled', 'preference', 'nextPaymentDate'].forEach((key) => {
    if (Object.hasOwn(req.body, key)) updates[key] = req.body[key];
  });
  if (Object.hasOwn(req.body, 'maxAmount')) updates.maxAmount = Number(req.body.maxAmount);
  Object.assign(rule, updates);
  return successResponse(res, 'Auto-pay settings updated', { rule });
};

export const deleteAutopay = (req, res) => {
  const index = store.autopayRules.findIndex((item) => item.id === req.params.id && item.userId === req.user.id);
  if (index === -1) return errorResponse(res, 'Auto-pay rule not found', 404);
  const [rule] = store.autopayRules.splice(index, 1);
  return successResponse(res, 'Auto-pay settings removed', { rule });
};
