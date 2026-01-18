import AsyncStorage from '@react-native-async-storage/async-storage';

export type EnergyLevel = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'completed' | 'failed';

export interface Task {
  id: string;
  title: string;
  isNonNegotiable: boolean;
  energyLevel: EnergyLevel;
  status: TaskStatus;
  snoozeCount: number;
  didCommit: boolean;
  projectId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DailyStat {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  score: number;
  focusMinutes: number;
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  createdAt: number;
  updatedAt: number;
}

const TASKS_KEY = '@forge:tasks';
const DAILY_STATS_KEY = '@forge:daily_stats';
const PROJECTS_KEY = '@forge:projects';

class StorageService {
  // Tasks
  async getTasks(): Promise<Task[]> {
    try {
      const data = await AsyncStorage.getItem(TASKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }

  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const tasks = await this.getTasks();
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    tasks.push(newTask);
    await this.saveTasks(tasks);
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    const tasks = await this.getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = {
        ...tasks[index],
        ...updates,
        updatedAt: Date.now(),
      };
      await this.saveTasks(tasks);
    }
  }

  async deleteTask(id: string): Promise<void> {
    const tasks = await this.getTasks();
    const filtered = tasks.filter(t => t.id !== id);
    await this.saveTasks(filtered);
  }

  async getTasksForToday(): Promise<Task[]> {
    const tasks = await this.getTasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return tasks.filter(t => 
      t.createdAt >= today.getTime() && 
      t.createdAt < tomorrow.getTime()
    );
  }

  // Daily Stats
  async getDailyStats(): Promise<DailyStat[]> {
    try {
      const data = await AsyncStorage.getItem(DAILY_STATS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting daily stats:', error);
      return [];
    }
  }

  async saveDailyStats(stats: DailyStat[]): Promise<void> {
    try {
      await AsyncStorage.setItem(DAILY_STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving daily stats:', error);
    }
  }

  async getDailyStatForDate(date: string): Promise<DailyStat | null> {
    const stats = await this.getDailyStats();
    return stats.find(s => s.date === date) || null;
  }

  async updateDailyStat(date: string, updates: Partial<DailyStat>): Promise<void> {
    const stats = await this.getDailyStats();
    const index = stats.findIndex(s => s.date === date);
    
    if (index !== -1) {
      stats[index] = {
        ...stats[index],
        ...updates,
        updatedAt: Date.now(),
      };
    } else {
      stats.push({
        id: Date.now().toString(),
        date,
        score: 0,
        focusMinutes: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...updates,
      });
    }
    
    await this.saveDailyStats(stats);
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    try {
      const data = await AsyncStorage.getItem(PROJECTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting projects:', error);
      return [];
    }
  }

  async saveProjects(projects: Project[]): Promise<void> {
    try {
      await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  }

  async addProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const projects = await this.getProjects();
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    projects.push(newProject);
    await this.saveProjects(projects);
    return newProject;
  }
}

export const storage = new StorageService();
