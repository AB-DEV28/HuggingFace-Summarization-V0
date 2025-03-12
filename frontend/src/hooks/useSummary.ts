import { useState } from 'react';
import { api, Summary, SummaryParameters } from '@/lib/api';

export function useSummary() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Summary[]>([]);

  const createSummary = async (text: string, parameters?: SummaryParameters) => {
    try {
      setLoading(true);
      setError(null);
      const summary = await api.summary.create(text, parameters);
      setSummaries((prev) => [summary, ...prev]);
      return summary;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create summary');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const history = await api.summary.getHistory();
      setSummaries(history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const deleteSummary = async (summaryIndex: number) => {
    try {
      await api.summary.delete(summaryIndex);
      setSummaries((prev) => prev.filter((_, index) => index !== summaryIndex));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete summary');
    }
  };

  return {
    summaries,
    loading,
    error,
    createSummary,
    loadHistory,
    deleteSummary,
  };
}
