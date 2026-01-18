# 🔥 Forge: Discipline OS

**A Performance Management App That Treats Your Day Like a Workout for Character**

Unlike regular to-do lists, Forge gamifies productivity using a **Discipline Score (0-100)** that reflects your commitment to completing tasks, especially the non-negotiables.

---

## 🎯 Core Concept

Your day is a **Character Workout**. Every task is a rep. Non-negotiables are heavy lifts (3x weight). Breaking commitments or snoozing tasks costs you discipline points.

---

## ⚡ Features

### 1. **Discipline Score Engine**
- Real-time score calculation based on task completion
- **Weighted System:**
  - Non-Negotiable tasks = **3x weight**
  - Standard tasks = **1x weight**
- **Penalties:**
  - **-5 points** per snooze
  - **-10 points** for breaking a commitment

### 2. **Task Management**
- **Energy Levels:** High 🔥, Medium ⚡, Low 🔋
- **Non-Negotiables:** Your top 3 most important tasks
- **Commit Feature:** Long-press a task to commit (breaking it = -10 points)
- **Snooze Tracking:** Each snooze costs discipline points

### 3. **Cyberpunk UI**
- Pure black (#000000) background
- Neon green (#00FF94) accents
- Animated circular discipline meter
- Real-time updates using WatermelonDB observables

### 4. **Local-First Architecture**
- **No cloud login required**
- All data stored locally in SQLite via WatermelonDB
- Instant UI updates with observables
- Works completely offline

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Expo (TypeScript)** |
| Database | **WatermelonDB (SQLite)** |
| Animations | **React Native Reanimated** |
| State Management | **Zustand + WatermelonDB Observables** |
| Icons | **Lucide React Native** |

---

## 📦 Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start the app
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

---

## 📊 Database Schema

### Tasks Table
```typescript
{
  title: string
  is_non_negotiable: boolean
  energy_level: 'high' | 'medium' | 'low'
  status: 'pending' | 'completed' | 'failed'
  snooze_count: number
  did_commit: boolean
  project_id?: string
  created_at: timestamp
  updated_at: timestamp
}
```

### DailyStats Table
```typescript
{
  date: string (ISO format YYYY-MM-DD)
  score: number (0-100)
  focus_minutes: number
  created_at: timestamp
  updated_at: timestamp
}
```

### Projects Table
```typescript
{
  name: string
  color: string
  created_at: timestamp
  updated_at: timestamp
}
```

---

## 🎮 How to Use

### 1. **Add a Task**
- Enter task title
- Select energy level (High/Med/Low)
- Toggle Non-Negotiable for 3x weight
- Tap "Add Task"

### 2. **Commit to a Task**
- **Long-press** any task to commit
- This creates accountability (-10 points if you don't complete it)

### 3. **Complete Tasks**
- Tap the checkbox to mark complete
- Watch your discipline score update in real-time

### 4. **Snooze (Use Wisely)**
- Tap the ⏰ icon to snooze
- Each snooze costs **-5 discipline points**

### 5. **Filter by Energy**
- Use the energy filter chips to view tasks by energy level
- Perfect for matching tasks to your current state

---

## 🧮 Discipline Score Formula

```
Score = (Earned Weight / Total Weight) × 100 - Penalties

Where:
- Earned Weight = Sum of weights for completed tasks
- Total Weight = Sum of all task weights
- Penalties = (Snooze Count × 5) + (Broken Commitments × 10)
```

### Example:
```
Tasks:
- [✓] Non-Negotiable Task (3 weight) - Completed
- [✓] Standard Task (1 weight) - Completed
- [ ] Standard Task (1 weight) - Pending, Committed, Snoozed 2x

Calculation:
Earned Weight = 3 + 1 = 4
Total Weight = 3 + 1 + 1 = 5
Base Score = (4/5) × 100 = 80

Penalties:
- Snoozes: 2 × 5 = 10
- Broken Commitment: 1 × 10 = 10
Total Penalties = 20

Final Score = 80 - 20 = 60
```

---

## 🎨 Design Philosophy

### Cyberpunk Minimalism
- **Pure Black (#000000):** Maximum contrast, OLED-friendly
- **Neon Green (#00FF94):** Primary accent for success states
- **Gold (#FFD700):** Commitment indicators
- **Red (#FF1744):** Warnings and low scores

### Interaction Design
- **Long-press to commit:** Deliberate action prevents accidental commits
- **Instant feedback:** All actions update the score immediately
- **Visual hierarchy:** Non-negotiables stand out with 2px borders
- **Energy-based filtering:** Match tasks to your current energy level

---

## 🚀 Future Enhancements

- [ ] Focus Timer with Pomodoro technique
- [ ] Weekly/Monthly analytics dashboard
- [ ] Streak tracking
- [ ] Custom project colors
- [ ] Export data to CSV
- [ ] Dark mode variants (cyberpunk, matrix, synthwave)
- [ ] Haptic feedback for commitments
- [ ] Widget support

---

## 📝 License

MIT License - Build your discipline, one task at a time.

---

## 💪 Philosophy

> "Discipline is the bridge between goals and accomplishment."
> 
> Forge treats your daily tasks like a workout. Every completion is a rep. Every commitment is a set. Your discipline score is your 1RM.
> 
> **Train your character. Build your discipline. Forge yourself.**

---

Built with ⚡ by developers who believe productivity should be gamified, local-first, and beautiful.
