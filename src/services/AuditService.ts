import { database } from '../database';
import Task from '../database/models/Task';
import { DisciplineService } from './DisciplineService';
import { StatsService } from './StatsService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_AUDIT_KEY = 'forge_last_audit_date';

/**
 * AuditService handles end-of-day reviews and task lifecycle management
 * 
 * Key Responsibilities:
 * - Run once-per-day audit on app mount
 * - Mark committed but incomplete tasks as failed
 * - Ensure daily stats are initialized
 */
export class AuditService {
  /**
   * Run the end-of-day audit if it hasn't been run for today yet.
   * This should be called on app mount.
   */
  static async performReviewIfNeeded() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastAudit = await AsyncStorage.getItem(LAST_AUDIT_KEY);

      if (lastAudit !== today) {
        console.log(`[AuditService] Running audit for new day: ${today}`);
        await this.runEndOfDayAudit();
        await AsyncStorage.setItem(LAST_AUDIT_KEY, today);
      } else {
        console.log(`[AuditService] Audit already run today: ${today}`);
      }
    } catch (error) {
      console.error('[AuditService] Error performing review:', error);
    }
  }

  /**
   * End-of-Day Audit Logic:
   * 1. Ensure today's DailyStat record exists
   * 2. Mark old committed+pending tasks as failed
   * 
   * This implements the "Trigger Protocol" - committed tasks that weren't
   * completed by end of day are automatically failed, applying the -10 penalty.
   */
  private static async runEndOfDayAudit() {
    try {
      // 1. Ensure today's stats are initialized
      await StatsService.getTodayStat();

      // 2. Handle old committed tasks
      const tasksCollection = database.collections.get<Task>('tasks');
      const allTasks = await tasksCollection.query().fetch();
      
      const today = new Date().toISOString().split('T')[0];
      let failedCount = 0;

      await database.write(async () => {
        for (const task of allTasks) {
          // If task was committed to but NOT completed, and it's from a previous day
          if (task.didCommit && task.status === 'pending') {
            const taskDate = task.createdAt.toISOString().split('T')[0];
            
            if (taskDate < today) {
              await task.markFailed();
              failedCount++;
              console.log(`[AuditService] Marked task as failed: "${task.title}"`);
            }
          }
        }
      });

      console.log(`[AuditService] Audit complete. Failed tasks: ${failedCount}`);
    } catch (error) {
      console.error('[AuditService] Error running end-of-day audit:', error);
    }
  }
}
