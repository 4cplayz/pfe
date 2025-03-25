'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface TokenPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default function TokenPage({ params }: TokenPageProps) {
  // Unwrap the params Promise using React.use()
  const { token } = React.use(params);
  const router = useRouter();

  const [studentId, setStudentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Submitting matricule:', studentId);
      
      // Validate the student ID with our backend
      const response = await fetch(`/api/validate-user?matricule=${studentId}`);
      const responseText = await response.text();
      
      console.log('API Response status:', response.status);
      console.log('API Response text:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        throw new Error('Invalid response from server');
      }
      
      if (!response.ok) {
        console.error('API error:', data);
        throw new Error(data.error || 'Authentication failed');
      }

      console.log('Parsed response data:', data);
      
      if (!data.exists) {
        console.log('User does not exist in database');
        setError("Cet identifiant matricule n'existe pas dans notre système.");
        return;
      }

      // User exists, save ALL user information including ID to session storage
      sessionStorage.setItem('currentUser', JSON.stringify({
        id: data.id, // Make sure to save the user ID
        matricule: studentId,
        name: data.name,
        accessLevel: data.accessLevel,
        token: token
      }));

      // Redirect to journal viewer page
      router.push(`/journal-view/${token}`);
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-md">
        <h1 className="mb-4 text-xl font-bold">Authentification Étudiant</h1>
        <p className="mb-6">
          Pour accéder à votre journal de bord numérique, veuillez entrer votre numéro matricule à 7 chiffres.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="studentId" className="mb-2 block text-sm font-medium">
              Numéro Matricule
            </label>
            <Input
              type="text"
              id="studentId"
              placeholder="1234567"
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
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vérification...
              </>
            ) : 'Continuer'}
          </Button>
        </form>
      </div>
    </div>
  );
}