import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import Task from './models/Task';
import DailyStat from './models/DailyStat';
import Project from './models/Project';

// Use Expo SQLite adapter for compatibility with Expo Go
const adapter = new SQLiteAdapter({
  schema,
  // Don't use JSI in Expo Go - it's not available
  jsi: false,
  onSetUpError: (error) => {
    console.error('Database setup error:', error);
  },
});


export const database = new Database({
  adapter,
  modelClasses: [Task, DailyStat, Project],
});
