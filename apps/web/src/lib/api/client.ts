import { supabase } from '../supabase/client.js';
import {
  CreateLiveSessionRequest,
  LiveSessionTicketResponse,
  SaveSessionRequest,
  SavedSessionRecord,
  SavedEventRecord,
  ProfileUpdate,
  SessionSummary,
  SessionFeedback,
} from '@senseweave/shared';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const { data } = await supabase.auth.getSession();
  if (data?.session?.access_token) {
    headers['Authorization'] = `Bearer ${data.session.access_token}`;
  }
  return headers;
}

export const apiClient = {
  // Live Sessions
  async createLiveSession(req: CreateLiveSessionRequest): Promise<LiveSessionTicketResponse> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/live-sessions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(req),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to create session (${res.status})`);
    }
    return res.json();
  },

  async refreshTicket(sessionId: string): Promise<string> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/live-sessions/${sessionId}/ticket`, {
      method: 'POST',
      headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to refresh ticket (${res.status})`);
    }
    const data = await res.json();
    return data.ticket;
  },

  async stopLiveSession(sessionId: string): Promise<void> {
    const headers = await getAuthHeaders();
    await fetch(`${API_BASE}/live-sessions/${sessionId}/stop`, {
      method: 'POST',
      headers,
    });
  },

  async sendFeedback(sessionId: string, feedback: SessionFeedback): Promise<void> {
    const headers = await getAuthHeaders();
    await fetch(`${API_BASE}/live-sessions/${sessionId}/feedback`, {
      method: 'POST',
      headers,
      body: JSON.stringify(feedback),
    });
  },

  async generateSessionSummary(sessionId: string): Promise<{
    sessionId: string;
    summary: SessionSummary;
    eventCount: number;
    events: unknown[];
  }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/live-sessions/${sessionId}/summary`, {
      method: 'POST',
      headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to generate summary (${res.status})`);
    }
    return res.json();
  },

  async saveSession(sessionId: string, data: SaveSessionRequest): Promise<SavedSessionRecord> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/live-sessions/${sessionId}/save`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to save session (${res.status})`);
    }
    const json = await res.json();
    return json.session;
  },

  // Saved Sessions
  async listSavedSessions(environment?: string): Promise<SavedSessionRecord[]> {
    const headers = await getAuthHeaders();
    const query = environment ? `?environment=${encodeURIComponent(environment)}` : '';
    const res = await fetch(`${API_BASE}/saved-sessions${query}`, {
      headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to list sessions (${res.status})`);
    }
    const json = await res.json();
    return json.sessions;
  },

  async getSavedSession(sessionId: string): Promise<{
    session: SavedSessionRecord;
    events: SavedEventRecord[];
  }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/saved-sessions/${sessionId}`, {
      headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to get session (${res.status})`);
    }
    return res.json();
  },

  async deleteSavedSession(sessionId: string): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/saved-sessions/${sessionId}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to delete session (${res.status})`);
    }
  },

  // User Profile
  async getProfile(): Promise<unknown> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/me`, { headers });
    if (!res.ok) return null;
    const json = await res.json();
    return json.profile;
  },

  async updateProfile(updates: ProfileUpdate): Promise<unknown> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/me`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to update profile (${res.status})`);
    }
    const json = await res.json();
    return json.profile;
  },

  async deleteAccount(): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/me`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to delete account (${res.status})`);
    }
  },
};
