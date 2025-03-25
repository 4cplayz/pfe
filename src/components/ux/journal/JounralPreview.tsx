"use client";

import { useMemo } from "react";
import { Journal, SECTION_FIELDS, SectionType } from "@/types/journal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye } from "lucide-react";

interface JournalPreviewProps {
  journal: Journal | null;
}

export function JournalPreview({ journal }: JournalPreviewProps) {
  // Utiliser useMemo pour éviter les re-rendus inutiles
  const enabledSections = useMemo(() => {
    return journal?.sections.filter(section => section.enabled) || [];
  }, [journal?.sections]);

  if (!journal) {
    return (
      <Card className="h-full shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visualisation du sondage
          </CardTitle>
          <CardDescription>
            Sélectionnez un journal pour le prévisualiser
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Aucun journal sélectionné</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Visualisation du sondage
        </CardTitle>
        <CardDescription>
          Aperçu du journal de bord tel qu'il apparaîtra aux utilisateurs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 ">
        {/* Journal Header */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{journal.title || "Sans titre"}</h3>
            {journal.description && (
              <p className="text-muted-foreground text-sm">{journal.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Date</Label>
              <Input disabled placeholder="Date actuelle" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Temps de début</Label>
              <Input disabled placeholder="Heure actuelle" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Nom de l'utilisateur</Label>
            <Input disabled placeholder="Nom de l'utilisateur connecté" />
          </div>
        </div>

        <Separator />

        {/* Journal Sections */}
        {enabledSections.length > 0 ? (
          enabledSections.map((section) => (
            <div key={section.id} className="space-y-3">
              <h4 className="font-medium">{section.title}</h4>

              {section.type === SectionType.VERIFICATION && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox id={`ouverture-${section.id}`} disabled />
                    <Label htmlFor={`ouverture-${section.id}`}>Ouverture alimentée</Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox id={`fermeture-${section.id}`} disabled />
                    <Label htmlFor={`fermeture-${section.id}`}>Fermeture alimentation</Label>
                  </div>
                </div>
              )}

              {section.type === SectionType.MATERIAL && (
                <div className="space-y-1">
                  <Label htmlFor={`material-text-${section.id}`}>Matériel utilisé (description)</Label>
                  <Textarea
                    id={`material-text-${section.id}`}
                    placeholder="Description du matériel utilisé"
                    disabled
                  />
                </div>
              )}

              {section.type === SectionType.NOTES && (
                <div className="space-y-1">
                  <Label htmlFor={`notes-text-${section.id}`}>Prise de note (description)</Label>
                  <Textarea
                    id={`notes-text-${section.id}`}
                    placeholder="Entrez vos notes de laboratoire"
                    disabled
                  />
                </div>
              )}

              {section.type === SectionType.COMMENT && (
                <div className="space-y-1">
                  <Label htmlFor={`comment-text-${section.id}`}>Autre (description)</Label>
                  <Textarea
                    id={`comment-text-${section.id}`}
                    placeholder="Entrez vos commentaires supplémentaires"
                    disabled
                  />
                </div>
              )}

              <Separator />
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>Aucune section activée dans ce journal</p>
          </div>
        )}

        {/* Journal Footer */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Temps de fin</Label>
            <Input disabled placeholder="Heure de fin" />
          </div>
          <div></div>
        </div>
      </CardContent>
    </Card>
  );
}