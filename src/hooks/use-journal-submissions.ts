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
      
      console.log('Hook: Tentative de soumission avec les données:', JSON.stringify(submission, null, 2));
      
      // Vérifier que les données minimales sont présentes
      if (!submission.userId) {
        throw new Error('ID utilisateur manquant');
      }
      
      if (!submission.journalId) {
        throw new Error('ID journal manquant');
      }
      
      if (!submission.responses || submission.responses.length === 0) {
        throw new Error('Les réponses du journal sont vides');
      }
      
      const response = await fetch('/api/journal-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      });
      
      // Convertir d'abord en texte pour pouvoir le logger en cas d'erreur
      const responseText = await response.text();
      console.log('Hook: Réponse brute de l\'API:', responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Hook: Erreur lors du parsing de la réponse JSON:', e);
        throw new Error(`Réponse non-JSON reçue: ${responseText}`);
      }
      
      if (!response.ok) {
        console.error('Hook: Erreur API détails:', responseData);
        throw new Error(responseData.error || 'Échec de la soumission du journal');
      }
      
      console.log('Hook: Soumission réussie, ID:', responseData.id);
      return responseData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de la soumission du journal';
      setError(errorMessage);
      console.error('Hook: Erreur lors de la soumission du journal:', err);
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