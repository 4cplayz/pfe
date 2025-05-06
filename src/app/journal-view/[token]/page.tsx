// src/app/journal-view/[token]/page.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
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
import { useToast } from '@/components/ui/use-toast';
import { useJournalSubmissions } from '@/hooks/use-journal-submissions';
import { CreateJournalSubmission, SectionResponse } from '@/types/journal-submission';
import DynamicSvg from '@/components/ux/dynamicSvg';
import { useIsMobile } from '@/hooks/use-mobile';

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
  id?: string; // Add user ID
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
  const { toast } = useToast();
  const { submitJournal, loading: submissionLoading, error: submissionError } = useJournalSubmissions();

  // Form states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [activeJournal, setActiveJournal] = useState<ActiveJournal | null>(null);
  const [loadingJournal, setLoadingJournal] = useState(false);
  const [formResponses, setFormResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMobile = useIsMobile();

  // For tracking time
  const startTimeRef = useRef<Date>(new Date());

  useEffect(() => {
    // Retrieve user info from session storage
    const storedUserInfo = sessionStorage.getItem('currentUser');

    if (!storedUserInfo) {
      setError('Session expirée ou non autorisée. Veuillez scanner à nouveau.');
      setLoading(false);
      return;
    }

    try {
      const parsedUserInfo = JSON.parse(storedUserInfo) as UserInfo;

      // Verify the token matches
      if (parsedUserInfo.token !== token) {
        setError('Token invalide. Veuillez scanner à nouveau.');
        setLoading(false);
        return;
      }

      // Set start time for the journal session
      startTimeRef.current = new Date();

      setUserInfo(parsedUserInfo);

      // Fetch the active journal first
      fetchActiveJournal();

      // Ensuite, assurez-vous que l'ID utilisateur est disponible
      const fetchUserIdAndUpdate = async () => {
        try {
          if (!parsedUserInfo.id) {
            console.log("L'ID utilisateur n'est pas présent dans la session, récupération depuis l'API...");
            // Si l'ID utilisateur n'est pas présent, récupérez-le
            const userId = await fetchUserId(parsedUserInfo.matricule);

            if (!userId) {
              console.error("Impossible de récupérer l'ID utilisateur");
              setError("Impossible de récupérer les informations utilisateur. Veuillez scanner à nouveau.");
            }
          } else {
            console.log("ID utilisateur déjà présent dans la session:", parsedUserInfo.id);
          }
        } catch (err) {
          console.error("Erreur lors de la récupération de l'ID utilisateur:", err);
          setError("Une erreur est survenue lors de la récupération des informations utilisateur.");
        } finally {
          setLoading(false);
        }
      };

      fetchUserIdAndUpdate();
    } catch (err) {
      console.error("Erreur lors du parsing des infos utilisateur:", err);
      setError('Une erreur est survenue. Veuillez scanner à nouveau.');
      setLoading(false);
    }
  }, [token]);

  const fetchUserId = async (matricule: string) => {
    try {
      console.log('Récupération de l\'ID utilisateur pour le matricule:', matricule);
      const response = await fetch(`/api/validate-user?matricule=${matricule}`);

      if (!response.ok) {
        console.error('Erreur API lors de la récupération de l\'ID utilisateur:', response.status);
        throw new Error('Failed to fetch user ID');
      }

      const data = await response.json();
      console.log('Données utilisateur reçues:', data);

      if (data.exists) {
        // Créez un nouvel objet avec toutes les données nécessaires
        const updatedUserInfo = {
          id: data.id,
          matricule: data.matricule,
          name: data.name,
          accessLevel: data.accessLevel,
          isActive: data.isActive,
          token: userInfo?.token || '' // Gardez le token existant
        };

        console.log('Mise à jour des infos utilisateur avec ID:', updatedUserInfo);

        // Mettre à jour l'état avec le nouvel objet complet
        setUserInfo(updatedUserInfo);

        // Mettre à jour le session storage
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUserInfo));

        return data.id;
      } else {
        console.error('Utilisateur non trouvé pour ce matricule');
        throw new Error('User not found');
      }
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'ID utilisateur:', err);
      return null;
    }
  };

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

      // Initialize form responses with empty values for each section
      if (data.sections) {
        const initialResponses: Record<string, any> = {};

        console.log("Initialisation des réponses du formulaire pour les sections:", data.sections);

        data.sections.forEach((section: JournalSection) => {
          if (section.enabled) {
            console.log(`Initialisation de la section ${section.id} (${section.title}) de type ${section.type}`);

            if (section.type === SectionType.VERIFICATION) {
              // Pour les sections de vérification, initialiser les deux cases à cocher
              initialResponses[`${section.id}-ouverture`] = false;
              initialResponses[`${section.id}-fermeture`] = false;

              console.log(`- Champs 'ouverture' et 'fermeture' initialisés à false`);
            } else {
              // Pour les autres types de sections avec champ texte
              initialResponses[section.id] = '';
              console.log(`- Champ de texte initialisé à une chaîne vide`);
            }
          }
        });

        console.log("État initial du formulaire:", initialResponses);
        setFormResponses(initialResponses);
      }
    } catch (err) {
      console.error('Error fetching active journal:', err);
      setError('Impossible de charger le journal actif.');
    } finally {
      setLoadingJournal(false);
    }
  };

  const handleInputChange = (sectionId: string, value: string | boolean, subField?: string) => {
    setFormResponses(prev => {
      if (subField) {
        // For checkbox fields like verification sections
        return {
          ...prev,
          [`${sectionId}-${subField}`]: value
        };
      } else {
        // For text fields
        return {
          ...prev,
          [sectionId]: value
        };
      }
    });
  };

  const handleSubmitJournal = async () => {
    // Validation préliminaire avec logs détaillés pour le débogage
    console.log("Tentative de soumission du journal...");
    console.log("Informations utilisateur:", userInfo);
    console.log("Journal actif:", activeJournal);

    // Si l'ID utilisateur n'est pas disponible, essayez de le récupérer une dernière fois
    if (!userInfo?.id && userInfo?.matricule) {
      console.log("L'ID utilisateur est manquant, tentative de récupération...");
      const userId = await fetchUserId(userInfo.matricule);
      if (!userId) {
        console.error("Échec de la dernière tentative de récupération de l'ID utilisateur");
      }
    }

    if (!userInfo?.id) {
      console.error("ID utilisateur manquant pour la soumission");
      toast({
        title: "Erreur",
        description: "ID utilisateur manquant. Veuillez rafraîchir la page et réessayer.",
        variant: "destructive"
      });
      return;
    }

    if (!activeJournal) {
      console.error("Journal actif manquant pour la soumission");
      toast({
        title: "Erreur",
        description: "Journal actif manquant. Veuillez rafraîchir la page et réessayer.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Format responses for submission
      const sectionResponses = activeJournal.sections
        .filter(section => section.enabled)
        .map(section => {
          if (section.type === SectionType.VERIFICATION) {
            return {
              sectionId: section.id,
              type: section.type as SectionType,
              title: section.title,
              checkboxes: {
                ouverture: !!formResponses[`${section.id}-ouverture`],
                fermeture: !!formResponses[`${section.id}-fermeture`]
              }
            };
          } else {
            return {
              sectionId: section.id,
              type: section.type as SectionType,
              title: section.title,
              content: formResponses[section.id] || ''
            };
          }
        });

      // Create submission data
      const submissionData = {
        userId: userInfo.id, // Assurez-vous que ceci est une chaîne valide
        journalId: activeJournal.id,
        responses: sectionResponses,
        startTime: startTimeRef.current,
        endTime: new Date()
      };

      console.log('Soumission du journal avec données:', JSON.stringify(submissionData, null, 2));

      // Submit the journal
      const result = await submitJournal(submissionData);

      if (result) {
        toast({
          title: "Journal soumis avec succès",
          description: "Votre soumission a été enregistrée."
        });

        // Redirect to a success page or back to home after a brief delay
        setTimeout(() => {
          router.push('/journal-view/thanks');
        }, 2000);
      } else {
        throw new Error("La soumission a échoué");
      }
    } catch (err) {
      console.error('Error submitting journal:', err);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la soumission du journal: " +
          (err instanceof Error ? err.message : "Erreur inconnue"),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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

  const getFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('fr-CA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getFormattedDate = () => {
    const now = new Date();
    return now.toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          <div className="flex items-center space-x-2">
            <DynamicSvg />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground sm:block hidden" />
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
            <CardHeader className="pb-4 border-b ">
              <div className="flex justify-between flex-col-reverse gap-4 items-start">
                <div className=' w-full'>
                  <CardTitle className="text-xl flex items-center gap-2 sm:flex-row flex-col-reverse">
                    {activeJournal.title}

                  </CardTitle>
                  {activeJournal.description && (
                    <CardDescription className="mt-1">
                      {activeJournal.description}
                    </CardDescription>
                  )}
                </div>
                <div className="sm:text-sm text-xs text-end text-muted-foreground items-center flex justify-between gap-2 w-full">
                  {activeJournal.isActive && (
                    <span className="bg-primary/10 text-primary max-h-5 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Actif
                    </span>
                  )}
                  Dernière mise à jour: {formatDate(activeJournal.updatedAt)}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Journal Header */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 ">
                    <Label className="text-xs text-muted-foreground">Date</Label>
                    {isMobile ? 
                    <div className=' border bg-input/30 border-border flex items-center rounded-lg py-1 px-2'>{getFormattedDate()}</div>
                    :
                    <Input value={getFormattedDate()} readOnly />
                    }
                  </div>
                  <div className="space-y-1 ">
                    <Label className="text-xs text-muted-foreground">Heure de début</Label>

                    {isMobile ? 
                    <div className=' border bg-input/30 border-border flex items-center rounded-lg py-1 px-2'>{getFormattedTime()}</div>
                    :
                    <Input value={getFormattedTime()} readOnly />
                    }
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
                                  checked={!!formResponses[`${section.id}-ouverture`]}
                                  onCheckedChange={(checked) =>
                                    handleInputChange(section.id, checked === true, 'ouverture')
                                  }
                                />
                                <Label htmlFor={`ouverture-${section.id}`}>Ouverture alimentée</Label>
                              </div>
                              <div className="flex items-start space-x-2">
                                <Checkbox
                                  id={`fermeture-${section.id}`}
                                  disabled={!hasEditPermission()}
                                  checked={!!formResponses[`${section.id}-fermeture`]}
                                  onCheckedChange={(checked) =>
                                    handleInputChange(section.id, checked === true, 'fermeture')
                                  }
                                />
                                <Label htmlFor={`fermeture-${section.id}`}>Fermeture alimentation</Label>
                              </div>
                            </div>
                          )}

                          {section.type === SectionType.MATERIAL && (
                            <div className="space-y-1 ">
                              <Label htmlFor={`material-text-${section.id}`}>Matériel utilisé (description)</Label>
                              <Textarea
                                id={`material-text-${section.id}`}
                                placeholder={hasEditPermission() ? "Description du matériel utilisé" : "Vous n'avez pas les droits d'accès pour modifier ce champ"}
                                readOnly={!hasEditPermission()}
                                className={!hasEditPermission() ? "bg-muted/30 cursor-not-allowed mt-2" : "mt-2"}
                                value={formResponses[section.id] || ''}
                                onChange={(e) => handleInputChange(section.id, e.target.value)}
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
                                className={!hasEditPermission() ? "bg-muted/30 cursor-not-allowed mt-2" : "mt-2"}
                                value={formResponses[section.id] || ''}
                                onChange={(e) => handleInputChange(section.id, e.target.value)}
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
                                className={!hasEditPermission() ? "bg-muted/30 cursor-not-allowed mt-2" : " mt-2"}
                                value={formResponses[section.id] || ''}
                                onChange={(e) => handleInputChange(section.id, e.target.value)}
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
                  
                  {isMobile ? 
                    <div className=' border bg-input/30 border-border flex items-center rounded-lg py-1 px-2'>{getFormattedTime()}</div>
                    :
                    <Input value={getFormattedTime()} readOnly />
                    }
                </div>
                <div></div>
              </div>

              <div className="flex justify-between md:flex-row flex-col items-center gap-2">
                {!hasEditPermission() && (
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 w-full justify-evenly px-2 py-2 rounded-md flex items-center text-yellow-800 dark:text-yellow-400">
                    <LockIcon className="min-h-4 min-w-4 " />
                    <span className="sm:text-sm text-xs text-center">
                      Vous n'avez pas le niveau d'accès requis pour modifier ce journal ({userInfo?.accessLevel} &lt; {activeJournal.accessLevel})
                    </span>
                  </div>
                )}
                <div className="flex flex-1 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLogout}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="button"
                    disabled={!hasEditPermission() || isSubmitting}
                    title={!hasEditPermission() ? "Niveau d'accès insuffisant" : ""}
                    onClick={handleSubmitJournal}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Soumission...
                      </>
                    ) : "Soumettre le journal"}
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