import Task from '../database/models/Task';

export type ScoreColor = 'green' | 'orange' | 'red';
export type ScoreStatus = 'ELITE' | 'DISCIPLINED' | 'RELAPSING';

/**
 * Formula Constants for Discipline Score Calculation
 */
export const DISCIPLINE_FORMULA = {
  NON_NEGOTIABLE_WEIGHT: 3,
  STANDARD_TASK_WEIGHT: 1,
  SNOOZE_PENALTY: 5,
  BROKEN_COMMITMENT_PENALTY: 10,
  ENERGY_MATCH_BONUS: 2,
  MIN_SCORE: 0,
  MAX_SCORE: 100,
  ELITE_THRESHOLD: 80,
  DISCIPLINED_THRESHOLD: 50,
} as const;

/**
 * Singleton service that calculates the real-time "Integrity Score"
 * Based on task completion, commitments, and penalties
 * 
 * Formula: S = Max(0, Min(100, (EarnedWeight / TotalWeight × 100) + EnergyBonus - Penalties))
 * 
 * Where:
 * - TotalWeight = Σ(Non-Negotiables × 3 + Standard Tasks × 1)
 * - EarnedWeight = Σ(Completed Non-Negotiables × 3 + Completed Standard × 1)
 * - Penalties = (SnoozeCount × 5) + (BrokenCommitments × 10)
 * - EnergyBonus = CompletedTasksMatchingCurrentEnergy × 2
 */
export class DisciplineService {
  /**
   * Calculate the Integrity Score from an array of Task objects
   * 
   * @param tasks - Array of Task objects to calculate score from
   * @param currentEnergy - Current selected energy level for bonus calculation
   * @returns Discipline score between 0-100
   * 
   * @example
   * const score = DisciplineService.getScore(tasks, 'high');
   * // Returns: 85 (ELITE status)
   */
  static getScore(tasks: Task[], currentEnergy?: 'high' | 'medium' | 'low'): number {
    // Edge case: No tasks = perfect score
    if (tasks.length === 0) {
      return DISCIPLINE_FORMULA.MAX_SCORE;
    }

    let totalWeight = 0;
    let earnedWeight = 0;
    let penalties = 0;
    let energyBonus = 0;

    for (const task of tasks) {
      // Input validation: Ensure snoozeCount is non-negative
      const snoozeCount = Math.max(0, task.snoozeCount || 0);
      
      const weight = task.isNonNegotiable 
        ? DISCIPLINE_FORMULA.NON_NEGOTIABLE_WEIGHT 
        : DISCIPLINE_FORMULA.STANDARD_TASK_WEIGHT;
      
      totalWeight += weight;

      // Calculate earned weight for completed tasks
      if (task.status === 'completed') {
        earnedWeight += weight;

        // Energy Match Bonus: +2 points if task energy matches current selected energy
        if (currentEnergy && task.energyLevel === currentEnergy) {
          energyBonus += DISCIPLINE_FORMULA.ENERGY_MATCH_BONUS;
        }
      }

      // Penalty: -5 points for each snooze
      penalties += snoozeCount * DISCIPLINE_FORMULA.SNOOZE_PENALTY;

      // Penalty: -10 points for breaking a commitment
      if (task.didCommit && task.status !== 'completed') {
        penalties += DISCIPLINE_FORMULA.BROKEN_COMMITMENT_PENALTY;
      }
    }

    // Calculate base score
    const baseScore = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 100;

    // Apply penalties and bonuses, ensure score is between 0 and 100
    const finalScore = Math.max(
      DISCIPLINE_FORMULA.MIN_SCORE, 
      Math.min(
        DISCIPLINE_FORMULA.MAX_SCORE, 
        (baseScore + energyBonus) - penalties
      )
    );

    return Math.round(finalScore);
  }

  /**
   * Get the color for the score
   * - Green for 80+ (ELITE)
   * - Orange for 50-79 (DISCIPLINED)
   * - Red for below 50 (RELAPSING)
   */
  static getScoreColor(score: number): ScoreColor {
    if (score >= DISCIPLINE_FORMULA.ELITE_THRESHOLD) return 'green';
    if (score >= DISCIPLINE_FORMULA.DISCIPLINED_THRESHOLD) return 'orange';
    return 'red';
  }

  /**
   * Get the status label for the score
   * - ELITE for 80+
   * - DISCIPLINED for 50-79
   * - RELAPSING for below 50
   */
  static getScoreStatus(score: number): ScoreStatus {
    if (score >= DISCIPLINE_FORMULA.ELITE_THRESHOLD) return 'ELITE';
    if (score >= DISCIPLINE_FORMULA.DISCIPLINED_THRESHOLD) return 'DISCIPLINED';
    return 'RELAPSING';
  }

  /**
   * Get the hex color value for the score
   */
  static getScoreHexColor(score: number): string {
    const color = this.getScoreColor(score);
    switch (color) {
      case 'green':
        return '#00FF94'; // Neon green
      case 'orange':
        return '#FF8C00'; // Orange
      case 'red':
        return '#FF1744'; // Red
    }
  }

  /**
   * Get task breakdown statistics
   */
  static getTaskBreakdown(tasks: Task[]) {
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      nonNegotiables: tasks.filter(t => t.isNonNegotiable).length,
      nonNegotiablesCompleted: tasks.filter(
        t => t.isNonNegotiable && t.status === 'completed'
      ).length,
      totalSnoozes: tasks.reduce((sum, t) => sum + t.snoozeCount, 0),
      brokenCommitments: tasks.filter(
        t => t.didCommit && t.status !== 'completed'
      ).length,
    };
  }
}
