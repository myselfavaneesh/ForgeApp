import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class DailyStat extends Model {
  static table = 'daily_stats';

  @field('date') date!: string; // ISO format YYYY-MM-DD
  @field('score') score!: number;
  @field('focus_minutes') focusMinutes!: number;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  async updateScore(newScore: number) {
    await this.update((stat) => {
      stat.score = newScore;
    });
  }

  async addFocusMinutes(minutes: number) {
    await this.update((stat) => {
      stat.focusMinutes += minutes;
    });
  }
}
