import Task from '../database/models/Task';

export type ScoreColor = 'green' | 'orange' | 'red';
export type ScoreStatus = 'ELITE' | 'DISCIPLINED' | 'RELAPSING';

/**
 * Singleton service that calculates the real-time "Integrity Score"
 * Based on task completion, commitments, and penalties
 */
export class DisciplineService {
  /**
   * Calculate the Integrity Score from an array of Task objects
   * 
   * Formula:
   * - Total Weight = (Non-Negotiables × 3) + (Standard Tasks × 1)
   * - Earned Weight = (Completed Non-Negotiables × 3) + (Completed Standard × 1)
   * - Penalties:
   *   - Subtract 5 points for every snooze_count across all tasks
   *   - Subtract 10 points for every task where did_commit is true but status is not 'completed'
   * - Final Score = Max(0, (Earned Weight / Total Weight × 100) - Penalties)
   */
  static getScore(tasks: Task[]): number {
    if (tasks.length === 0) {
      return 100; // Perfect score if no tasks
    }

    let totalWeight = 0;
    let earnedWeight = 0;
    let penalties = 0;

    for (const task of tasks) {
      const weight = task.isNonNegotiable ? 3 : 1;
      totalWeight += weight;

      // Calculate earned weight for completed tasks
      if (task.status === 'completed') {
        earnedWeight += weight;
      }

      // Penalty: -5 points for each snooze
      penalties += task.snoozeCount * 5;

      // Penalty: -10 points for breaking a commitment
      if (task.didCommit && task.status !== 'completed') {
        penalties += 10;
      }
    }

    // Calculate base score
    const baseScore = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 100;

    // Apply penalties and ensure score is between 0 and 100
    const finalScore = Math.max(0, baseScore - penalties);

    return Math.round(finalScore);
  }

  /**
   * Get the color for the score
   * - Green for 80+
   * - Orange for 50-79
   * - Red for below 50
   */
  static getScoreColor(score: number): ScoreColor {
    if (score >= 80) return 'green';
    if (score >= 50) return 'orange';
    return 'red';
  }

  /**
   * Get the status label for the score
   * - ELITE for 80+
   * - DISCIPLINED for 50-79
   * - RELAPSING for below 50
   */
  static getScoreStatus(score: number): ScoreStatus {
    if (score >= 80) return 'ELITE';
    if (score >= 50) return 'DISCIPLINED';
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
