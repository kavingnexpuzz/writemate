require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');

const createApp = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  const app = createApp();
  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Socket.IO auth/event handlers are wired up in Phase 7 (./socket/index.js).
  app.set('io', io);

  httpServer.listen(PORT, () => {
    console.log(`WriteMate API listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled promise rejection:', err);
    httpServer.close(() => process.exit(1));
  });
}

start();
