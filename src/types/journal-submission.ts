// src/types/journal-submission.ts
import { AccessLevel } from "./journal-db";
import { SectionType } from "./journal";

// Define the structure for a section response in the journal submission
export interface SectionResponse {
  sectionId: string;
  type: SectionType;
  title: string;
  content?: string;
  checkboxes?: Record<string, boolean>; // For checkbox type sections
}

// Status of a journal submission
export enum SubmissionStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  REVIEWED = "REVIEWED"
}

// Define the structure for a journal submission
export interface JournalSubmission {
  id: string;
  userId: string;
  journalId: string;
  responses: SectionResponse[];
  startTime: Date;
  endTime: Date;
  totalTime?: number; // in seconds
  status: SubmissionStatus;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the structure for creating a new journal submission
export interface CreateJournalSubmission {
  userId: string;
  journalId: string;
  responses: SectionResponse[];
  startTime?: Date;
  endTime?: Date;
  status?: SubmissionStatus;
  feedback?: string;
}

// Define the structure for a journal submission with user and journal details
export interface JournalSubmissionWithDetails extends JournalSubmission {
  user: {
    id: string;
    name: string;
    matricule: string;
    accessLevel: AccessLevel;
  };
  journal: {
    id: string;
    title: string;
    description?: string;
    accessLevel: AccessLevel;
  };
}