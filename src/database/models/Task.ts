import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, action } from '@nozbe/watermelondb/decorators';

export type EnergyLevel = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'completed' | 'failed';

export default class Task extends Model {
  static table = 'tasks';

  @field('title') title!: string;
  @field('is_non_negotiable') isNonNegotiable!: boolean;
  @field('energy_level') energyLevel!: EnergyLevel;
  @field('status') status!: TaskStatus;
  @field('snooze_count') snoozeCount!: number;
  @field('did_commit') didCommit!: boolean;
  @field('project_id') projectId?: string;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @action async markCompleted() {
    await this.update((task) => {
      task.status = 'completed';
    });
  }

  @action async markFailed() {
    await this.update((task) => {
      task.status = 'failed';
    });
  }

  @action async incrementSnooze() {
    await this.update((task) => {
      task.snoozeCount += 1;
    });
  }

  @action async commit() {
    await this.update((task) => {
      task.didCommit = true;
    });
  }

  @action async toggleStatus() {
    await this.update((task) => {
      task.status = task.status === 'completed' ? 'pending' : 'completed';
    });
  }
}
