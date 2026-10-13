export interface Citation {
  id?: string;
  guest: string;
  episode_title: string;
  section?: string;
  snippet: string;
  score: number;
}

export interface Artifact {
  title: string;
  type: 'html' | 'markdown';
  content: string;
  raw_code?: string;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  provider_used?: string;
  model_used?: string;
  artifact?: Artifact | null;
  citations?: Citation[];
  created_at: string;
}

export interface Session {
  id: string;
  title: string;
  provider: string;
  model: string;
  message_count?: number;
  messages?: Message[];
  created_at: string;
  updated_at: string;
}

export interface ProviderInfo {
  id: string;
  name: string;
  description: string;
  default_model: string;
  models: string[];
  status: string;
  is_available: boolean;
}

export interface ChatRequestPayload {
  message: string;
  session_id?: string;
  provider?: string;
  model?: string;
  skill?: string;
}

export interface ChatResponsePayload {
  session_id: string;
  message_id: string;
  role: string;
  content: string;
  citations: Citation[];
  artifact?: Artifact | null;
  provider_used: string;
  model_used: string;
}

const API_BASE = '/api';

export const api = {
  async getSessions(): Promise<Session[]> {
    const res = await fetch(`${API_BASE}/sessions`);
    if (!res.ok) throw new Error('Failed to fetch sessions');
    return res.json();
  },

  async createSession(title?: string): Promise<Session> {
    const res = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error('Failed to create session');
    return res.json();
  },

  async getSession(id: string): Promise<Session> {
    const res = await fetch(`${API_BASE}/sessions/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch session ${id}`);
    return res.json();
  },

  async deleteSession(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/sessions/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed to delete session ${id}`);
  },

  async sendMessage(payload: ChatRequestPayload): Promise<ChatResponsePayload> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.detail || 'Chat request failed');
    }
    return res.json();
  },

  async getProviders(): Promise<{ active_default: string; providers: ProviderInfo[] }> {
    const res = await fetch(`${API_BASE}/chat/providers`);
    if (!res.ok) throw new Error('Failed to fetch providers');
    return res.json();
  },

  async getReadiness(): Promise<{ ready: boolean; indexed_chunks: number; ollama: any }> {
    const res = await fetch('/ready');
    if (!res.ok) throw new Error('Failed to fetch system readiness');
    return res.json();
  },
};
