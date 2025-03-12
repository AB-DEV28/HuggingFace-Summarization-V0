import { useEffect, useState } from 'react';
import { ChatSession } from '@/lib/api';
import { api } from '@/lib/api';
import { PlusIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  onSessionsChange?: () => void;  // Add this prop
}

export function Sidebar({ currentSessionId, onSessionSelect, onNewSession, onSessionsChange }: SidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, [onSessionsChange]); // Add onSessionsChange to dependency array

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await api.chat.getSessions();
      setSessions(response);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-64 h-screen bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Chat Session
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <nav className="space-y-1 px-2">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSessionSelect(session.id.toString())}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentSessionId === session.id.toString()
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                <div className="flex-1 truncate text-left">
                  {session.title}
                </div>
                <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  {session.summaries.length}
                </div>
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
