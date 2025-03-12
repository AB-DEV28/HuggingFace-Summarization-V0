import { useState } from 'react';
import { api } from '@/lib/api';

interface NewSummaryFormProps {
  sessionId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function NewSummaryForm({ sessionId, onSuccess, onCancel }: NewSummaryFormProps) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [parameters, setParameters] = useState({
    min_length: 50,
    max_length: 200,
    do_sample: false
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (!text || text.length < 100) {
        throw new Error('Text must be at least 100 characters long');
      }

      await api.chat.createSummary(sessionId, text, parameters);
      setText('');
      onSuccess();
    } catch (err) {
      console.error('Failed to create summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to create summary. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Text to Summarize
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 min-h-[200px]"
          placeholder="Enter text to summarize (minimum 100 characters)"
          required
        />
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Minimum Length
            </label>
            <input
              type="number"
              value={parameters.min_length}
              onChange={(e) => setParameters(prev => ({
                ...prev,
                min_length: Math.max(10, Math.min(1000, Number(e.target.value)))
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
              min="10"
              max="1000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Maximum Length
            </label>
            <input
              type="number"
              value={parameters.max_length}
              onChange={(e) => setParameters(prev => ({
                ...prev,
                max_length: Math.max(50, Math.min(1000, Number(e.target.value)))
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
              min="50"
              max="1000"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={parameters.do_sample}
              onChange={(e) => setParameters(prev => ({
                ...prev,
                do_sample: e.target.checked
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Enable sampling during generation
            </span>
          </label>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || text.length < 100 || parameters.min_length >= parameters.max_length}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Creating...' : 'Create Summary'}
        </button>
      </div>
    </form>
  );
}
