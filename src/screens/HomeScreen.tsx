import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    SafeAreaView,
    RefreshControl,
} from 'react-native';
import { Plus, Flame, Zap, Battery, Filter } from 'lucide-react-native';
import { DisciplineMeter } from '../components/DisciplineMeter';
import { DisciplineScoreService } from '../services/DisciplineScoreService';
import { storage, Task, EnergyLevel } from '../services/StorageService';
import { useAppStore } from '../store/appStore';

export const HomeScreen: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel>('medium');
    const [isNonNegotiable, setIsNonNegotiable] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const { currentScore, setCurrentScore, selectedEnergyFilter, setEnergyFilter } = useAppStore();

    const loadData = useCallback(async () => {
        const todayTasks = await storage.getTasksForToday();
        setTasks(todayTasks);
        const score = await DisciplineScoreService.getTodayScore();
        setCurrentScore(score);
    }, [setCurrentScore]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [loadData]);

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) {
            Alert.alert('Error', 'Please enter a task title');
            return;
        }

        await storage.addTask({
            title: newTaskTitle.trim(),
            isNonNegotiable,
            energyLevel: selectedEnergy,
            status: 'pending',
            snoozeCount: 0,
            didCommit: false,
        });

        setNewTaskTitle('');
        setIsNonNegotiable(false);
        await loadData();
    };

    const handleToggleComplete = async (task: Task) => {
        await storage.updateTask(task.id, {
            status: task.status === 'completed' ? 'pending' : 'completed',
        });
        await DisciplineScoreService.updateTodayScore();
        await loadData();
    };

    const handleCommit = async (task: Task) => {
        if (!task.didCommit) {
            Alert.alert(
                '💪 Commit to This Task?',
                'By committing, you pledge to complete this task. Breaking this commitment will cost you -10 discipline points.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Commit',
                        style: 'default',
                        onPress: async () => {
                            await storage.updateTask(task.id, { didCommit: true });
                            await loadData();
                            Alert.alert('✅ Committed!', "You've made a commitment. Don't break it!");
                        },
                    },
                ]
            );
        }
    };

    const handleSnooze = async (task: Task) => {
        await storage.updateTask(task.id, {
            snoozeCount: task.snoozeCount + 1,
        });
        await DisciplineScoreService.updateTodayScore();
        await loadData();
        Alert.alert('⏰ Task Snoozed', 'This will cost you -5 discipline points.');
    };

    // Filter tasks
    const filteredTasks = tasks.filter((task) => {
        if (selectedEnergyFilter === 'all') return true;
        return task.energyLevel === selectedEnergyFilter;
    });

    // Get non-negotiables (top 3)
    const nonNegotiables = tasks
        .filter((t) => t.isNonNegotiable && t.status !== 'completed')
        .slice(0, 3);

    // Get pending tasks
    const pendingTasks = filteredTasks.filter((t) => t.status === 'pending');

    const getEnergyIcon = (level: EnergyLevel) => {
        switch (level) {
            case 'high':
                return <Flame size={16} color="#FF1744" />;
            case 'medium':
                return <Zap size={16} color="#FFD700" />;
            case 'low':
                return <Battery size={16} color="#00FF94" />;
        }
    };

    const renderTask = (task: Task) => {
        const isCompleted = task.status === 'completed';

        return (
            <TouchableOpacity
                key={task.id}
                onLongPress={() => handleCommit(task)}
                style={[
                    styles.taskContainer,
                    task.isNonNegotiable && styles.nonNegotiable,
                    task.didCommit && styles.committed,
                ]}
            >
                <TouchableOpacity onPress={() => handleToggleComplete(task)} style={styles.checkbox}>
                    <Text style={styles.checkboxText}>{isCompleted ? '✅' : '⭕'}</Text>
                </TouchableOpacity>

                <View style={styles.taskContent}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.taskTitle, isCompleted && styles.completedText]}>
                            {task.title}
                        </Text>
                        {task.isNonNegotiable && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>3x</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.metaRow}>
                        <View style={styles.energyBadge}>
                            {getEnergyIcon(task.energyLevel)}
                            <Text style={styles.energyText}>{task.energyLevel}</Text>
                        </View>

                        {task.snoozeCount > 0 && (
                            <Text style={styles.snoozeText}>⏰ {task.snoozeCount}</Text>
                        )}

                        {task.didCommit && (
                            <View style={styles.commitBadge}>
                                <Text style={styles.commitText}>💪 COMMITTED</Text>
                            </View>
                        )}
                    </View>
                </View>

                <TouchableOpacity onPress={() => handleSnooze(task)} style={styles.snoozeButton}>
                    <Text style={styles.snoozeButtonText}>⏰</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00FF94" />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>FORGE</Text>
                    <Text style={styles.headerSubtitle}>Discipline OS</Text>
                </View>

                {/* Discipline Meter */}
                <View style={styles.meterSection}>
                    <DisciplineMeter score={currentScore} size={220} />
                    <Text style={styles.meterLabel}>Your Character Workout Score</Text>
                </View>

                {/* Non-Negotiables Card */}
                {nonNegotiables.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>⚡ NON-NEGOTIABLES</Text>
                            <View style={styles.weightBadge}>
                                <Text style={styles.weightBadgeText}>3x WEIGHT</Text>
                            </View>
                        </View>
                        <View style={styles.card}>
                            {nonNegotiables.map(renderTask)}
                        </View>
                    </View>
                )}

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
                                <Flame size={16} color={selectedEnergy === 'high' ? '#FF1744' : '#666'} />
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
                                <Zap size={16} color={selectedEnergy === 'medium' ? '#FFD700' : '#666'} />
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
                                <Battery size={16} color={selectedEnergy === 'low' ? '#00FF94' : '#666'} />
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

                {/* Task Lab */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>🔬 TASK LAB</Text>
                        <TouchableOpacity style={styles.filterButton}>
                            <Filter size={16} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Energy Filter */}
                    <View style={styles.filterRow}>
                        {(['all', 'high', 'medium', 'low'] as const).map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                style={[
                                    styles.filterChip,
                                    selectedEnergyFilter === filter && styles.filterChipActive,
                                ]}
                                onPress={() => setEnergyFilter(filter)}
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        selectedEnergyFilter === filter && styles.filterChipTextActive,
                                    ]}
                                >
                                    {filter.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.taskList}>
                        {pendingTasks.length === 0 ? (
                            <Text style={styles.emptyText}>No pending tasks. Add one above! 🚀</Text>
                        ) : (
                            pendingTasks.map(renderTask)
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000',
    },
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    contentContainer: {
        padding: 20,
    },
    header: {
        marginBottom: 32,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#00FF94',
        letterSpacing: 4,
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 1,
    },
    weightBadge: {
        backgroundColor: '#00FF9420',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    weightBadgeText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#00FF94',
    },
    card: {
        backgroundColor: '#0a0a0a',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#1a1a1a',
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
    filterButton: {
        padding: 8,
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
    taskList: {
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        padding: 32,
    },
    taskContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1a1a1a',
    },
    nonNegotiable: {
        borderColor: '#00FF94',
        borderWidth: 2,
    },
    committed: {
        borderColor: '#FFD700',
    },
    checkbox: {
        marginRight: 12,
    },
    checkboxText: {
        fontSize: 24,
    },
    taskContent: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        flex: 1,
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: '#666',
    },
    badge: {
        backgroundColor: '#00FF94',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#000',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    energyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    energyText: {
        fontSize: 12,
        color: '#666',
        textTransform: 'uppercase',
    },
    snoozeText: {
        fontSize: 12,
        color: '#FF8C00',
    },
    commitBadge: {
        backgroundColor: '#FFD70020',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    commitText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFD700',
    },
    snoozeButton: {
        padding: 8,
    },
    snoozeButtonText: {
        fontSize: 18,
    },
});
