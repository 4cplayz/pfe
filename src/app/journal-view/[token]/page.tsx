'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, User, CheckCircle, CalendarIcon, LockIcon, Layers } from 'lucide-react';
import { ThemeSwitcher } from '@/components/theme/themeSwitcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SectionType } from '@/types/journal';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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

type JournalSection = {
  id: string;
  type: string;
  title: string;
  enabled: boolean;
};

type ActiveJournal = {
  id: string;
  title: string;
  description: string | null;
  accessLevel: string;
  sections: JournalSection[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function JournalViewPage({ params }: JournalViewPageProps) {
  // Unwrap the params Promise using React.use()
  const { token } = React.use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [activeJournal, setActiveJournal] = useState<ActiveJournal | null>(null);
  const [loadingJournal, setLoadingJournal] = useState(false);

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
      
      // Fetch the active journal
      fetchActiveJournal();
    } catch (err) {
      setError('Une erreur est survenue. Veuillez scanner à nouveau.');
      setLoading(false);
    }
  }, [token]);

  const fetchActiveJournal = async () => {
    try {
      setLoadingJournal(true);
      const response = await fetch('/api/journals/active');
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du journal actif');
      }
      
      const data = await response.json();
      console.log('Active journal:', data);
      
      if (!data) {
        // No active journal found
        return;
      }
      
      setActiveJournal(data);
    } catch (err) {
      console.error('Error fetching active journal:', err);
      setError('Impossible de charger le journal actif.');
    } finally {
      setLoadingJournal(false);
    }
  };

  const handleLogout = () => {
    // Clear session storage and redirect to home
    sessionStorage.removeItem('currentUser');
    router.push('/');
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  // Get the current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    return new Intl.DateTimeFormat('fr-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(now);
  };
  
  // Check if user has sufficient permissions to edit the journal
  const hasEditPermission = () => {
    if (!userInfo || !activeJournal) return false;
    
    // Get numeric access levels for comparison
    const accessLevelMap = {
      'ETUDIANT': 1,
      'PROFESSEUR': 2,
      'RESPONSABLE': 3
    };
    
    const userLevel = accessLevelMap[userInfo.accessLevel as keyof typeof accessLevelMap] || 0;
    const journalLevel = accessLevelMap[activeJournal.accessLevel as keyof typeof accessLevelMap] || 0;
    
    // User can edit if their access level is greater than or equal to the journal's required level
    return userLevel >= journalLevel;
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
            <span className="font-semibold">Journal de Bord Numérique</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{userInfo?.name} (#{userInfo?.matricule})</span>
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto py-6 px-4">
        {loadingJournal ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-4" />
            <p>Chargement du journal actif...</p>
          </div>
        ) : activeJournal ? (
          <Card className="shadow-md max-w-3xl mx-auto">
            <CardHeader className="pb-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {activeJournal.title}
                    {activeJournal.isActive && (
                      <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Actif
                      </span>
                    )}
                  </CardTitle>
                  {activeJournal.description && (
                    <CardDescription className="mt-1">
                      {activeJournal.description}
                    </CardDescription>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Dernière mise à jour: {formatDate(activeJournal.updatedAt)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6 pt-6">
              {/* Journal Header */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Date</Label>
                    <Input value={getCurrentDateTime().split(',')[0]} readOnly />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Heure de début</Label>
                    <Input value={getCurrentDateTime().split(',')[1]?.trim()} readOnly />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Nom de l'utilisateur</Label>
                  <Input value={userInfo?.name || ""} readOnly />
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-md">
                  <div className="bg-background p-2 rounded-md shadow-sm">
                    <LockIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Niveau d'accès
                    </p>
                    <p className="text-sm font-medium">{userInfo?.accessLevel}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Journal Sections */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-background p-2 rounded-md shadow-sm">
                    <Layers className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Sections du journal
                    </p>
                  </div>
                </div>

                {activeJournal.sections.filter(s => s.enabled).length > 0 ? (
                  <div className="space-y-6">
                    {activeJournal.sections
                      .filter(s => s.enabled)
                      .map((section) => (
                        <div key={section.id} className="space-y-3">
                          <h4 className="font-medium">{section.title}</h4>

                          {section.type === SectionType.VERIFICATION && (
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-start space-x-2">
                                <Checkbox 
                                  id={`ouverture-${section.id}`} 
                                  disabled={!hasEditPermission()} 
                                />
                                <Label htmlFor={`ouverture-${section.id}`}>Ouverture alimentée</Label>
                              </div>
                              <div className="flex items-start space-x-2">
                                <Checkbox 
                                  id={`fermeture-${section.id}`} 
                                  disabled={!hasEditPermission()} 
                                />
                                <Label htmlFor={`fermeture-${section.id}`}>Fermeture alimentation</Label>
                              </div>
                            </div>
                          )}

                          {section.type === SectionType.MATERIAL && (
                            <div className="space-y-1">
                              <Label htmlFor={`material-text-${section.id}`}>Matériel utilisé (description)</Label>
                              <Textarea
                                id={`material-text-${section.id}`}
                                placeholder={hasEditPermission() ? "Description du matériel utilisé" : "Vous n'avez pas les droits d'accès pour modifier ce champ"}
                                readOnly={!hasEditPermission()}
                                className={!hasEditPermission() ? "bg-muted/30 cursor-not-allowed" : ""}
                              />
                            </div>
                          )}

                          {section.type === SectionType.NOTES && (
                            <div className="space-y-1">
                              <Label htmlFor={`notes-text-${section.id}`}>Prise de note (description)</Label>
                              <Textarea
                                id={`notes-text-${section.id}`}
                                placeholder={hasEditPermission() ? "Entrez vos notes de laboratoire" : "Vous n'avez pas les droits d'accès pour modifier ce champ"}
                                rows={4}
                                readOnly={!hasEditPermission()}
                                className={!hasEditPermission() ? "bg-muted/30 cursor-not-allowed" : ""}
                              />
                            </div>
                          )}

                          {section.type === SectionType.COMMENT && (
                            <div className="space-y-1">
                              <Label htmlFor={`comment-text-${section.id}`}>Autre (description)</Label>
                              <Textarea
                                id={`comment-text-${section.id}`}
                                placeholder={hasEditPermission() ? "Entrez vos commentaires supplémentaires" : "Vous n'avez pas les droits d'accès pour modifier ce champ"}
                                readOnly={!hasEditPermission()}
                                className={!hasEditPermission() ? "bg-muted/30 cursor-not-allowed" : ""}
                              />
                            </div>
                          )}

                          <Separator />
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <p>Aucune section n'est activée dans ce journal</p>
                  </div>
                )}
              </div>

              {/* Journal Footer */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Temps de fin</Label>
                  <Input placeholder="Sera rempli automatiquement" disabled />
                </div>
                <div></div>
              </div>

              <div className="flex justify-between items-center gap-4 pt-4">
                {!hasEditPermission() && (
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-md flex items-center text-yellow-800 dark:text-yellow-400">
                    <LockIcon className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      Vous n'avez pas le niveau d'accès requis pour modifier ce journal ({userInfo?.accessLevel} &lt; {activeJournal.accessLevel})
                    </span>
                  </div>
                )}
                <div className="flex-1 flex justify-end gap-4">
                  <Button type="button" variant="outline">
                    Annuler
                  </Button>
                  <Button 
                    type="button" 
                    disabled={!hasEditPermission()}
                    title={!hasEditPermission() ? "Niveau d'accès insuffisant" : ""}
                  >
                    Soumettre le journal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-md max-w-3xl mx-auto text-center py-8">
            <CardContent>
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="bg-muted/40 p-6 rounded-full mb-2">
                  <BookOpen className="h-12 w-12 text-muted-foreground/70" />
                </div>
                <h3 className="text-xl font-semibold">Aucun journal actif trouvé</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Il n'y a actuellement aucun journal actif dans le système. Veuillez contacter votre administrateur pour activer un journal.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}