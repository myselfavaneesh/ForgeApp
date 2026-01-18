import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    SafeAreaView,
} from 'react-native';
import { Plus, Flame, Zap, Battery } from 'lucide-react-native';
import { Q } from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';
import { database } from '../database';
import Task, { EnergyLevel } from '../database/models/Task';
import { DisciplineMeter } from '../components/DisciplineMeter';
import { TaskItem } from '../components/TaskItem';
import { DisciplineService } from '../services/DisciplineService';
import { StatsService } from '../services/StatsService';

type EnergyFilter = 'all' | 'high' | 'medium' | 'low';

interface HomeScreenProps {
    tasks: Task[];
}

const HomeScreenComponent: React.FC<HomeScreenProps> = ({ tasks }) => {
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel>('medium');
    const [isNonNegotiable, setIsNonNegotiable] = useState(false);
    const [energyFilter, setEnergyFilter] = useState<EnergyFilter>('all');

    // Calculate real-time discipline score
    const score = DisciplineService.getScore(tasks);

    // Sync score to database whenever it changes
    React.useEffect(() => {
        const syncScore = async () => {
            await StatsService.syncScore(score);
        };
        syncScore();
    }, [score]);


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

    const getEnergyIcon = (level: EnergyLevel, isActive: boolean) => {
        const color = isActive ? getEnergyColor(level) : '#666';
        switch (level) {
            case 'high':
                return <Flame size={16} color={color} />;
            case 'medium':
                return <Zap size={16} color={color} />;
            case 'low':
                return <Battery size={16} color={color} />;
        }
    };

    const getEnergyColor = (level: EnergyLevel) => {
        switch (level) {
            case 'high':
                return '#FF1744';
            case 'medium':
                return '#FFD700';
            case 'low':
                return '#00FF94';
        }
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
                    <Text style={styles.meterLabel}>Your Character Workout Score</Text>
                </View>

                {/* Add Task Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>➕ ADD TASK</Text>
                    <View style={styles.addTaskCard}>
                        <TextInput
                            style={styles.input}
                            placeholder="What needs to be done?"
                            placeholderTextColor="#666"
                            value={newTaskTitle}
                            onChangeText={setNewTaskTitle}
                            onSubmitEditing={handleAddTask}
                        />

                        {/* Energy Level Selector */}
                        <View style={styles.energySelector}>
                            <Text style={styles.energyLabel}>Energy:</Text>

                            <TouchableOpacity
                                style={[
                                    styles.energyButton,
                                    selectedEnergy === 'high' && styles.energyButtonActive,
                                ]}
                                onPress={() => setSelectedEnergy('high')}
                            >
                                {getEnergyIcon('high', selectedEnergy === 'high')}
                                <Text
                                    style={[
                                        styles.energyButtonText,
                                        selectedEnergy === 'high' && styles.energyButtonTextActive,
                                    ]}
                                >
                                    High
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.energyButton,
                                    selectedEnergy === 'medium' && styles.energyButtonActive,
                                ]}
                                onPress={() => setSelectedEnergy('medium')}
                            >
                                {getEnergyIcon('medium', selectedEnergy === 'medium')}
                                <Text
                                    style={[
                                        styles.energyButtonText,
                                        selectedEnergy === 'medium' && styles.energyButtonTextActive,
                                    ]}
                                >
                                    Med
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.energyButton,
                                    selectedEnergy === 'low' && styles.energyButtonActive,
                                ]}
                                onPress={() => setSelectedEnergy('low')}
                            >
                                {getEnergyIcon('low', selectedEnergy === 'low')}
                                <Text
                                    style={[
                                        styles.energyButtonText,
                                        selectedEnergy === 'low' && styles.energyButtonTextActive,
                                    ]}
                                >
                                    Low
                                </Text>
                            </TouchableOpacity>
                        </View>

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
                            <Plus size={20} color="#000" />
                            <Text style={styles.addButtonText}>Add Task</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Task Lab with Energy Filter */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🔬 TASK LAB</Text>

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
                            No tasks yet. Add one above! 🚀
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
        backgroundColor: '#000000', // Pitch black background
    },
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    contentContainer: {
        padding: 20,
    },
    header: {
        marginBottom: 32,
    },
    headerTitle: {
        fontSize: 36,
        fontWeight: '900',
        color: '#00FF94',
        letterSpacing: 6,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        letterSpacing: 2,
        marginTop: 4,
    },
    meterSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    meterLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 16,
        letterSpacing: 1,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 1,
        marginBottom: 16,
    },
    addTaskCard: {
        backgroundColor: '#0a0a0a',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#1a1a1a',
    },
    input: {
        backgroundColor: '#000',
        borderRadius: 8,
        padding: 12,
        color: '#fff',
        fontSize: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#1a1a1a',
    },
    energySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    energyLabel: {
        fontSize: 14,
        color: '#666',
        marginRight: 8,
    },
    energyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#000',
        borderWidth: 1,
        borderColor: '#1a1a1a',
    },
    energyButtonActive: {
        borderColor: '#00FF94',
    },
    energyButtonText: {
        fontSize: 12,
        color: '#666',
    },
    energyButtonTextActive: {
        color: '#fff',
    },
    toggleButton: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#000',
        borderWidth: 1,
        borderColor: '#1a1a1a',
        marginBottom: 16,
        alignItems: 'center',
    },
    toggleButtonActive: {
        backgroundColor: '#00FF9420',
        borderColor: '#00FF94',
    },
    toggleButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    toggleButtonTextActive: {
        color: '#00FF94',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#00FF94',
        padding: 16,
        borderRadius: 8,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
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
        backgroundColor: '#0a0a0a',
        borderWidth: 1,
        borderColor: '#1a1a1a',
    },
    filterChipActive: {
        backgroundColor: '#00FF9420',
        borderColor: '#00FF94',
    },
    filterChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    filterChipTextActive: {
        color: '#00FF94',
    },
    taskSection: {
        marginBottom: 24,
    },
    taskSectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        letterSpacing: 1,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        padding: 32,
    },
});
