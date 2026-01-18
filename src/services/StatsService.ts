import { database } from '../database';
import DailyStat from '../database/models/DailyStat';
import { Q } from '@nozbe/watermelondb';

export class StatsService {
  /**
   * Get today's DailyStat record, creating it if it doesn't exist.
   */
  static async getTodayStat(): Promise<DailyStat> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const statsCollection = database.collections.get<DailyStat>('daily_stats');
    
    const stats = await statsCollection.query(
      Q.where('date', today)
    ).fetch();

    if (stats.length > 0) {
      return stats[0];
    }

    // Create new stat for today
    return await database.write(async () => {
      return await statsCollection.create(stat => {
        stat.date = today;
        stat.score = 0; // Will be updated immediately after
        stat.focusMinutes = 0;
      });
    });
  }

  /**
   * Sync the current calculated score to the database
   */
  static async syncScore(currentScore: number): Promise<void> {
    const stat = await this.getTodayStat();
    
    if (stat.score !== currentScore) {
      await database.write(async () => {
        await stat.updateScore(currentScore);
      });
    }
  }

  /**
   * Add focus minutes to today's stats
   */
  static async logFocusSession(minutes: number): Promise<void> {
    const stat = await this.getTodayStat();
    
    await database.write(async () => {
      await stat.addFocusMinutes(minutes);
    });
  }

  /**
   * Get stats for the last N days for analytics
   */
  static async getRecentStats(days: number = 7): Promise<DailyStat[]> {
    const statsCollection = database.collections.get<DailyStat>('daily_stats');
    return await statsCollection.query(
      Q.sortBy('date', Q.desc),
      Q.take(days)
    ).fetch();
  }
}
