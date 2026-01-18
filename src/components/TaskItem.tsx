import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Pressable,
    Alert,
} from 'react-native';
import { CheckCircle2, Circle, Flame, Zap, Battery } from 'lucide-react-native';
import Task from '../database/models/Task';
import { DisciplineScoreService } from '../services/DisciplineScoreService';

interface TaskItemProps {
    task: Task;
    onScoreUpdate?: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onScoreUpdate }) => {
    const [isLongPressing, setIsLongPressing] = useState(false);

    const handleToggleComplete = async () => {
        await task.toggleStatus();
        await DisciplineScoreService.updateTodayScore();
        onScoreUpdate?.();
    };

    const handleLongPress = async () => {
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
                            await task.commit();
                            Alert.alert('✅ Committed!', 'You\'ve made a commitment. Don\'t break it!');
                        },
                    },
                ]
            );
        }
    };

    const handleSnooze = async () => {
        await task.incrementSnooze();
        await DisciplineScoreService.updateTodayScore();
        onScoreUpdate?.();
        Alert.alert('⏰ Task Snoozed', 'This will cost you -5 discipline points.');
    };

    const getEnergyIcon = () => {
        switch (task.energyLevel) {
            case 'high':
                return <Flame size={16} color="#FF1744" />;
            case 'medium':
                return <Zap size={16} color="#FFD700" />;
            case 'low':
                return <Battery size={16} color="#00FF94" />;
        }
    };

    const isCompleted = task.status === 'completed';

    return (
        <Pressable
            onLongPress={handleLongPress}
            onPressIn={() => setIsLongPressing(true)}
            onPressOut={() => setIsLongPressing(false)}
            delayLongPress={500}
            style={[
                styles.container,
                task.isNonNegotiable && styles.nonNegotiable,
                isLongPressing && styles.pressing,
                task.didCommit && styles.committed,
            ]}
        >
            <TouchableOpacity onPress={handleToggleComplete} style={styles.checkbox}>
                {isCompleted ? (
                    <CheckCircle2 size={24} color="#00FF94" />
                ) : (
                    <Circle size={24} color="#666" />
                )}
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={styles.titleRow}>
                    <Text style={[styles.title, isCompleted && styles.completedText]}>
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
                        {getEnergyIcon()}
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

            <TouchableOpacity onPress={handleSnooze} style={styles.snoozeButton}>
                <Text style={styles.snoozeButtonText}>⏰</Text>
            </TouchableOpacity>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
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
    pressing: {
        backgroundColor: '#1a1a1a',
        transform: [{ scale: 0.98 }],
    },
    committed: {
        borderColor: '#FFD700',
    },
    checkbox: {
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
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
