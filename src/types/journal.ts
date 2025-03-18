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
}

// Form fields for the journal
export interface JournalFields {
  title: string;
  description: string;
  permission: string;
}

// Field types for sections
export interface SectionField {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'date' | 'time';
  required?: boolean;
  options?: { value: string; label: string }[];
}

// Example field definitions for different section types
export const SECTION_FIELDS: Record<SectionType, SectionField[]> = {
  [SectionType.VERIFICATION]: [
    { 
      id: 'ouverture', 
      label: 'Ouverture', 
      placeholder: 'Vérification à l\'ouverture', 
      type: 'checkbox' 
    },
    { 
      id: 'fermeture', 
      label: 'Fermeture', 
      placeholder: 'Vérification à la fermeture', 
      type: 'checkbox' 
    },
  ],
  [SectionType.MATERIAL]: [
    { 
      id: 'equipment', 
      label: 'Matériel utilisé', 
      placeholder: 'Description du matériel utilisé', 
      type: 'textarea' 
    },
  ],
  [SectionType.NOTES]: [
    { 
      id: 'labNotes', 
      label: 'Notes de laboratoire', 
      placeholder: 'Entrez vos notes de laboratoire', 
      type: 'textarea' 
    },
  ],
  [SectionType.COMMENT]: [
    { 
      id: 'comment', 
      label: 'Commentaire', 
      placeholder: 'Entrez vos commentaires supplémentaires', 
      type: 'textarea' 
    },
  ],
  [SectionType.CUSTOM]: [
    { 
      id: 'customField', 
      label: 'Champ personnalisé', 
      placeholder: 'Entrez votre texte', 
      type: 'text' 
    },
  ],
};