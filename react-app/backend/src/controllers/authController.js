import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../utils/jwtSecret.js';
import { store, getUserByEmail } from '../data/mockData.js';
import { successResponse, errorResponse } from '../utils/response.js';

const sanitizeUser = (user) => {
  const safeUser = { ...user };
  delete safeUser.passwordHash;
  return safeUser;
};

const signToken = (user) => jwt.sign({ userId: user.id, role: user.role }, jwtSecret, {
  expiresIn: '7d',
});

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (typeof name !== 'string' || !name.trim() || !normalizedEmail || typeof password !== 'string') {
    return errorResponse(res, 'Name, a valid email, and password are required', 400);
  }

  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return errorResponse(res, 'Enter a valid email address', 400);
  }
  if (password.length < 8 || password.length > 128) {
    return errorResponse(res, 'Password must be between 8 and 128 characters', 400);
  }
  if (name.trim().length > 100) {
    return errorResponse(res, 'Name must be 100 characters or fewer', 400);
  }

  if (getUserByEmail(normalizedEmail)) {
    return errorResponse(res, 'An account with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    id: `u-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: 'HOUSEHOLD_MEMBER',
    householdId: null,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  };

  store.users.push(newUser);

  return successResponse(res, 'User registered successfully', {
    user: sanitizeUser(newUser),
    token: signToken(newUser),
  }, 201);
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!normalizedEmail || typeof password !== 'string') {
    return errorResponse(res, 'Email and password are required', 400);
  }
  if (password.length > 128) {
    return errorResponse(res, 'Password must be 128 characters or fewer', 400);
  }

  const user = getUserByEmail(normalizedEmail);
  if (!user) {
    return errorResponse(res, 'Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return errorResponse(res, 'Invalid email or password', 401);
  }
  if (user.status !== 'ACTIVE') {
    return errorResponse(res, 'This account has been deactivated', 403);
  }

  return successResponse(res, 'Login successful', {
    user: sanitizeUser(user),
    token: signToken(user),
  });
};

export const getCurrentUser = (req, res) => {
  return successResponse(res, 'Current user profile fetched', {
    user: sanitizeUser(req.user),
  });
};

export const logoutUser = (req, res) => {
  return successResponse(res, 'Logout successful', {}, 200);
};
