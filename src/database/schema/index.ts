import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'tasks',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'is_non_negotiable', type: 'boolean' },
        { name: 'energy_level', type: 'string' }, // 'high' | 'medium' | 'low'
        { name: 'status', type: 'string' }, // 'pending' | 'completed' | 'failed'
        { name: 'snooze_count', type: 'number' },
        { name: 'did_commit', type: 'boolean' },
        { name: 'project_id', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'daily_stats',
      columns: [
        { name: 'date', type: 'string' }, // ISO format YYYY-MM-DD
        { name: 'score', type: 'number' },
        { name: 'focus_minutes', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'projects',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
