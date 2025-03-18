"use client";

import { useState } from "react";
import { JournalBrowser } from "./JournalBrowser";
import { JournalCreator } from "./JournalCreator";
import { JournalPreview } from "./JounralPreview";
import { Journal, SectionType } from "@/types/journal";


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

// Sample journals for demonstration
const SAMPLE_JOURNALS: Journal[] = [
  {
    id: "1",
    title: "Journal de Laboratoire Chimie",
    description: "Sondage pour les séances de laboratoire de chimie organique",
    permission: "Etudiants Chimie",
    sections: [
      { id: "verification", type: SectionType.VERIFICATION, title: "Vérification de ouverture & fermeture", enabled: true },
      { id: "material", type: SectionType.MATERIAL, title: "Nom du matériel utilisé", enabled: true },
      { id: "notes", type: SectionType.NOTES, title: "Section prise de note le labo", enabled: true },
      { id: "comment", type: SectionType.COMMENT, title: "Section Autre commentaire", enabled: false },
    ],
    createdAt: new Date(2025, 2, 10),
    updatedAt: new Date(2025, 2, 10)
  },
  {
    id: "2",
    title: "Journal d'Électronique",
    description: "Sondage pour les travaux pratiques d'électronique",
    permission: "Etudiants Technique",
    sections: [
      { id: "verification", type: SectionType.VERIFICATION, title: "Vérification de ouverture & fermeture", enabled: true },
      { id: "material", type: SectionType.MATERIAL, title: "Nom du matériel utilisé", enabled: true },
      { id: "notes", type: SectionType.NOTES, title: "Section prise de note le labo", enabled: false },
      { id: "comment", type: SectionType.COMMENT, title: "Section Autre commentaire", enabled: true },
    ],
    createdAt: new Date(2025, 2, 15),
    updatedAt: new Date(2025, 2, 18)
  },
  {
    id: "3",
    title: "Journal d'Informatique",
    description: "Sondage pour les séances de laboratoire informatique",
    permission: "Tous les étudiants",
    sections: [
      { id: "verification", type: SectionType.VERIFICATION, title: "Vérification de ouverture & fermeture", enabled: false },
      { id: "material", type: SectionType.MATERIAL, title: "Nom du matériel utilisé", enabled: true },
      { id: "notes", type: SectionType.NOTES, title: "Section prise de note le labo", enabled: true },
      { id: "comment", type: SectionType.COMMENT, title: "Section Autre commentaire", enabled: true },
    ],
    createdAt: new Date(2025, 3, 1),
    updatedAt: new Date(2025, 3, 5)
  }
];

export function JournalDashboard() {
  // State management for journals
  const [journals, setJournals] = useState<Journal[]>(SAMPLE_JOURNALS);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [newJournal, setNewJournal] = useState<Journal>({ ...EMPTY_JOURNAL });
  const [mode, setMode] = useState<'view' | 'create' | 'edit'>('view');

  // Handlers for journal management
  const handleJournalSelect = (journal: Journal) => {
    setSelectedJournal(journal);
    setMode('view');
  };

  const handleCreateNewJournal = () => {
    setNewJournal({ ...EMPTY_JOURNAL, id: `new-${Date.now()}` });
    setMode('create');
  };

  const handleUpdateJournal = (journal: Journal) => {
    const updatedJournals = journals.map(j =>
      j.id === journal.id ? { ...journal, updatedAt: new Date() } : j
    );
    setJournals(updatedJournals);
    setSelectedJournal(journal);
    setMode('view');
  };

  const handleDeleteJournal = (id: string) => {
    const updatedJournals = journals.filter(journal => journal.id !== id);
    setJournals(updatedJournals);

    if (selectedJournal?.id === id) {
      setSelectedJournal(null);
    }
  };

  const handleSaveNewJournal = () => {
    const journal = { ...newJournal, createdAt: new Date(), updatedAt: new Date() };
    setJournals([...journals, journal]);
    setSelectedJournal(journal);
    setMode('view');
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