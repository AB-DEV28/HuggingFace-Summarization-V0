// API base URL - will be rewritten by Next.js
const API_BASE_URL = '/api';

export type SummaryParameters = {
  min_length?: number;
  max_length?: number;
  do_sample?: boolean;
};

export type Summary = {
  original_text: string;
  summary_text: string;
  parameters: SummaryParameters;
  created_at: string;
};

export type User = {
  email: string;
};

export type UserUpdateData = {
  email?: string;
  password?: string;
};

export type ChatSession = {
  id: string;
  title: string;
  summaries: Summary[];
  meta_summary: string | null;
  created_at: string;
  updated_at: string;
};

export interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      const message = errorData.detail || errorData.message || JSON.stringify(errorData);
      throw new ApiError(response.status, message);
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(response.status, `HTTP error: ${response.statusText}`);
    }
  }

  try {
    const data = await response.json();
    return data;
  } catch (error) {
    throw new ApiError(500, 'Failed to parse response');
  }
}

export const api = {
  auth: {
    register: (email: string, password: string) =>
      fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }).then((res) => handleResponse<{ user: User }>(res)),

    login: (email: string, password: string) =>
      fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }).then((res) => handleResponse<{ user: User }>(res)),

    logout: () =>
      fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      }).then((res) => handleResponse<void>(res)),

    getProfile: () =>
      fetch(`${API_BASE_URL}/auth/user/me`, {
        credentials: 'include',
      }).then((res) => handleResponse<User>(res)),

    updateProfile: (data: UserUpdateData) =>
      fetch(`${API_BASE_URL}/auth/user/me`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((res) => handleResponse<User>(res)),
  },

  summary: {
    create: (text: string, parameters?: SummaryParameters) =>
      fetch(`${API_BASE_URL}/summary`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, parameters }),
      }).then((res) => handleResponse<Summary>(res)),

    getHistory: () =>
      fetch(`${API_BASE_URL}/summary/history`, {
        credentials: 'include',
      }).then((res) => handleResponse<Summary[]>(res)),

    delete: (summaryIndex: number) =>
      fetch(`${API_BASE_URL}/summary/${summaryIndex}`, {
        method: 'DELETE',
        credentials: 'include',
      }).then((res) => handleResponse<void>(res)),
  },

  chat: {
    createSession: (title: string) =>
      fetch(`${API_BASE_URL}/chat/sessions`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      }).then((res) => handleResponse<{ session_id: string }>(res)),

    getSessions: () =>
      fetch(`${API_BASE_URL}/chat/sessions`, {
        credentials: 'include',
      }).then((res) => handleResponse<ChatSession[]>(res)),

    deleteSession: (sessionId: string) =>
      fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include',
      }).then((res) => handleResponse<void>(res)),

    addSummary: (sessionId: string, text: string, parameters: SummaryParameters = { min_length: 100, max_length: 300 }) =>
      fetch(`${API_BASE_URL}/chat/summarize`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          text,
          parameters
        }),
      }).then((res) => handleResponse<Summary>(res)),

    getSession: (sessionId: string) =>
      fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
        credentials: 'include',
      }).then((res) => handleResponse<ChatSession>(res)),

    updateSession: (sessionId: string, data: { title: string }) =>
      fetch(`${API_BASE_URL}/chat/sessions/${sessionId}?title=${encodeURIComponent(data.title)}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 
          'Accept': 'application/json'
        }
      }).then((res) => handleResponse<ChatSession>(res)),

    generateMetaSummary: (sessionId: string, parameters: SummaryParameters = { min_length: 100, max_length: 300 }) =>
      fetch(`${API_BASE_URL}/chat/meta-summarize`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          session_id: sessionId,
          parameters 
        }),
      }).then((res) => handleResponse<ChatSession>(res)),

    deleteSummary: (sessionId: string, summaryIndex: number) =>
      fetch(`${API_BASE_URL}/chat/sessions/${sessionId}/summaries/${summaryIndex}`, {
        method: 'DELETE',
        credentials: 'include',
      }).then((res) => handleResponse<void>(res)),

    createSummary: async (sessionId: number, text: string, parameters?: SummarizationParameters) => {
      const response = await fetch(`${API_BASE_URL}/chat/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          text,
          parameters: parameters || {
            min_length: 50,
            max_length: 200,
            do_sample: false
          }
        }),
        credentials: 'include',
      });

      return handleResponse<Summary>(response);
    },

    updateSummary: (sessionId: string, summaryIndex: number, data: PartialSummaryUpdate) =>
      fetch(`${API_BASE_URL}/chat/sessions/${sessionId}/summaries/${summaryIndex}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((res) => handleResponse<Summary>(res)),
  },
};

export type PartialSummaryUpdate = {
  text?: string;
  parameters?: SummaryParameters;
};

interface SummarizationParameters {
  min_length?: number;
  max_length?: number;
  do_sample?: boolean;
}
