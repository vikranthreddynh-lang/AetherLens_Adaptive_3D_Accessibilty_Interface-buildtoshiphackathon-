import crypto from 'crypto';

interface TicketData {
  sessionId: string;
  userId: string | null;
  expiresAt: number;
  consumedAt?: number;
}

export class TicketStore {
  // Map of ticketHash -> TicketData
  private tickets = new Map<string, TicketData>();

  /**
   * Generates a cryptographically secure random token, stores its SHA-256 hash,
   * and returns the plaintext token to the client.
   */
  public createTicket(sessionId: string, userId: string | null = null, ttlMs = 60000): string {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hash = this.hash(rawToken);

    this.tickets.set(hash, {
      sessionId,
      userId,
      expiresAt: Date.now() + ttlMs,
    });

    return rawToken;
  }

  /**
   * Consumes a one-time ticket. Returns the associated session data or null if invalid/expired.
   */
  public consumeTicket(rawToken: string, options?: { immediateDelete?: boolean }): TicketData | null {
    const hash = this.hash(rawToken);
    const data = this.tickets.get(hash);

    if (!data) {
      return null;
    }

    const now = Date.now();

    if (options?.immediateDelete) {
      this.tickets.delete(hash);
      if (now > data.expiresAt) return null;
      return data;
    }

    // If ticket was already consumed, allow a 15-second grace window for React StrictMode / reconnects
    if (data.consumedAt) {
      if (now - data.consumedAt <= 15000) {
        return data;
      }
      this.tickets.delete(hash);
      return null;
    }

    if (now > data.expiresAt) {
      this.tickets.delete(hash);
      return null;
    }

    // Mark as consumed, and cap remaining lifetime to 15s grace window
    data.consumedAt = now;
    data.expiresAt = Math.min(data.expiresAt, now + 15000);

    return data;
  }

  private hash(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  public cleanExpired() {
    const now = Date.now();
    for (const [hash, data] of this.tickets.entries()) {
      if (now > data.expiresAt) {
        this.tickets.delete(hash);
      }
    }
  }
}

export const ticketStore = new TicketStore();

const cleanupInterval = setInterval(() => {
  ticketStore.cleanExpired();
}, 30000);
if (cleanupInterval.unref) {
  cleanupInterval.unref();
}
