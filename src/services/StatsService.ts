import { database } from '../database';
import DailyStat from '../database/models/DailyStat';
import { Q } from '@nozbe/watermelondb';

// Debounce timer for score sync
let scoreSyncTimeout: NodeJS.Timeout | null = null;
const SCORE_SYNC_DEBOUNCE_MS = 500;

export class StatsService {
  /**
   * Get today's DailyStat record, creating it if it doesn't exist.
   */
  static async getTodayStat(): Promise<DailyStat> {
    try {
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
    } catch (error) {
      console.error('[StatsService] Error getting today\'s stat:', error);
      throw error;
    }
  }

  /**
   * Sync the current calculated score to the database
   * Debounced to prevent race conditions from rapid updates
   */
  static async syncScore(currentScore: number): Promise<void> {
    // Clear existing timeout
    if (scoreSyncTimeout) {
      clearTimeout(scoreSyncTimeout);
    }

    // Debounce the sync operation
    scoreSyncTimeout = setTimeout(async () => {
      try {
        const stat = await this.getTodayStat();
        
        if (stat.score !== currentScore) {
          await database.write(async () => {
            await stat.updateScore(currentScore);
          });
          console.log(`[StatsService] Score synced: ${currentScore}`);
        }
      } catch (error) {
        console.error('[StatsService] Error syncing score:', error);
      }
    }, SCORE_SYNC_DEBOUNCE_MS);
  }

  /**
   * Add focus minutes to today's stats
   */
  static async logFocusSession(minutes: number): Promise<void> {
    try {
      const stat = await this.getTodayStat();
      
      await database.write(async () => {
        await stat.addFocusMinutes(minutes);
      });
      
      console.log(`[StatsService] Focus session logged: ${minutes} minutes`);
    } catch (error) {
      console.error('[StatsService] Error logging focus session:', error);
      throw error;
    }
  }

  /**
   * Get stats for the last N days for analytics
   */
  static async getRecentStats(days: number = 7): Promise<DailyStat[]> {
    try {
      const statsCollection = database.collections.get<DailyStat>('daily_stats');
      return await statsCollection.query(
        Q.sortBy('date', Q.desc),
        Q.take(days)
      ).fetch();
    } catch (error) {
      console.error('[StatsService] Error getting recent stats:', error);
      return [];
    }
  }
}
