import { Model, Query } from '@nozbe/watermelondb';
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators';
import Task from './Task';

export default class Project extends Model {
  static table = 'projects';

  @field('name') name!: string;
  @field('color') color!: string;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
 
  @children('tasks') tasks!: Query<Task>;
}
