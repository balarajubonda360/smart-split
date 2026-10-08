import { store, getHouseholdMembers, formatCurrency } from '../data/mockData.js';
import { successResponse, errorResponse } from '../utils/response.js';
import bcrypt from 'bcryptjs';

const sanitizeUser = (user) => {
  const safeUser = { ...user };
  delete safeUser.passwordHash;
  return safeUser;
};

const canManageHousehold = (req, household) => req.user.role === 'HOUSEHOLD_ADMIN'
  && req.user.householdId === household.id
  && household.adminId === req.user.id;

export const getHouseholds = (req, res) => {
  const households = req.user.role === 'PLATFORM_ADMIN'
    ? store.households
    : store.households.filter((household) => household.id === req.user.householdId);
  return successResponse(res, 'Households fetched', { households });
};

export const createHousehold = (req, res) => {
  const { name, address } = req.body;
  if (req.user.role === 'PLATFORM_ADMIN') {
    return errorResponse(res, 'Platform administrators cannot create household accounts', 403);
  }
  if (req.user.householdId) {
    return errorResponse(res, 'This account already belongs to a household', 409);
  }

  if (typeof name !== 'string' || !name.trim() || typeof address !== 'string' || !address.trim()) {
    return errorResponse(res, 'Household name and address are required', 400);
  }
  if (name.trim().length > 120 || address.trim().length > 240) {
    return errorResponse(res, 'Household name or address is too long', 400);
  }

  const household = {
    id: `h-${Date.now()}`,
    name: name.trim(),
    address: address.trim(),
    adminId: req.user.id,
    createdAt: new Date().toISOString(),
    members: [req.user.id],
  };

  store.households.push(household);
  req.user.householdId = household.id;
  req.user.role = 'HOUSEHOLD_ADMIN';
  return successResponse(res, 'Household created successfully', { household }, 201);
};

export const getHouseholdById = (req, res) => {
  const household = store.households.find((item) => item.id === req.params.id);
  if (!household) {
    return errorResponse(res, 'Household not found', 404);
  }

  if (req.user.role !== 'PLATFORM_ADMIN' && req.user.householdId !== household.id) {
    return errorResponse(res, 'You do not have access to this household', 403);
  }

  const members = getHouseholdMembers(household.id).map(sanitizeUser);
  return successResponse(res, 'Household details fetched', { household: { ...household, members } });
};

export const addHouseholdMember = async (req, res) => {
  const { email, name, password } = req.body;
  const household = store.households.find((item) => item.id === req.params.id);

  if (!household) {
    return errorResponse(res, 'Household not found', 404);
  }

  if (!canManageHousehold(req, household)) {
    return errorResponse(res, 'Only this household’s admin can add members', 403);
  }

  if (!name?.trim() || !email?.trim()) {
    return errorResponse(res, 'Name and email are required', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const matchedUser = store.users.find((user) => user.email.toLowerCase() === normalizedEmail);
  if (matchedUser) {
    if (matchedUser.householdId === household.id) {
      return errorResponse(res, 'This person is already a member of your household', 409);
    }
    if (matchedUser.householdId) {
      return errorResponse(res, 'This account already belongs to another household', 409);
    }
    if (matchedUser.role !== 'HOUSEHOLD_MEMBER') {
      return errorResponse(res, 'Only household member accounts can be added', 400);
    }
    if (matchedUser.status !== 'ACTIVE') {
      return errorResponse(res, 'This account has been deactivated and cannot be added', 409);
    }
    matchedUser.householdId = household.id;
    if (!household.members.includes(matchedUser.id)) household.members.push(matchedUser.id);
    return successResponse(res, 'Member added to household', { member: sanitizeUser(matchedUser) }, 201);
  }

  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return errorResponse(res, 'Enter a valid email address', 400);
  }
  if (!password || password.length < 8) {
    return errorResponse(res, 'Set an initial password with at least 8 characters', 400);
  }

  const newMember = {
    id: `u-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 10),
    role: 'HOUSEHOLD_MEMBER',
    householdId: household.id,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  };
  store.users.push(newMember);
  household.members.push(newMember.id);

  return successResponse(res, 'Member added to household', { member: sanitizeUser(newMember) }, 201);
};

export const getHouseholdMembersRoute = (req, res) => {
  const household = store.households.find((item) => item.id === req.params.id);
  if (!household) {
    return errorResponse(res, 'Household not found', 404);
  }

  if (req.user.role !== 'PLATFORM_ADMIN' && req.user.householdId !== household.id) {
    return errorResponse(res, 'You do not have access to this household', 403);
  }

  return successResponse(res, 'Household members fetched', { members: getHouseholdMembers(household.id).map(sanitizeUser) });
};

export const removeHouseholdMember = (req, res) => {
  const { memberId } = req.params;
  const member = store.users.find((user) => user.id === memberId);

  if (!member) {
    return errorResponse(res, 'Member not found', 404);
  }

  const household = store.households.find((item) => item.id === req.user.householdId);
  if (!household || !canManageHousehold(req, household)) {
    return errorResponse(res, 'Only this household’s admin can remove members', 403);
  }
  if (member.householdId !== household.id) {
    return errorResponse(res, 'That account is not a member of your household', 404);
  }
  if (member.id === household.adminId || member.id === req.user.id || member.role !== 'HOUSEHOLD_MEMBER') {
    return errorResponse(res, 'The household admin cannot be removed here', 400);
  }

  member.householdId = null;
  member.status = 'INACTIVE';
  household.members = household.members.filter((id) => id !== memberId);

  return successResponse(res, 'Member removed successfully', { member: sanitizeUser(member) });
};

export const getHouseholdSummary = (req, res) => {
  const userHouseholdId = req.user.householdId;
  const household = store.households.find((item) => item.id === userHouseholdId);
  if (!household) {
    return errorResponse(res, 'Household not found', 404);
  }

  const householdBills = store.bills.filter((bill) => bill.householdId === userHouseholdId);
  const totalMonthly = householdBills.reduce((sum, bill) => sum + bill.amount, 0);
  const dueBills = householdBills.filter((bill) => bill.status === 'PENDING').length;

  return successResponse(res, 'Household summary fetched', {
    household,
    totalMonthly,
    dueBills,
    formattedTotal: formatCurrency(totalMonthly),
  });
};
