import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import router from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initializeSocket } from './socket.js';

if (globalThis.process?.env?.NODE_ENV === 'production') {
  throw new Error('This demo backend uses in-memory sample data and cannot run in production.');
}

const app = express();
const server = http.createServer(app);
const clientOrigin = globalThis.process?.env?.CLIENT_ORIGIN;
const isAllowedOrigin = (origin) => !origin
  || origin === clientOrigin
  || (!globalThis.process?.env?.NODE_ENV || globalThis.process.env.NODE_ENV !== 'production')
    && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
    methods: ['GET', 'POST'],
  },
});

const PORT = Number(globalThis.process?.env?.PORT || 5000);

app.use(cors({
  origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});
app.use(express.json({ limit: '100kb' }));
app.use('/api', router);
app.use(errorHandler);

initializeSocket(io);

server.listen(PORT, () => {
  console.log(`SmartSplit backend running on http://localhost:${PORT}`);
});
