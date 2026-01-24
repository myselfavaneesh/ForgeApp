import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Alert,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { Q } from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';
import { database } from '../database';
import Task, { EnergyLevel } from '../database/models/Task';
import { DisciplineMeter } from '../components/DisciplineMeter';
import { TaskItem } from '../components/TaskItem';
import { EnergySelector } from '../components/EnergySelector';
import { NonNegotiablesList } from '../components/NonNegotiableList';
import { DisciplineService } from '../services/DisciplineService';
import { StatsService } from '../services/StatsService';
import { AuditService } from '../services/AuditService';
import { theme } from '../theme/styles';

type EnergyFilter = 'all' | 'high' | 'medium' | 'low';

interface HomeScreenProps {
    tasks: Task[];
}

const HomeScreenComponent: React.FC<HomeScreenProps> = ({ tasks }) => {
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel>('medium');
    const [isNonNegotiable, setIsNonNegotiable] = useState(false);
    const [energyFilter, setEnergyFilter] = useState<EnergyFilter>('all');

    // Calculate real-time discipline score with Energy Bonus
    const score = DisciplineService.getScore(tasks, selectedEnergy);

    // Sync score to database whenever it changes
    React.useEffect(() => {
        const syncScore = async () => {
            await StatsService.syncScore(score);
        };
        syncScore();
    }, [score]);

    // Run Audit on Mount
    React.useEffect(() => {
        // Check for end-of-day audit
        AuditService.performReviewIfNeeded();
    }, []);


    // Filter tasks based on energy level
    const getFilteredTasks = () => {
        if (energyFilter === 'all') return tasks;

        // If "High" is selected, show all tasks (if you can do high, you can do all)
        if (energyFilter === 'high') return tasks;

        // For medium and low, filter accordingly
        return tasks.filter(task => task.energyLevel === energyFilter);
    };

    const filteredTasks = getFilteredTasks();
    const pendingTasks = filteredTasks.filter(t => t.status === 'pending');
    const completedTasks = filteredTasks.filter(t => t.status === 'completed');

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) {
            Alert.alert('Error', 'Please enter a task title');
            return;
        }

        const tasksCollection = database.collections.get<Task>('tasks');

        await database.write(async () => {
            await tasksCollection.create(task => {
                task.title = newTaskTitle.trim();
                task.isNonNegotiable = isNonNegotiable;
                task.energyLevel = selectedEnergy;
                task.status = 'pending';
                task.snoozeCount = 0;
                task.didCommit = false;
            });
        });

        setNewTaskTitle('');
        setIsNonNegotiable(false);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>FORGE</Text>
                    <Text style={styles.headerSubtitle}>Discipline OS</Text>
                </View>

                {/* Discipline Meter - Updates in real-time */}
                <View style={styles.meterSection}>
                    <DisciplineMeter score={score} size={240} />
                    <Text style={styles.meterLabel}>Discipline Integrity: {DisciplineService.getScoreStatus(score)}</Text>
                </View>

                {/* Energy Level Selector */}
                <EnergySelector
                    selectedEnergy={selectedEnergy}
                    onSelect={setSelectedEnergy}
                />

                {/* Add Task Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>new Protocol</Text>
                    <View style={styles.addTaskCard}>
                        <TextInput
                            style={styles.input}
                            placeholder="What needs to be done?"
                            placeholderTextColor={theme.colors.textDim}
                            value={newTaskTitle}
                            onChangeText={setNewTaskTitle}
                            onSubmitEditing={handleAddTask}
                        />

                        {/* Non-Negotiable Toggle */}
                        <TouchableOpacity
                            style={[styles.toggleButton, isNonNegotiable && styles.toggleButtonActive]}
                            onPress={() => setIsNonNegotiable(!isNonNegotiable)}
                        >
                            <Text
                                style={[
                                    styles.toggleButtonText,
                                    isNonNegotiable && styles.toggleButtonTextActive,
                                ]}
                            >
                                {isNonNegotiable ? '⚡ NON-NEGOTIABLE (3x)' : 'Standard Task (1x)'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
                            <Plus size={20} color={theme.colors.black} />
                            <Text style={styles.addButtonText}>Add Task</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Non-Negotiables List (New Section) */}
                <NonNegotiablesList tasks={tasks} />

                {/* Task Lab with Energy Filter */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>TASK LAB</Text>

                    {/* Energy Filter Pills */}
                    <View style={styles.filterRow}>
                        {(['all', 'high', 'medium', 'low'] as const).map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                style={[
                                    styles.filterChip,
                                    energyFilter === filter && styles.filterChipActive,
                                ]}
                                onPress={() => setEnergyFilter(filter)}
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        energyFilter === filter && styles.filterChipTextActive,
                                    ]}
                                >
                                    {filter.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Pending Tasks */}
                    {pendingTasks.length > 0 && (
                        <View style={styles.taskSection}>
                            <Text style={styles.taskSectionTitle}>
                                Pending ({pendingTasks.length})
                            </Text>
                            {pendingTasks.map(task => (
                                <TaskItem key={task.id} task={task} />
                            ))}
                        </View>
                    )}

                    {/* Completed Tasks */}
                    {completedTasks.length > 0 && (
                        <View style={styles.taskSection}>
                            <Text style={styles.taskSectionTitle}>
                                Completed ({completedTasks.length})
                            </Text>
                            {completedTasks.map(task => (
                                <TaskItem key={task.id} task={task} />
                            ))}
                        </View>
                    )}

                    {/* Empty State */}
                    {filteredTasks.length === 0 && (
                        <Text style={styles.emptyText}>
                            No tasks yet. Add one above!
                        </Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// Enhance with WatermelonDB observables for real-time updates
const enhance = withObservables([], () => ({
    tasks: database.collections.get<Task>('tasks').query(
        Q.sortBy('created_at', Q.desc)
    ),
}));

export const HomeScreen = enhance(HomeScreenComponent);

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    contentContainer: {
        padding: 20,
    },
    header: {
        marginBottom: 32,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        ...theme.typography.h1,
        color: theme.colors.primary,
        letterSpacing: 4,
    },
    themeToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 6,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.surfaceLight,
    },
    themeToggleIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.textDim,
    },
    themeToggleText: {
        ...theme.typography.caption,
        fontSize: 10,
        color: theme.colors.textDim,
    },
    headerSubtitle: {
        ...theme.typography.caption,
        color: theme.colors.textDim,
        letterSpacing: 2,
        marginTop: 4,
    },
    meterSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    meterLabel: {
        ...theme.typography.caption,
        color: theme.colors.textDim,
        marginTop: 16,
        letterSpacing: 1,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        ...theme.typography.caption,
        color: theme.colors.white,
        letterSpacing: 1,
        marginBottom: 16,
        textTransform: 'uppercase',
    },
    addTaskCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.colors.surfaceLight,
    },
    input: {
        backgroundColor: theme.colors.background,
        borderRadius: 8,
        padding: 12,
        color: theme.colors.white,
        fontSize: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.surfaceLight,
    },
    toggleButton: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.surfaceLight,
        marginBottom: 16,
        alignItems: 'center',
    },
    toggleButtonActive: {
        backgroundColor: 'rgba(0, 255, 148, 0.1)',
        borderColor: theme.colors.primary,
    },
    toggleButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textDim,
    },
    toggleButtonTextActive: {
        color: theme.colors.primary,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: theme.colors.primary,
        padding: 16,
        borderRadius: 8,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.black,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.surfaceLight,
    },
    filterChipActive: {
        backgroundColor: 'rgba(0, 255, 148, 0.1)',
        borderColor: theme.colors.primary,
    },
    filterChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.textDim,
    },
    filterChipTextActive: {
        color: theme.colors.primary,
    },
    taskSection: {
        marginBottom: 24,
    },
    taskSectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.textDim,
        letterSpacing: 1,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    emptyText: {
        fontSize: 14,
        color: theme.colors.textDim,
        textAlign: 'center',
        padding: 32,
    },
});
