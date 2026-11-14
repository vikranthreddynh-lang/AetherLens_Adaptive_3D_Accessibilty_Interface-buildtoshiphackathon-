import { createServer } from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { setupWebSocketServer } from './websocket/server.js';
import { logger } from './utils/logger.js';

const httpServer = createServer(app);

// Mount WebSockets
setupWebSocketServer(httpServer);

httpServer.listen(env.PORT, () => {
  logger.info(`SenseWeave API & WebSocket server running on port ${env.PORT}`, {
    port: env.PORT,
    environment: env.NODE_ENV,
    apiPrefix: '/api/v1',
    wsLiveEndpoint: '/api/v1/live',
  });
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, closing HTTP and WebSocket server...');
  httpServer.close(() => {
    logger.info('Server closed cleanly.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, closing server...');
  httpServer.close(() => {
    process.exit(0);
  });
});
