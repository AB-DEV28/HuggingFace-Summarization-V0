import { useState, useCallback } from 'react';
import axios from 'axios';

interface Summary {
  original_text: string;
  summary_text: string;
  created_at: string;
  parameters: {
    min_length: number;
    max_length: number;
    do_sample: boolean;
  };
}

interface ChatSession {
  id: string;
  title: string;
  summaries: Summary[];
  meta_summary: string | null;
  created_at: string;
  updated_at: string;
}

export const useChats = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:8000/chat/sessions', {
        withCredentials: true
      });
      setSessions(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load chat sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await axios.delete(`http://localhost:8000/chat/sessions/${sessionId}`, {
        withCredentials: true
      });
      setSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete session');
    }
  }, []);

  return {
    sessions,
    loading,
    error,
    loadSessions,
    deleteSession
  };
};
