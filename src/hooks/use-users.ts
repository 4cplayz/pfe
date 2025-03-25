import { useState, useEffect, useCallback } from 'react';

// Type definitions based on your Prisma schema
export type AccessLevel = 'ETUDIANT' | 'PROFESSEUR' | 'RESPONSABLE';

export interface User {
  id: string;
  name: string;
  matricule: string;
  accessLevel: AccessLevel;
  journalsCompleted: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserFormData {
  name: string;
  matricule: string;
  accessLevel: AccessLevel;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all users
  const fetchUsers = useCallback(async (searchQuery?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = searchQuery 
        ? `/api/users?search=${encodeURIComponent(searchQuery)}` 
        : '/api/users';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new user
  const createUser = async (userData: UserFormData) => {
    try {
      setError(null);
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }
      
      const newUser = await response.json();
      setUsers((prevUsers) => [...prevUsers, newUser]);
      
      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error creating user:', err);
      throw err;
    }
  };

  // Update an existing user
  const updateUser = async (id: string, userData: Partial<UserFormData>) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }
      
      const updatedUser = await response.json();
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === id ? updatedUser : user))
      );
      
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating user:', err);
      throw err;
    }
  };

  // Delete a user
  const deleteUser = async (id: string) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
      
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting user:', err);
      throw err;
    }
  };

  // Load users on initial mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
}