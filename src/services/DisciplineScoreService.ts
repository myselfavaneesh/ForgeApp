import { storage, Task } from './StorageService';

export class DisciplineScoreService {
  /**
   * Calculate the daily discipline score based on tasks
   * Formula: (Earned Weight / Total Weight) × 100 - Penalties
   * 
   * Weights:
   * - Non-Negotiable tasks = 3x weight
   * - Standard tasks = 1x weight
   * 
   * Penalties:
   * - -5 points for every snooze_count
   * - -10 points if did_commit is true but task is not completed
   */
  static async calculateDailyScore(date: string): Promise<number> {
    // Get all tasks for today
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const allTasks = await storage.getTasks();
    const tasks = allTasks.filter(t => 
      t.createdAt >= startOfDay.getTime() && 
      t.createdAt <= endOfDay.getTime()
    );

    if (tasks.length === 0) {
      return 100; // Perfect score if no tasks
    }

    let totalWeight = 0;
    let earnedWeight = 0;
    let penalties = 0;

    for (const task of tasks) {
      const weight = task.isNonNegotiable ? 3 : 1;
      totalWeight += weight;

      // Calculate earned weight
      if (task.status === 'completed') {
        earnedWeight += weight;
      }

      // Calculate penalties
      penalties += task.snoozeCount * 5;

      // Penalty for breaking commitment
      if (task.didCommit && task.status !== 'completed') {
        penalties += 10;
      }
    }

    // Calculate base score
    const baseScore = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 100;
    
    // Apply penalties
    const finalScore = Math.max(0, Math.min(100, baseScore - penalties));

    return Math.round(finalScore);
  }

  /**
   * Update or create today's daily stat with the current score
   */
  static async updateTodayScore(): Promise<number> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const score = await this.calculateDailyScore(today);

    await storage.updateDailyStat(today, { score });

    return score;
  }

  /**
   * Get today's score (without recalculating)
   */
  static async getTodayScore(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const stat = await storage.getDailyStatForDate(today);

    if (stat) {
      return stat.score;
    }

    // If no stat exists, calculate and create it
    return await this.updateTodayScore();
  }

  /**
   * Get stats for the last N days
   */
  static async getRecentStats(days: number = 7) {
    const stats = await storage.getDailyStats();
    return stats
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, days);
  }

  /**
   * Get task breakdown for analysis
   */
  static async getTaskBreakdown(date: string) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const allTasks = await storage.getTasks();
    const tasks = allTasks.filter(t => 
      t.createdAt >= startOfDay.getTime() && 
      t.createdAt <= endOfDay.getTime()
    );

    const breakdown = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      nonNegotiables: tasks.filter(t => t.isNonNegotiable).length,
      nonNegotiablesCompleted: tasks.filter(t => t.isNonNegotiable && t.status === 'completed').length,
      totalSnoozes: tasks.reduce((sum, t) => sum + t.snoozeCount, 0),
      brokenCommitments: tasks.filter(t => t.didCommit && t.status !== 'completed').length,
    };

    return breakdown;
  }
}
