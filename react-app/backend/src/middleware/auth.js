import jwt from 'jsonwebtoken';
import { jwtSecret } from '../utils/jwtSecret.js';
import { store } from '../data/mockData.js';

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication token missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = store.users.find((item) => item.id === decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'This account has been deactivated' });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'You do not have permission to access this resource' });
  }

  return next();
};
