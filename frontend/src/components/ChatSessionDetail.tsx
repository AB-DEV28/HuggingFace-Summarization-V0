import { useState } from 'react';
import { ChatSession, api, ApiError } from '@/lib/api';
import { PencilIcon, DocumentTextIcon, TrashIcon } from '@heroicons/react/24/outline';
import { NewSummaryForm } from './NewSummaryForm';

interface ChatSessionDetailProps {
  session: ChatSession;
  onUpdate: () => void;
  onNewSummary: () => void;
  onDelete: () => void;
}

export function ChatSessionDetail({ session, onUpdate, onNewSummary, onDelete }: ChatSessionDetailProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [title, setTitle] = useState(session.title);
  const [isGeneratingMeta, setIsGeneratingMeta] = useState(false);
  const [parameters, setParameters] = useState({
    min_length: 100,
    max_length: 300,
    do_sample: false
  });
  const [showDeleteSummaryModal, setShowDeleteSummaryModal] = useState<number | null>(null);
  const [showNewSummaryForm, setShowNewSummaryForm] = useState(false);
  const [titleError, setTitleError] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingSummary, setEditingSummary] = useState<{
    index: number;
    text?: string;
    parameters?: SummaryParameters;
  } | null>(null);

  const handleTitleUpdate = async () => {
    try {
      setTitleError('');
      const trimmedTitle = title.trim();
      
      if (!trimmedTitle) {
        setTitleError('Title cannot be empty');
        return;
      }

      if (trimmedTitle === session.title) {
        setIsEditingTitle(false);
        return;
      }

      const updatedSession = await api.chat.updateSession(session.id, { title: trimmedTitle });
      
      if (updatedSession) {
        setIsEditingTitle(false);
        setTitle(updatedSession.title);
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update title:', error);
      
      let errorMessage = 'Failed to update title. Please try again.';
      if (error instanceof ApiError) {
        errorMessage = error.message;
      }
      
      setTitleError(errorMessage);
      setTitle(session.title); // Reset to original title
    }
  };

  const handleMetaSummarize = async () => {
    if (session.summaries.length === 0) return;
    
    try {
      setIsGeneratingMeta(true);
      await api.chat.generateMetaSummary(session.id, parameters);
      onUpdate();
    } catch (error) {
      console.error('Failed to generate meta summary:', error);
    } finally {
      setIsGeneratingMeta(false);
      setShowMetaModal(false);
    }
  };

  const handleDeleteSummary = async (index: number) => {
    try {
      await api.chat.deleteSummary(session.id, index);
      onUpdate();
      setShowDeleteSummaryModal(null);
    } catch (error) {
      console.error('Failed to delete summary:', error);
      // Optionally show error message to user
      // setError('Failed to delete summary');
    }
  };

  const handleNewSummaryClick = () => {
    setShowNewSummaryForm(true);
  };

  const handleDeleteSession = async () => {
    try {
      setIsDeleting(true);
      await api.chat.deleteSession(session.id);
      onDelete();
    } catch (error) {
      console.error('Failed to delete session:', error);
      // Could add error state and display if needed
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleUpdateSummary = async (index: number, data: PartialSummaryUpdate) => {
    try {
      await api.chat.updateSummary(session.id, index, data);
      onUpdate();
      setEditingSummary(null);
    } catch (error) {
      console.error('Failed to update summary:', error);
      // Could show error message to user
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {isEditingTitle ? (
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-3 py-2 border ${
                  titleError ? 'border-red-500' : 'border-gray-300'
                } dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700`}
                autoFocus
              />
              {titleError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {titleError}
                </p>
              )}
            </div>
            <button
              onClick={handleTitleUpdate}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => {
                setTitle(session.title);
                setIsEditingTitle(false);
              }}
              className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-md"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{session.title}</h2>
            <button
              onClick={() => setIsEditingTitle(true)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete Session
          </button>
          <button
            onClick={() => setShowMetaModal(true)}
            disabled={isGeneratingMeta || session.summaries.length === 0}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            {isGeneratingMeta ? 'Generating...' : 'Generate Meta Summary'}
          </button>
          <button
            onClick={() => setShowNewSummaryForm(true)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            New Summary
          </button>
        </div>
      </div>

      {/* Meta Summary Parameters Modal */}
      {showMetaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Meta Summary Parameters
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Minimum Length (100-1000)
                </label>
                <input
                  type="number"
                  min="100"
                  max="1000"
                  value={parameters.min_length}
                  onChange={(e) => setParameters(prev => ({
                    ...prev,
                    min_length: Number(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Maximum Length (300-1000)
                </label>
                <input
                  type="number"
                  min="300"
                  max="1000"
                  value={parameters.max_length}
                  onChange={(e) => setParameters(prev => ({
                    ...prev,
                    max_length: Number(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowMetaModal(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleMetaSummarize}
                disabled={parameters.min_length >= parameters.max_length}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewSummaryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Create New Summary
            </h3>
            <NewSummaryForm
              sessionId={session.id}
              onSuccess={() => {
                setShowNewSummaryForm(false);
                onUpdate();
              }}
              onCancel={() => setShowNewSummaryForm(false)}
            />
          </div>
        </div>
      )}

      {session.meta_summary && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
            Meta Summary
          </h3>
          <p className="text-green-700 dark:text-green-200">
            {session.meta_summary}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Summaries</h3>
        {session.summaries.map((summary, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            {editingSummary?.index === index ? (
              <div className="p-4">
                <textarea
                  value={editingSummary.text ?? summary.original_text}
                  onChange={(e) => setEditingSummary(prev => ({
                    ...prev!,
                    text: e.target.value
                  }))}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 mb-4"
                  rows={5}
                />
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm mb-1">Min Length</label>
                    <input
                      type="number"
                      value={editingSummary.parameters?.min_length ?? summary.parameters.min_length}
                      onChange={(e) => setEditingSummary(prev => ({
                        ...prev!,
                        parameters: {
                          ...prev!.parameters ?? summary.parameters,
                          min_length: Number(e.target.value)
                        }
                      }))}
                      className="w-full p-2 border rounded-md dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Max Length</label>
                    <input
                      type="number"
                      value={editingSummary.parameters?.max_length ?? summary.parameters.max_length}
                      onChange={(e) => setEditingSummary(prev => ({
                        ...prev!,
                        parameters: {
                          ...prev!.parameters ?? summary.parameters,
                          max_length: Number(e.target.value)
                        }
                      }))}
                      className="w-full p-2 border rounded-md dark:bg-gray-700"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingSummary(null)}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateSummary(index, {
                      text: editingSummary.text,
                      parameters: editingSummary.parameters
                    })}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Summary #{session.summaries.length - index}
                    </h4>
                    <p className="text-gray-900 dark:text-white mb-4">{summary.summary_text}</p>
                    <details className="text-sm">
                      <summary className="text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                        Show original text
                      </summary>
                      <p className="mt-2 text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                        {summary.original_text}
                      </p>
                    </details>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingSummary({
                        index,
                        text: summary.original_text,
                        parameters: summary.parameters
                      })}
                      className="p-2 text-gray-500 hover:text-blue-600"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setShowDeleteSummaryModal(index)}
                      className="p-2 text-gray-500 hover:text-red-600"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  Created: {new Date(summary.created_at).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        ))}

        {session.summaries.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No summaries yet. Create your first one!</p>
          </div>
        )}
      </div>

      {/* Delete Summary Confirmation Modal */}
      {showDeleteSummaryModal !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Delete Summary
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Are you sure you want to delete this summary? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteSummaryModal(null)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSummary(showDeleteSummaryModal)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Session Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Delete Chat Session
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Are you sure you want to delete this chat session? This action cannot be undone 
              and all summaries will be permanently deleted.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSession}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
