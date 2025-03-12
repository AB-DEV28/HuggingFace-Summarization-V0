'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container } from '@/components/Container';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/Sidebar';
import { ChatSessionDetail } from '@/components/ChatSessionDetail';
import { NewSummaryForm } from '@/components/NewSummaryForm';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [sessionTitle, setSessionTitle] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showNewSummaryForm, setShowNewSummaryForm] = useState(false);

  // Add this useEffect to handle session loading from URL
  useEffect(() => {
    const sessionId = searchParams.get('sessionId');
    if (sessionId) {
      loadSessionDetails(sessionId);
    }
  }, [searchParams]);

  const loadSessionDetails = async (sessionId: string) => {
    if (!sessionId) return;
    
    try {
      const session = await api.chat.getSession(sessionId);
      setCurrentSession(session);
      setCurrentSessionId(sessionId);
      setShowNewSummaryForm(false); // Reset form visibility when loading new session
    } catch (error) {
      setError('Failed to load session details');
      console.error('Error loading session:', error);
    }
  };

  const createNewSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTitle.trim()) return;

    try {
      setIsCreatingSession(true);
      setError(null);
      const { session_id } = await api.chat.createSession(sessionTitle);
      await loadSessionDetails(session_id.toString()); // Convert to string
      setSessionTitle('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setIsCreatingSession(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        currentSessionId={currentSessionId}
        onSessionSelect={loadSessionDetails}
        onNewSession={() => {
          setCurrentSessionId(null);
          setCurrentSession(null);
        }}
        onSessionsChange={() => refreshKey}
      />
      
      <main className="flex-1 overflow-y-auto">
        <Container>
          <div className="max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Text Summarizer
              </h1>
            </div>

            {!currentSessionId ? (
              <div className="mb-8">
                <form onSubmit={createNewSession} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Create New Chat Session
                    </label>
                    <input
                      type="text"
                      value={sessionTitle}
                      onChange={(e) => setSessionTitle(e.target.value)}
                      placeholder="Enter session title"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      required
                    />
                  </div>
                  {error && (
                    <div className="text-red-600 text-sm">{error}</div>
                  )}
                  <button
                    type="submit"
                    disabled={isCreatingSession}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {isCreatingSession ? 'Creating...' : 'Create Session'}
                  </button>
                </form>
              </div>
            ) : currentSession ? (
              <ChatSessionDetail
                session={currentSession}
                onUpdate={() => loadSessionDetails(currentSessionId)}
                onNewSummary={() => setShowNewSummaryForm(true)}
                onDelete={() => setCurrentSessionId(null)}
              />
            ) : null}

            {showNewSummaryForm && currentSessionId && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Create New Summary
                  </h3>
                  <NewSummaryForm
                    sessionId={Number(currentSessionId)}
                    onSuccess={() => {
                      setShowNewSummaryForm(false);
                      loadSessionDetails(currentSessionId);
                    }}
                    onCancel={() => setShowNewSummaryForm(false)}
                  />
                </div>
              </div>
            )}
          </div>
        </Container>
      </main>
    </div>
  );
}
