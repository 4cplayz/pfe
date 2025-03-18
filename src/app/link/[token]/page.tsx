'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface TokenPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default function TokenPage({ params }: TokenPageProps) {
  // Unwrap the params Promise using React.use()
  const { token } = React.use(params);

  const [studentId, setStudentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would validate the student ID with your backend
      console.log(`Student ID ${studentId} submitted with token ${token}`);

      // Redirect or show success message
      setError(null);
      alert(`Successfully authenticated with student ID: ${studentId}`);

    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-md">
        <h1 className="mb-4 text-xl font-bold">Student Authentication</h1>
        <p className="mb-6">
          To access your digital journal, please enter your 7-digit student ID (matricule).
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="studentId" className="mb-2 block text-sm font-medium">
              Student ID (Matricule)
            </label>
            <input
              type="text"
              id="studentId"
              className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="7-digit ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              pattern="[0-9]{7}"
              maxLength={7}
              required
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <p className="mb-4 text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || studentId.length !== 7}
          >
            {isSubmitting ? 'Verifying...' : 'Continue'}
          </Button>
        </form>
      </div>
    </div>
  );
}