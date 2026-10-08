import { store } from '../data/mockData.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { emitSocketEvent } from '../socket.js';

export const createDispute = (req, res) => {
  const { title, description, billId } = req.body;

  if (typeof title !== 'string' || !title.trim() || title.length > 160
    || typeof description !== 'string' || !description.trim() || description.length > 4000) {
    return errorResponse(res, 'Title and description are required', 400);
  }
  if (!req.user.householdId) return errorResponse(res, 'Join a household before raising a billing dispute', 400);
  if (billId && !store.bills.some((bill) => bill.id === billId && bill.householdId === req.user.householdId)) {
    return errorResponse(res, 'Bill not found', 404);
  }

  const dispute = {
    id: `d-${Date.now()}`,
    householdId: req.user.householdId,
    userId: req.user.id,
    billId: billId || null,
    title,
    description,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  };

  store.disputes.unshift(dispute);
  emitSocketEvent('disputeUpdated', { dispute }, [`household:${dispute.householdId}`, 'role:PLATFORM_ADMIN']);
  return successResponse(res, 'Dispute created successfully', { dispute }, 201);
};

export const getDisputes = (req, res) => {
  const disputes = req.user.role === 'PLATFORM_ADMIN' ? store.disputes : store.disputes.filter((item) => item.userId === req.user.id || item.householdId === req.user.householdId);
  return successResponse(res, 'Disputes fetched', { disputes });
};

export const updateDisputeStatus = (req, res) => {
  const dispute = store.disputes.find((item) => item.id === req.params.id);
  if (!dispute) {
    return errorResponse(res, 'Dispute not found', 404);
  }
  if (req.user.role !== 'PLATFORM_ADMIN') {
    return errorResponse(res, 'Only platform administrators can update dispute status', 403);
  }

  const { status } = req.body;
  if (!['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'].includes(status)) {
    return errorResponse(res, 'Choose a supported dispute status', 400);
  }
  dispute.status = status;
  emitSocketEvent('disputeUpdated', { dispute }, [`household:${dispute.householdId}`, 'role:PLATFORM_ADMIN']);
  return successResponse(res, 'Dispute status updated', { dispute });
};
