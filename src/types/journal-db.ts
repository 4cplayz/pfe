// src/types/journal-db.ts
// Define the proper AccessLevel type to match Prisma schema
export type AccessLevel = 'ETUDIANT' | 'PROFESSEUR' | 'RESPONSABLE';

// Define the structure for a section in the journal
export interface JournalSectionData {
  id: string;
  type: string;
  title: string;
  enabled: boolean;
}

// Define the structure for a journal in the database
export interface JournalDB {
  id: string;
  title: string;
  description?: string;
  accessLevel: AccessLevel;
  sections: JournalSectionData[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Define the structure for creating a new journal
export interface CreateJournalData {
  title: string;
  description?: string;
  accessLevel: AccessLevel;
  sections: JournalSectionData[];
}

// Define the structure for updating a journal
export interface UpdateJournalData {
  title?: string;
  description?: string | null;
  accessLevel?: AccessLevel;
  sections?: JournalSectionData[];
  isActive?: boolean;
}