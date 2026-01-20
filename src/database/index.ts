import { Database } from '@nozbe/watermelondb';

import { schema } from './schema';
import Task from './models/Task';
import DailyStat from './models/DailyStat';
import Project from './models/Project';

import { adapter } from './adapter';



export const database = new Database({
  adapter,
  modelClasses: [Task, DailyStat, Project],
});
