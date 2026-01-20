import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import { schema } from './schema';

export const adapter = new LokiJSAdapter({
  schema,
  // (Optional) Web-specific configurations
  useWebWorker: false,
  useIncrementalIndexedDB: true,
  onSetUpError: (error) => {
    console.error('Database setup error:', error);
  },
});
