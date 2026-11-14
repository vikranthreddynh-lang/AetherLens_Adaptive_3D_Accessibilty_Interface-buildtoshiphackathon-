import test from 'node:test';
import assert from 'node:assert';
import { createServer } from 'http';
import { WebSocket } from 'ws';
import { app } from '../../apps/api/dist/app.js';
import { setupWebSocketServer } from '../../apps/api/dist/websocket/server.js';
import { sessionManager } from '../../apps/api/dist/services/sessions/sessionManager.js';
import { ticketStore } from '../../apps/api/dist/services/sessions/ticketStore.js';

test('WebSocket Integration - Real-time Lifecycle & Cue Dispatch', async (t) => {
  try {
    const server = createServer(app);
    setupWebSocketServer(server);

    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as { port: number }).port;

    t.after(() => {
      server.close();
    });

    const sessionId = 'ws_integration_test_session';
    sessionManager.createSession(sessionId, null, 'group_discussion');
    const ticket = ticketStore.createTicket(sessionId, null, 30000);

    const wsUrl = `ws://127.0.0.1:${port}/api/v1/live?ticket=${ticket}`;
    const ws = new WebSocket(wsUrl);

    const receivedMessages: any[] = [];

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        receivedMessages.push(msg);
      } catch {
        // Ignore
      }
    });

    await new Promise<void>((resolve, reject) => {
      ws.on('open', () => {
        resolve();
      });
      ws.on('error', reject);
    });

    // Wait a short tick for session.ready and session.status
    await new Promise((r) => setTimeout(r, 200));

    assert.ok(receivedMessages.some((m) => m.type === 'session.ready'));
    assert.ok(receivedMessages.some((m) => m.type === 'session.status'));

    // Send ping
    ws.send(JSON.stringify({ type: 'ping', payload: { timestamp: Date.now() } }));
    await new Promise((r) => setTimeout(r, 100));
    assert.ok(receivedMessages.some((m) => m.type === 'pong'));

    // Send on-device visual gesture observation
    ws.send(
      JSON.stringify({
        type: 'client.visual_observation',
        payload: {
          observation: {
            gestureType: 'raised_hand',
            confidence: 0.9,
            relativePosition: {
              horizontal: 'left',
              vertical: 'upper',
              basis: 'camera_frame',
            },
            evidence: 'Observable vertical hand raise near camera-left.',
            timestamp: Date.now(),
          },
        },
      })
    );

    // Wait for Live Context Weave Engine to process and emit event and cue
    await new Promise((r) => setTimeout(r, 300));

    console.log('Received message types:', receivedMessages.map((m) => m.type));

    const hasEvent = receivedMessages.some(
      (m) => m.type === 'environment.event' && m.payload.event.eventType === 'raised_hand'
    );
    const hasCue = receivedMessages.some(
      (m) => m.type === 'environment.cue' && m.payload.cue.renderedCue.hapticPattern === 'single_short'
    );

    assert.strictEqual(hasEvent, true, 'Engine must dispatch environment.event');
    assert.strictEqual(hasCue, true, 'Engine must dispatch rendered sensory cue');

    ws.close();
    sessionManager.stopSession(sessionId, 'Test completed');
  } catch (err) {
    console.error('WS TEST ERROR:', err);
    throw err;
  }
});
