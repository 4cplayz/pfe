import { useState, useEffect, useCallback } from 'react';
import { JournalDB, CreateJournalData, UpdateJournalData } from '@/types/journal-db';

export function useJournals() {
  const [journals, setJournals] = useState<JournalDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all journals
  const fetchJournals = useCallback(async (searchQuery?: string, accessLevel?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/api/journals';
      const params = new URLSearchParams();
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (accessLevel) {
        params.append('accessLevel', accessLevel);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch journals');
      }
      
      const data = await response.json();
      setJournals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching journals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a specific journal
  const getJournal = async (id: string) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/journals/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch journal');
      }
      
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error getting journal:', err);
      throw err;
    }
  };

  // Create a new journal
  const createJournal = async (journalData: CreateJournalData) => {
    try {
      setError(null);
      
      const response = await fetch('/api/journals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(journalData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create journal');
      }
      
      const newJournal = await response.json();
      setJournals((prevJournals) => [newJournal, ...prevJournals]);
      
      return newJournal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error creating journal:', err);
      throw err;
    }
  };

  // Update an existing journal
  const updateJournal = async (id: string, journalData: UpdateJournalData) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/journals/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(journalData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update journal');
      }
      
      const updatedJournal = await response.json();
      setJournals((prevJournals) =>
        prevJournals.map((journal) => (journal.id === id ? updatedJournal : journal))
      );
      
      return updatedJournal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating journal:', err);
      throw err;
    }
  };

  // Delete a journal
  const deleteJournal = async (id: string) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/journals/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete journal');
      }
      
      setJournals((prevJournals) => prevJournals.filter((journal) => journal.id !== id));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting journal:', err);
      throw err;
    }
  };

  // Load journals on initial mount
  useEffect(() => {
    fetchJournals();
  }, [fetchJournals]);

  return {
    journals,
    loading,
    error,
    fetchJournals,
    getJournal,
    createJournal,
    updateJournal,
    deleteJournal,
  };
}