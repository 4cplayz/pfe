"use client";

import { useRef, useState } from "react";
import { Journal } from "@/types/journal";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenLine, Trash2, ChevronLeft, ChevronRight, Plus } from "lucide-react";

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
  const carouselRef = useRef<HTMLDivElement>(null);

  // Navigate through carousel
  const nextJournal = () => {
    if (currentIndex < journals.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevJournal = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Select a journal from the carousel
  const handleSelect = () => {
    if (journals.length > 0) {
      onSelect(journals[currentIndex]);
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
    <Card className="shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Carousel de Journal</CardTitle>
        <CardDescription>
          Sélectionnez un journal de bord existant ou créez-en un nouveau
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div ref={carouselRef} className="overflow-hidden">
            <div className="flex items-center justify-center">
              {journals.length > 0 ? (
                <div className="w-full">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">{journals[currentIndex].title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{journals[currentIndex].description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Permission:</span> {journals[currentIndex].permission}
                    </div>
                    <div>
                      <span className="font-medium">Créé le:</span> {formatDate(journals[currentIndex].createdAt)}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Sections actives:</span>{" "}
                      {journals[currentIndex].sections.filter(s => s.enabled).map(s => s.title).join(", ")}
                    </div>
                  </div>

                  <div className="flex justify-center mt-4 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentIndex === 0}
                      onClick={prevJournal}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="flex items-center px-2 text-sm">
                      {currentIndex + 1} / {journals.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentIndex === journals.length - 1}
                      onClick={nextJournal}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Aucun journal disponible</p>
                  <Button variant="outline" onClick={onCreateNew} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un journal
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {journals.length > 0 && (
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="space-x-2">
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Créer
            </Button>
            <Button
              variant={journals[currentIndex].id === selectedJournalId ? "secondary" : "outline"}
              onClick={handleSelect}
            >
              Sélectionner
            </Button>
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(journals[currentIndex])}
              title="Modifier"
            >
              <PenLine className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => {
                if (confirm("Êtes-vous sûr de vouloir supprimer ce journal?")) {
                  onDelete(journals[currentIndex].id);
                }
              }}
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}