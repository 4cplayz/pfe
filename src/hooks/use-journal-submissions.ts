// src/hooks/use-journal-submissions.ts
import { useState, useCallback } from 'react';
import { CreateJournalSubmission, JournalSubmission, JournalSubmissionWithDetails } from '@/types/journal-submission';

export function useJournalSubmissions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Submit a new journal
  const submitJournal = useCallback(async (submission: CreateJournalSubmission): Promise<JournalSubmission | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/journal-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit journal');
      }
      
      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while submitting the journal';
      setError(errorMessage);
      console.error('Error submitting journal:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a list of journal submissions
  const getSubmissions = useCallback(async (
    userId?: string,
    journalId?: string,
    status?: string
  ): Promise<JournalSubmissionWithDetails[]> => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/api/journal-submissions';
      const params = new URLSearchParams();
      
      if (userId) params.append('userId', userId);
      if (journalId) params.append('journalId', journalId);
      if (status) params.append('status', status);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch journal submissions');
      }
      
      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching submissions';
      setError(errorMessage);
      console.error('Error fetching journal submissions:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a specific journal submission
  const getSubmission = useCallback(async (id: string): Promise<JournalSubmissionWithDetails | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/journal-submissions/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch journal submission');
      }
      
      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching the submission';
      setError(errorMessage);
      console.error('Error fetching journal submission:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    submitJournal,
    getSubmissions,
    getSubmission
  };
}