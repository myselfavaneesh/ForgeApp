import { database } from '../database';
import Task from '../database/models/Task';
import DailyStat from '../database/models/DailyStat';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export class BackupService {
  static async exportData() {
    try {
      // Fetch all data
      const tasks = await database.collections.get<Task>('tasks').query().fetch();
      const stats = await database.collections.get<DailyStat>('daily_stats').query().fetch();

      // Serialize
      const data = {
        meta: {
          version: '1.0',
          timestamp: new Date().toISOString(),
          app: 'Forge Discipline OS'
        },
        tasks: tasks.map(t => t._raw),
        stats: stats.map(s => s._raw),
      };

      const json = JSON.stringify(data, null, 2);
      
      // Write to temp file
      const filename = `forge_backup_${Date.now()}.json`;
      const fileUri = FileSystem.documentDirectory + filename;
      
      await FileSystem.writeAsStringAsync(fileUri, json);

      // Share
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
            mimeType: 'application/json',
            dialogTitle: 'Export Forge Data'
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }

    } catch (error: any) {
      console.error('Backup failed:', error);
      Alert.alert('Export Failed', error.message);
    }
  }
}
