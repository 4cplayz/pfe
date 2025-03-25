'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, User } from 'lucide-react';
import { ThemeSwitcher } from '@/components/theme/themeSwitcher';

interface JournalViewPageProps {
  params: Promise<{
    token: string;
  }>;
}

type UserInfo = {
  matricule: string;
  name: string;
  accessLevel: string;
  token: string;
};

export default function JournalViewPage({ params }: JournalViewPageProps) {
  // Unwrap the params Promise using React.use()
  const { token } = React.use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    // Retrieve user info from session storage
    const storedUserInfo = sessionStorage.getItem('currentUser');
    
    if (!storedUserInfo) {
      setError('Session expirée ou non autorisée. Veuillez scanner à nouveau.');
      setLoading(false);
      return;
    }
    
    try {
      const userInfo = JSON.parse(storedUserInfo) as UserInfo;
      
      // Verify the token matches
      if (userInfo.token !== token) {
        setError('Token invalide. Veuillez scanner à nouveau.');
        setLoading(false);
        return;
      }
      
      setUserInfo(userInfo);
      setLoading(false);
    } catch (err) {
      setError('Une erreur est survenue. Veuillez scanner à nouveau.');
      setLoading(false);
    }
  }, [token]);

  const handleLogout = () => {
    // Clear session storage and redirect to home
    sessionStorage.removeItem('currentUser');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Chargement de votre journal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-md text-center">
          <h1 className="mb-4 text-xl font-bold text-destructive">Erreur</h1>
          <p className="mb-6">{error}</p>
          <Button onClick={() => router.push('/')}>Retour à l'accueil</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur px-4 py-3 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
        
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{userInfo?.name} (#{userInfo?.matricule})</span>
            </div>
            {/** 
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Déconnexion
            </Button>
            */}
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto p-6">
        <div className="bg-card border rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Visualiseur de Journal</h2>
          <p className="text-lg mb-6">Cette page est un exemple de visualiseur de journal.</p>
          <div className="p-4 bg-muted rounded-md mb-6">
            <p><strong>Niveau d'accès:</strong> {userInfo?.accessLevel}</p>
            <p className="text-muted-foreground mt-2">Le contenu du journal sera affiché ici selon les autorisations.</p>
          </div>
          <p className="text-muted-foreground text-sm">
            Ceci est une page placeholder qui montre que l'authentification a réussi.
            Le contenu réel du journal sera implémenté ultérieurement.
          </p>
        </div>
      </main>
    </div>
  );
}