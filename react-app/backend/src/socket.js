import jwt from 'jsonwebtoken';
import { jwtSecret } from './utils/jwtSecret.js';
import { store } from './data/mockData.js';

let socketServer = null;

export const initializeSocket = (io) => {
  socketServer = io;

  io.use((socket, next) => {
    const header = socket.handshake.headers.authorization || '';
    const token = socket.handshake.auth?.token
      || (header.startsWith('Bearer ') ? header.slice(7) : '');
    if (!token) return next(new Error('Authentication required'));
    try {
      const { userId } = jwt.verify(token, jwtSecret);
      const user = store.users.find((item) => item.id === userId && item.status === 'ACTIVE');
      if (!user) return next(new Error('Authentication required'));
      socket.data.user = user;
      return next();
    } catch {
      return next(new Error('Authentication required'));
    }
  });

  io.on('connection', (socket) => {
    const { user } = socket.data;
    socket.join(`user:${user.id}`);
    if (user.householdId) socket.join(`household:${user.householdId}`);
    socket.join(`role:${user.role}`);
    socket.emit('connected', { status: 'connected', message: 'SmartSplit socket connected' });

    socket.on('ping', () => {
      socket.emit('pong', { ok: true });
    });
  });
};

export const emitSocketEvent = (eventName, payload, rooms) => {
  if (socketServer) {
    if (rooms) socketServer.to(rooms).emit(eventName, payload);
  }
};
