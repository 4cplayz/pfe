"use client";

import { useRef, useState, useEffect } from "react";
import { Journal } from "@/types/journal";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenLine, Trash2, ChevronLeft, ChevronRight, Plus, Calendar, Lock, BookOpen, Layers, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface JournalBrowserProps {
  journals: Journal[];
  selectedJournalId?: string | null;
  onSelect: (journal: Journal) => void;
  onEdit: (journal: Journal) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
}

export function JournalBrowser({
  journals,
  selectedJournalId,
  onSelect,
  onEdit,
  onDelete,
  onCreateNew
}: JournalBrowserProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [hasJournals, setHasJournals] = useState(journals.length > 0);
  
  // Track previous journal length to éviter les mises à jour superflues
  const prevJournalsLengthRef = useRef<number>(journals.length);
  const hasInitialized = useRef<boolean>(false);

  useEffect(() => {
    // Mettre à jour si le nombre de journaux a changé
    if (prevJournalsLengthRef.current !== journals.length) {
      setHasJournals(journals.length > 0);
      prevJournalsLengthRef.current = journals.length;
    }
    
    // Ne cherche le journal actif que lors du montage initial ou si le nombre de journaux a changé
    if (!hasInitialized.current && journals.length > 0) {
      const activeIndex = journals.findIndex(journal => journal.isActive);
      if (activeIndex !== -1) {
        setCurrentIndex(activeIndex);
      }
      hasInitialized.current = true;
    }
  }, [journals]);

  // Navigate through carousel
  const nextJournal = () => {
    if (currentIndex < journals.length - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevJournal = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Select a journal from the carousel
  const handleSelect = () => {
    if (journals.length > 0) {
      // Ne sélectionne pas si déjà actif, pour éviter les appels API inutiles
      if (!journals[currentIndex].isActive) {
        onSelect(journals[currentIndex]);
      }
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Card className="shadow-lg ">
      <CardHeader className="pb-2 bg-muted/30">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold flex items-center  gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Bibliothèque de Journaux
            </CardTitle>
            <CardDescription className="mt-1">
              Parcourez et gérez votre collection de journaux de bord
            </CardDescription>
          </div>
          <Button onClick={onCreateNew} className="shadow-sm flex items-center" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            <p className="flex text-center">
              Nouveau
            </p>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          <div ref={carouselRef} className="p-6">
            {hasJournals && journals.length > 0 ? (
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: direction * 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -direction * 20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <div className="bg-accent/30 p-5 rounded-lg border border-border/50 relative overflow-hidden">
                    {/* Badge pour indiquer si le journal est actif */}
                    {journals[currentIndex]?.isActive && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Actif
                      </div>
                    )}

                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-primary/90">{journals[currentIndex]?.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{journals[currentIndex]?.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-background p-2 rounded-md shadow-sm">
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Permission</p>
                          <p className="text-sm font-medium">{journals[currentIndex]?.permission}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-background p-2 rounded-md shadow-sm">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Créé le</p>
                          <p className="text-sm font-medium">{formatDate(journals[currentIndex]?.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-start gap-3">
                      <div className="bg-background p-2 rounded-md shadow-sm mt-0.5">
                        <Layers className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sections activées</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {journals[currentIndex]?.sections.filter(s => s.enabled).length > 0 ? (
                            journals[currentIndex].sections
                              .filter(s => s.enabled)
                              .map(s => (
                                <div key={s.id} className="bg-secondary px-3 py-1 rounded-full text-xs font-medium text-secondary-foreground shadow-sm">
                                  {s.title}
                                </div>
                              ))
                          ) : (
                            <p className="text-sm text-muted-foreground italic">Aucune section activée</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Carousel Navigation */}
                  <div className="flex justify-center items-center mt-6 gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full h-9 w-9 shadow-sm"
                      disabled={currentIndex === 0}
                      onClick={prevJournal}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>

                    <div className="flex items-center gap-1.5">
                      {journals.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setDirection(index > currentIndex ? 1 : -1);
                            setCurrentIndex(index);
                          }}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentIndex
                              ? "bg-primary w-4"
                              : journals[index].isActive
                                ? "bg-primary/40 w-3"
                                : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
                          }`}
                          aria-label={`Go to journal ${index + 1}`}
                        />
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full h-9 w-9 shadow-sm"
                      disabled={currentIndex === journals.length - 1}
                      onClick={nextJournal}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="bg-muted/40 p-6 rounded-full mb-4">
                  <BookOpen className="h-10 w-10 text-muted-foreground/70" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Bibliothèque vide</h3>
                <p className="text-muted-foreground max-w-xs mb-6">
                  Vous n'avez pas encore créé de journal de bord. Commencez par créer votre premier journal.
                </p>
                <Button onClick={onCreateNew} className="shadow-md">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer mon premier journal
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {hasJournals && journals.length > 0 && (
        <CardFooter className="flex justify-between border-t p-4 bg-muted/20">
          <Button
            variant={journals[currentIndex]?.isActive ? "secondary" : "default"}
            onClick={handleSelect}
            className="shadow-sm"
            // Désactiver le bouton si déjà actif pour éviter les mises à jour inutiles
            disabled={journals[currentIndex]?.isActive === true}
          >
            {journals[currentIndex]?.isActive ? "Journal Actif" : "Activer"}
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(journals[currentIndex])}
              title="Modifier"
              className="rounded-md h-9 w-9 shadow-sm hover:bg-primary/10 hover:text-primary"
            >
              <PenLine className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (confirm("Êtes-vous sûr de vouloir supprimer ce journal?")) {
                  onDelete(journals[currentIndex].id);
                }
              }}
              title="Supprimer"
              className="rounded-md h-9 w-9 shadow-sm hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}