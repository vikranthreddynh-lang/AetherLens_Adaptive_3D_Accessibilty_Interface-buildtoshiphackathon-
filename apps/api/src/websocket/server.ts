import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { env } from '../config/env.js';
import { ticketStore } from '../services/sessions/ticketStore.js';
import { sessionManager, ActiveLiveSession } from '../services/sessions/sessionManager.js';
import { handleClientMessage } from './handlers.js';
import { logger } from '../utils/logger.js';

export function setupWebSocketServer(httpServer: HttpServer): WebSocketServer {
  const wss = new WebSocketServer({
    noServer: true,
    maxPayload: env.MAX_WEBSOCKET_MESSAGE_BYTES,
  });

  httpServer.on('upgrade', (req, socket, head) => {
    const parsedUrl = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;
    const ticket = parsedUrl.searchParams.get('ticket');
    if (!ticket) {
      logger.warn('WebSocket upgrade missing one-time ticket');
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    const ticketData = ticketStore.consumeTicket(ticket);
    if (!ticketData) {
      logger.warn('WebSocket upgrade rejected with invalid or expired ticket');
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    const session = sessionManager.getSession(ticketData.sessionId);
    if (!session) {
      logger.warn('WebSocket upgrade references inactive session', { sessionId: ticketData.sessionId });
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req, session);
    });
  });

  wss.on('connection', (ws: WebSocket, _req: unknown, session: unknown) => {
    const liveSession = session as ActiveLiveSession;
    const sId = liveSession.sessionId;
    logger.info('WebSocket client connected to live session', { sessionId: sId });

    sessionManager.attachSocket(sId, ws);

    // Send session.ready
    ws.send(
      JSON.stringify({
        type: 'session.ready',
        payload: {
          sessionId: sId,
          environmentType: liveSession.environmentType,
          maxDurationMs: env.LIVE_SESSION_MAX_DURATION_MS,
          serverTime: new Date().toISOString(),
        },
      })
    );

    // Send initial status
    ws.send(
      JSON.stringify({
        type: 'session.status',
        payload: {
          state: liveSession.state,
          elapsedMs: Date.now() - liveSession.startedAt,
          cameraActive: true,
          micActive: true,
          recentEventCount: liveSession.engine.getActiveEvents().length,
          message: 'Connected to Live Context Weave Engine.',
        },
      })
    );

    // Heartbeat
    let isAlive = true;
    ws.on('pong', () => {
      isAlive = true;
    });

    const pingInterval = setInterval(() => {
      if (!isAlive) {
        logger.info('Terminating unresponsive WebSocket connection', { sessionId: sId });
        ws.terminate();
        return;
      }
      isAlive = false;
      ws.ping();
    }, 15000);

    ws.on('message', (data) => {
      handleClientMessage(ws, liveSession, data as Buffer);
    });

    ws.on('close', (code, reason) => {
      clearInterval(pingInterval);
      sessionManager.detachSocket(sId, ws);
      logger.info('WebSocket client disconnected', {
        sessionId: sId,
        code,
        reason: reason.toString(),
      });

      // If user had an active session, record gap
      if (liveSession.state === 'active') {
        liveSession.engine.recordObservationGap('Client connection closed');
      }
    });

    ws.on('error', (err) => {
      logger.error('WebSocket connection error', { sessionId: sId, error: err.message });
    });
  });

  return wss;
}
