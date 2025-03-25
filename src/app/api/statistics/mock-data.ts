// Mock data generator for statistics when real data is sparse

// Status colors
const STATUS_COLORS = {
  SUBMITTED: "#fbbf24", // yellow-500
  REVIEWED: "#10b981", // green-500
  DRAFT: "#6b7280", // gray-500
};

// Access level colors
const ACCESS_LEVEL_COLORS = {
  ETUDIANT: "#60a5fa", // blue-400
  PROFESSEUR: "#8b5cf6", // violet-500
  RESPONSABLE: "#ec4899", // pink-500
};

interface DashboardStats {
  submissionsByStatus: {
    status: string;
    count: number;
    color: string;
  }[];
  submissionsByDay: {
    date: string;
    count: number;
  }[];
  averageCompletionTime: {
    journalTitle: string;
    averageTime: number; // in seconds
  }[];
  usersByAccessLevel: {
    accessLevel: string;
    count: number;
    color: string;
  }[];
  totalUsers: number;
  totalSubmissions: number;
  activeJournals: number;
  averageCompletionTimeAll: number; // in seconds
}

// Helper function to format dates consistently
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Generate dates for the past N days
function generateDatesForPastDays(days: number): { date: string; count: number }[] {
  const dates = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    dates.push({
      date: formatDate(date),
      count: Math.floor(Math.random() * 10) // Random count between 0 and 9
    });
  }
  
  return dates;
}

export function generateMockStatistics(days: number): DashboardStats {
  // Generate a random distribution of statuses
  const totalSubmissions = 45;
  const submittedCount = Math.floor(totalSubmissions * 0.5);
  const reviewedCount = Math.floor(totalSubmissions * 0.3);
  const draftCount = totalSubmissions - submittedCount - reviewedCount;
  
  // Generate mock data
  return {
    submissionsByStatus: [
      { status: "SUBMITTED", count: submittedCount, color: STATUS_COLORS.SUBMITTED },
      { status: "REVIEWED", count: reviewedCount, color: STATUS_COLORS.REVIEWED },
      { status: "DRAFT", count: draftCount, color: STATUS_COLORS.DRAFT }
    ],
    
    submissionsByDay: generateDatesForPastDays(days),
    
    averageCompletionTime: [
      { journalTitle: "Journal de Laboratoire", averageTime: 385 },
      { journalTitle: "Journal d'Observation", averageTime: 275 },
      { journalTitle: "Journal de Terrain", averageTime: 420 },
      { journalTitle: "Journal d'Expérience", averageTime: 310 },
      { journalTitle: "Journal de Pratique", averageTime: 180 }
    ],
    
    usersByAccessLevel: [
      { accessLevel: "ETUDIANT", count: 28, color: ACCESS_LEVEL_COLORS.ETUDIANT },
      { accessLevel: "PROFESSEUR", count: 5, color: ACCESS_LEVEL_COLORS.PROFESSEUR },
      { accessLevel: "RESPONSABLE", count: 2, color: ACCESS_LEVEL_COLORS.RESPONSABLE }
    ],
    
    totalUsers: 35,
    totalSubmissions: totalSubmissions,
    activeJournals: 3,
    averageCompletionTimeAll: 320 // About 5 minutes and 20 seconds
  };
}