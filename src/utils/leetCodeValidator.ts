/**
 * LeetCode Validation Utility
 * Validates if a student has completed the required LeetCode problems for the current week
 * based on their academic year before allowing OD submission.
 */

export interface LeetCodeWeek {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  problemsSolved: number;
  targetProblems: number;
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  proofScreenshot?: string;
  notes?: string;
  completedAt?: string;
  status: 'in-progress' | 'completed' | 'not-started';
}

export interface LeetCodeValidationResult {
  isValid: boolean;
  message: string;
  requiredDifficulties: string[];
  completedDifficulties: string[];
  currentWeek?: LeetCodeWeek;
}

/**
 * Get the required difficulty levels based on student year
 */
export function getRequiredDifficulties(year: string): string[] {
  // Extract numeric value from year string (handles "1st", "2nd", "1", "2", etc.)
  const yearNum = parseInt(year.replace(/\D/g, ''));
  
  switch (yearNum) {
    case 1:
      return ['easy'];
    case 2:
      return ['easy', 'medium'];
    case 3:
    case 4:
      return ['easy', 'medium', 'hard'];
    default:
      return ['easy'];
  }
}

/**
 * Get readable requirement message based on year
 */
export function getRequirementMessage(year: string): string {
  // Extract numeric value from year string
  const yearNum = parseInt(year.replace(/\D/g, ''));
  
  switch (yearNum) {
    case 1:
      return '1st year students must complete Easy level problems';
    case 2:
      return '2nd year students must complete Easy and Medium level problems';
    case 3:
    case 4:
      return '3rd & 4th year students must complete Easy, Medium, and Hard level problems';
    default:
      return 'Complete the required LeetCode problems for your year';
  }
}

/**
 * Get the current week's LeetCode data
 */
function getCurrentWeekData(userId: string): LeetCodeWeek | null {
  try {
    const saved = localStorage.getItem(`leetcode_tracker_${userId}`);
    if (!saved) return null;

    const weeks: LeetCodeWeek[] = JSON.parse(saved);
    if (weeks.length === 0) return null;

    // Get current date
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Find the current week (week that includes today's date)
    const currentWeek = weeks.find(week => {
      const startDate = new Date(week.startDate);
      const endDate = new Date(week.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      return now >= startDate && now <= endDate;
    });

    // If no current week found, return the most recent week
    if (!currentWeek && weeks.length > 0) {
      // Sort by week number descending and get the latest
      const sortedWeeks = [...weeks].sort((a, b) => b.weekNumber - a.weekNumber);
      return sortedWeeks[0];
    }

    return currentWeek || null;
  } catch (error) {
    console.error('Error loading LeetCode data:', error);
    return null;
  }
}

/**
 * Check if the student has completed the required difficulties
 */
function hasCompletedRequiredDifficulties(
  week: LeetCodeWeek,
  requiredDifficulties: string[]
): { completed: boolean; completedDifficulties: string[] } {
  const completedDifficulties: string[] = [];

  if (week.difficulty.easy > 0) {
    completedDifficulties.push('easy');
  }
  if (week.difficulty.medium > 0) {
    completedDifficulties.push('medium');
  }
  if (week.difficulty.hard > 0) {
    completedDifficulties.push('hard');
  }

  // Check if all required difficulties are completed
  const allCompleted = requiredDifficulties.every(difficulty =>
    completedDifficulties.includes(difficulty)
  );

  return {
    completed: allCompleted,
    completedDifficulties
  };
}

/**
 * Main validation function - checks if student can submit OD request
 */
export function validateLeetCodeCompletion(
  userId: string,
  studentYear: string
): LeetCodeValidationResult {
  // Get required difficulties for this year
  const requiredDifficulties = getRequiredDifficulties(studentYear);
  
  // Get current week data
  const currentWeek = getCurrentWeekData(userId);

  // If no week data exists
  if (!currentWeek) {
    return {
      isValid: false,
      message: `Before submitting OD request, you must start tracking LeetCode problems in your dashboard. ${getRequirementMessage(studentYear)}.`,
      requiredDifficulties,
      completedDifficulties: []
    };
  }

  // Check if required difficulties are completed
  const { completed, completedDifficulties } = hasCompletedRequiredDifficulties(
    currentWeek,
    requiredDifficulties
  );

  if (!completed) {
    const missing = requiredDifficulties.filter(
      d => !completedDifficulties.includes(d)
    );
    
    return {
      isValid: false,
      message: `You must complete LeetCode problems for this week before submitting OD request. Missing: ${missing.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')} level problems. ${getRequirementMessage(studentYear)}.`,
      requiredDifficulties,
      completedDifficulties,
      currentWeek
    };
  }

  // All requirements met
  return {
    isValid: true,
    message: `✓ LeetCode requirements met for Week ${currentWeek.weekNumber}`,
    requiredDifficulties,
    completedDifficulties,
    currentWeek
  };
}

/**
 * Get a summary of LeetCode status for display
 */
export function getLeetCodeStatusSummary(userId: string, studentYear: string): {
  hasData: boolean;
  currentWeek?: LeetCodeWeek;
  completedProblems: number;
  requiredDifficulties: string[];
  status: 'complete' | 'incomplete' | 'no-data';
  message: string;
} {
  const validation = validateLeetCodeCompletion(userId, studentYear);
  const currentWeek = getCurrentWeekData(userId);

  if (!currentWeek) {
    return {
      hasData: false,
      completedProblems: 0,
      requiredDifficulties: validation.requiredDifficulties,
      status: 'no-data',
      message: 'No LeetCode tracking data found'
    };
  }

  return {
    hasData: true,
    currentWeek,
    completedProblems: currentWeek.problemsSolved,
    requiredDifficulties: validation.requiredDifficulties,
    status: validation.isValid ? 'complete' : 'incomplete',
    message: validation.message
  };
}