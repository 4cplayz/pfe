// src/types/journal.ts - ajoutez isActive à l'interface Journal

// Enum for section types
export enum SectionType {
  VERIFICATION = "verification",
  MATERIAL = "material",
  NOTES = "notes",
  COMMENT = "comment",
  CUSTOM = "custom"
}

// Section interface
export interface JournalSection {
  id: string;
  type: SectionType;
  title: string;
  content?: string;
  enabled: boolean;
}

// Journal interface
export interface Journal {
  id: string;
  title: string;
  description: string;
  permission: string;
  sections: JournalSection[];
  createdAt: Date;
  updatedAt: Date;
  isActive?: boolean; // Ajouté pour indiquer le statut actif du journal
}

// Le reste du fichier reste inchangé