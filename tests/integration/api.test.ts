import test from 'node:test';
import assert from 'node:assert';
import { createServer } from 'http';
import { app } from '../../apps/api/dist/app.js';
import { ticketStore } from '../../apps/api/dist/services/sessions/ticketStore.js';

test('API Integration - Health, Live Sessions & Tickets', async (t) => {
  try {
    const server = createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as { port: number }).port;
    const baseUrl = `http://127.0.0.1:${port}/api/v1`;

    t.after(() => {
      server.close();
    });

    // 1. GET /health
    const healthRes = await fetch(`${baseUrl}/health`);
    assert.strictEqual(healthRes.status, 200);
    const healthData = await healthRes.json();
    assert.strictEqual(healthData.status, 'ok');
    assert.strictEqual(healthData.product, 'SenseWeave');

    // 2. POST /live-sessions (guest live session)
    const createRes = await fetch(`${baseUrl}/live-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        environmentType: 'networking',
        enabledInputs: { audio: true, video: true },
        sessionConsentVersion: 'v1.0',
      }),
    });
    assert.strictEqual(createRes.status, 201);
    const createData = await createRes.json();
    assert.ok(createData.sessionId);
    assert.ok(createData.ticket);
    assert.strictEqual(createData.environmentType, 'networking');

    const sessionId = createData.sessionId;
    const ticket = createData.ticket;

    // 3. Ticket Store - Verify single-use consumption with immediate deletion
    const consumed = ticketStore.consumeTicket(ticket, { immediateDelete: true });
    assert.ok(consumed);
    assert.strictEqual(consumed.sessionId, sessionId);

    // Replay attempt must return null
    const replayAttempt = ticketStore.consumeTicket(ticket);
    assert.strictEqual(replayAttempt, null);

    // 3b. Verify ticket refresh endpoint
    const refreshRes = await fetch(`${baseUrl}/live-sessions/${sessionId}/ticket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    assert.strictEqual(refreshRes.status, 200);
    const refreshData = await refreshRes.json();
    assert.ok(refreshData.ticket);
    assert.strictEqual(refreshData.sessionId, sessionId);

    // 4. POST /live-sessions/:id/feedback
    const fbRes = await fetch(`${baseUrl}/live-sessions/${sessionId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feedbackType: 'useful_cue',
        notes: 'Hand raise was detected accurately.',
      }),
    });
    assert.strictEqual(fbRes.status, 200);

    // 5. POST /live-sessions/:id/summary
    const sumRes = await fetch(`${baseUrl}/live-sessions/${sessionId}/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    assert.strictEqual(sumRes.status, 200);
    const sumData = await sumRes.json();
    assert.ok(sumData.summary.title);
    assert.ok(sumData.summary.overview);
    assert.ok(Array.isArray(sumData.summary.eventTimelineSummary));

    // 6. POST /live-sessions/:id/stop
    const stopRes = await fetch(`${baseUrl}/live-sessions/${sessionId}/stop`, {
      method: 'POST',
    });
    assert.strictEqual(stopRes.status, 200);
  } catch (err) {
    console.error('API TEST ERROR CAUGHT:', err);
    throw err;
  }
});
