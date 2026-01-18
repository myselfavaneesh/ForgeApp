# 🚀 Development Guide

## Quick Start

```bash
# Clear cache and start
npm run clear

# Or just start normally
npm start
```

## Project Structure

```
ForgeApp/
├── src/
│   ├── database/
│   │   ├── models/
│   │   │   ├── Task.ts          # Task model with decorators
│   │   │   ├── DailyStat.ts     # Daily stats model
│   │   │   └── Project.ts       # Project model
│   │   ├── schema/
│   │   │   └── index.ts         # WatermelonDB schema
│   │   └── index.ts             # Database initialization
│   ├── services/
│   │   └── DisciplineScoreService.ts  # Score calculation engine
│   ├── store/
│   │   └── appStore.ts          # Zustand global state
│   ├── components/
│   │   ├── DisciplineMeter.tsx  # Animated circular meter
│   │   └── TaskItem.tsx         # Task list item component
│   └── screens/
│       └── HomeScreen.tsx       # Main command center
├── App.tsx                      # Root component
├── babel.config.js              # Babel config with decorators
└── tsconfig.json                # TypeScript config
```

## Key Technologies

### WatermelonDB
- **Local-first** SQLite database
- **Observables** for reactive UI updates
- **Decorators** for model definitions
- **JSI** enabled for maximum performance

### React Native Reanimated
- **Smooth animations** for the discipline meter
- **60 FPS** circular progress animation
- **Gesture handling** for long-press commits

### Zustand
- **Lightweight** state management
- **No boilerplate** compared to Redux
- **Perfect for** UI state like filters

## Development Tips

### 1. Database Debugging
```typescript
// In any component, access the database:
import { database } from './src/database';

// Query tasks
const tasks = await database.get('tasks').query().fetch();
console.log(tasks);
```

### 2. Score Calculation
```typescript
import { DisciplineScoreService } from './src/services/DisciplineScoreService';

// Get today's score
const score = await DisciplineScoreService.getTodayScore();

// Force recalculation
const newScore = await DisciplineScoreService.updateTodayScore();

// Get task breakdown
const breakdown = await DisciplineScoreService.getTaskBreakdown('2026-01-19');
```

### 3. Testing Observables
The `withObservables` HOC automatically subscribes to database changes:
```typescript
const enhance = withObservables([], () => ({
  tasks: database.get('tasks').query()
}));
```

### 4. Clearing Database
If you need to reset the database during development:
```typescript
// Add this to a debug button
await database.write(async () => {
  await database.unsafeResetDatabase();
});
```

## Common Issues

### Issue: Decorators not working
**Solution:** Make sure `babel.config.js` has the decorator plugin and `tsconfig.json` has `experimentalDecorators: true`

### Issue: Reanimated not animating
**Solution:** 
1. Clear cache: `npm run clear`
2. Ensure `react-native-reanimated/plugin` is the **last** plugin in babel.config.js

### Issue: Database not persisting
**Solution:** Check that you're using `database.write()` for all mutations:
```typescript
await database.write(async () => {
  await task.update(t => { t.status = 'completed' });
});
```

## Performance Optimization

### 1. Use Observables
Always use `withObservables` for components that display database data. This ensures:
- Automatic updates when data changes
- No manual subscriptions needed
- Optimal re-rendering

### 2. Batch Updates
When updating multiple records, batch them:
```typescript
await database.write(async () => {
  await task1.update(...);
  await task2.update(...);
  await task3.update(...);
});
```

### 3. Query Optimization
Use indexes and specific queries:
```typescript
// Good: Specific query
Q.where('status', 'pending'),
Q.where('is_non_negotiable', true)

// Bad: Fetching all and filtering in JS
const all = await tasks.fetch();
const filtered = all.filter(t => t.status === 'pending');
```

## Adding New Features

### Example: Add a "Priority" field to tasks

1. **Update Schema** (`src/database/schema/index.ts`):
```typescript
{ name: 'priority', type: 'number' }
```

2. **Update Model** (`src/database/models/Task.ts`):
```typescript
@field('priority') priority!: number;
```

3. **Increment Schema Version**:
```typescript
export const schema = appSchema({
  version: 2, // Increment this
  tables: [...]
});
```

4. **Add Migration** (if needed for existing data)

## Deployment

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

### Building for Production
```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

## Resources

- [WatermelonDB Docs](https://nozbe.github.io/WatermelonDB/)
- [Reanimated Docs](https://docs.swmansion.com/react-native-reanimated/)
- [Zustand Docs](https://docs.pmnd.rs/zustand/)
- [Expo Docs](https://docs.expo.dev/)

---

Happy coding! 🔥 Build your discipline, one commit at a time.
