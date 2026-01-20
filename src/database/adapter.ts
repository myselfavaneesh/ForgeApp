import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import { Platform } from 'react-native';

export const adapter = new SQLiteAdapter({
  schema,
  // (JSI is not supported on web or in Expo Go without custom dev client)
  jsi: Platform.OS === 'ios' || Platform.OS === 'android', 
  onSetUpError: (error) => {
    console.error('Database setup error:', error);
  },
});
