"use client";

import { useState, useEffect } from "react";
import { JournalBrowser } from "./JournalBrowser";
import { JournalCreator } from "./JournalCreator";
import { JournalPreview } from "./JounralPreview";
import { Journal, SectionType } from "@/types/journal";
import { useJournals } from "@/hooks/use-journals";
import { CreateJournalData } from "@/types/journal-db";
import { useToast } from "@/components/ui/use-toast"; // You'll need to add a toast component

// Initial template for creating a new journal
const EMPTY_JOURNAL: Journal = {
  id: "",
  title: "",
  description: "",
  permission: "",
  sections: [
    { id: "verification", type: SectionType.VERIFICATION, title: "Vérification de ouverture & fermeture", enabled: false },
    { id: "material", type: SectionType.MATERIAL, title: "Nom du matériel utilisé", enabled: false },
    { id: "notes", type: SectionType.NOTES, title: "Section prise de note le labo", enabled: false },
    { id: "comment", type: SectionType.COMMENT, title: "Section Autre commentaire", enabled: false },
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};

export function JournalDashboard() {
  // State management for journals
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [newJournal, setNewJournal] = useState<Journal>({ ...EMPTY_JOURNAL });
  const [mode, setMode] = useState<'view' | 'create' | 'edit'>('view');
  const { toast } = useToast();

  // Use our custom hook for journal operations
  const {
    journals: dbJournals,
    loading,
    error,
    fetchJournals,
    createJournal,
    updateJournal,
    deleteJournal
  } = useJournals();

  // Convert DB journals to our UI format
  const journals = dbJournals.map(journal => ({
    id: journal.id,
    title: journal.title,
    description: journal.description || "",
    permission: journal.accessLevel,
    sections: journal.sections as any, // Type cast as it's stored as JSON
    createdAt: new Date(journal.createdAt),
    updatedAt: new Date(journal.updatedAt)
  }));

  // Handlers for journal management
  const handleJournalSelect = (journal: Journal) => {
    setSelectedJournal(journal);
    setMode('view');
  };

  const handleCreateNewJournal = () => {
    setNewJournal({ ...EMPTY_JOURNAL, id: `new-${Date.now()}` });
    setMode('create');
  };

  const handleUpdateJournal = async (journal: Journal) => {
    try {
      // Convert UI journal to DB format with proper accessLevel mapping
      const accessLevel = 
        journal.permission === "Étudiant" ? "ETUDIANT" :
        journal.permission === "Professeur" ? "PROFESSEUR" :
        journal.permission === "Responsable" ? "RESPONSABLE" : 
        journal.permission; // Fallback to original value
      
      const updateData = {
        title: journal.title,
        description: journal.description || "",
        accessLevel, // Use the properly mapped value
        sections: journal.sections.map(section => ({
          id: section.id,
          type: section.type,
          title: section.title,
          enabled: section.enabled
        })),
      };
      
      console.log('Updating journal with formatted data:', updateData);
      
      await updateJournal(journal.id, updateData);
  
      setSelectedJournal(journal);
      setMode('view');
      toast({
        title: "Journal mis à jour",
        description: "Le journal a été mis à jour avec succès.",
      });
    } catch (error) {
      console.error("Error updating journal:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour du journal.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteJournal = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce journal?")) {
      try {
        await deleteJournal(id);

        if (selectedJournal?.id === id) {
          setSelectedJournal(null);
        }

        toast({
          title: "Journal supprimé",
          description: "Le journal a été supprimé avec succès.",
        });
      } catch (error) {
        console.error("Error deleting journal:", error);
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors de la suppression du journal.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveNewJournal = async () => {
    try {
      // Convert UI journal to DB format for creation
      const journalData: CreateJournalData = {
        title: newJournal.title,
        description: newJournal.description || "",
        // Improved conversion from UI format to DB format
        accessLevel: (newJournal.permission === "Étudiant" ? "ETUDIANT" :
          newJournal.permission === "Professeur" ? "PROFESSEUR" :
          newJournal.permission === "Responsable" ? "RESPONSABLE" :
          "ETUDIANT") as AccessLevel,
        // Make sure sections are properly formatted for JSON storage
        sections: newJournal.sections.map(section => ({
          id: section.id,
          type: section.type,
          title: section.title,
          enabled: section.enabled
        })),
      };
  
      const createdJournal = await createJournal(journalData);
      // Convert the created journal back to UI format
      const uiJournal: Journal = {
        id: createdJournal.id,
        title: createdJournal.title,
        description: createdJournal.description || "",
        permission: createdJournal.accessLevel,
        sections: createdJournal.sections as any,
        createdAt: new Date(createdJournal.createdAt),
        updatedAt: new Date(createdJournal.updatedAt)
      };

      setSelectedJournal(uiJournal);
      setMode('view');

      toast({
        title: "Journal créé",
        description: "Le journal a été créé avec succès.",
      });
    } catch (error) {
      console.error("Error creating journal:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création du journal.",
        variant: "destructive",
      });
    }
  };

  const handleEditJournal = (journal: Journal) => {
    setNewJournal({ ...journal });
    setMode('edit');
  };

  // Determine which journal to preview
  const previewJournal = mode === 'view'
    ? selectedJournal
    : mode === 'create' || mode === 'edit'
      ? newJournal
      : null;

  // Handle loading and error states
  if (loading) {
    return <div>Loading journals...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Journal de Bord</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Journal Browser / Carousel Section */}
          <JournalBrowser
            journals={journals}
            onSelect={handleJournalSelect}
            onEdit={handleEditJournal}
            onDelete={handleDeleteJournal}
            onCreateNew={handleCreateNewJournal}
            selectedJournalId={selectedJournal?.id}
          />

          {/* Journal Creator Section */}
          <JournalCreator
            journal={newJournal}
            onChange={setNewJournal}
            onSave={mode === 'create' ? handleSaveNewJournal : handleUpdateJournal}
            mode={mode}
          />
        </div>

        {/* Journal Preview Section */}
        <div className="lg:row-span-2">
          <JournalPreview journal={previewJournal} />
        </div>
      </div>
    </div>
  );
}