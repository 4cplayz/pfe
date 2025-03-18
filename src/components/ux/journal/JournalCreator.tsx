"use client";

import { useState } from "react";
import { Journal, SectionType } from "@/types/journal";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, FileText } from "lucide-react";

interface JournalCreatorProps {
  journal: Journal;
  onChange: (journal: Journal) => void;
  onSave: (journal: Journal) => void;
  mode: 'view' | 'create' | 'edit';
}

export function JournalCreator({
  journal,
  onChange,
  onSave,
  mode
}: JournalCreatorProps) {
  const isEditing = mode === 'create' || mode === 'edit';

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...journal, title: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...journal, description: e.target.value });
  };

  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...journal, permission: e.target.value });
  };

  const handleSectionToggle = (sectionId: string, checked: boolean) => {
    const updatedSections = journal.sections.map(section =>
      section.id === sectionId ? { ...section, enabled: checked } : section
    );
    onChange({ ...journal, sections: updatedSections });
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Créateur de Journal
        </CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Créez un nouveau journal de bord en sélectionnant les sections requises'
            : mode === 'edit'
              ? 'Modifiez le journal de bord sélectionné'
              : 'Sélectionnez un journal existant ou créez-en un nouveau'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre:</Label>
              <Input
                id="title"
                value={journal.title}
                onChange={handleTitleChange}
                placeholder="Entrez le titre du journal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description:</Label>
              <Textarea
                id="description"
                value={journal.description}
                onChange={handleDescriptionChange}
                placeholder="Décrivez brièvement le but de ce journal"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="permission">Permission:</Label>
              <Input
                id="permission"
                value={journal.permission}
                onChange={handlePermissionChange}
                placeholder="Groupe d'utilisateurs autorisés"
              />
            </div>

            <div className="space-y-2 pt-2">
              <Label>Sections du journal:</Label>
              <div className="grid grid-cols-1 gap-3">
                {journal.sections.map((section) => (
                  <div key={section.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={`section-${section.id}`}
                      checked={section.enabled}
                      onCheckedChange={(checked) =>
                        handleSectionToggle(section.id, checked === true)
                      }
                    />
                    <Label
                      htmlFor={`section-${section.id}`}
                      className="leading-none pt-0.5"
                    >
                      {section.title}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>Sélectionnez "Créer" dans le carousel pour créer un nouveau journal</p>
            <p>ou sélectionnez un journal existant et cliquez sur "Modifier"</p>
          </div>
        )}
      </CardContent>

      {isEditing && (
        <CardFooter className="border-t pt-4">
          <Button
            onClick={() => onSave(journal)}
            disabled={!journal.title}
            className="ml-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            {mode === 'create' ? 'Créer' : 'Enregistrer'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}