import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import {
    CheckCircle2,
    Circle,
    Flame,
    Zap,
    Battery,
    Target,
    Clock,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import withObservables from '@nozbe/with-observables';
import Task from '../database/models/Task';

interface TaskItemProps {
    task: Task;
    onUpdate?: () => void;
}

const TaskItemComponent: React.FC<TaskItemProps> = ({ task, onUpdate }) => {
    const handleToggleComplete = async () => {
        await task.toggleStatus();
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onUpdate?.();
    };

    const handleCommit = async () => {
        if (!task.didCommit) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

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
                            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            onUpdate?.();
                        },
                    },
                ]
            );
        }
    };

    const handleSnooze = async () => {
        await task.incrementSnooze();
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onUpdate?.();
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
        <View
            style={[
                styles.container,
                task.isNonNegotiable && styles.nonNegotiable,
                task.didCommit && styles.committed,
            ]}
        >
            {/* Checkbox */}
            <TouchableOpacity onPress={handleToggleComplete} style={styles.checkbox}>
                {isCompleted ? (
                    <CheckCircle2 size={24} color="#00FF94" />
                ) : (
                    <Circle size={24} color="#666" />
                )}
            </TouchableOpacity>

            {/* Content */}
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
                        <View style={styles.snoozeBadge}>
                            <Clock size={12} color="#FF8C00" />
                            <Text style={styles.snoozeText}>{task.snoozeCount}</Text>
                        </View>
                    )}

                    {task.didCommit && (
                        <View style={styles.commitBadge}>
                            <Text style={styles.commitText}>💪 COMMITTED</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
                {/* Commit Button */}
                {!task.didCommit && (
                    <TouchableOpacity
                        onPress={handleCommit}
                        style={styles.commitButton}
                    >
                        <Target size={20} color="#FFD700" />
                    </TouchableOpacity>
                )}

                {/* Snooze Button */}
                <TouchableOpacity onPress={handleSnooze} style={styles.snoozeButton}>
                    <Clock size={18} color="#666" />
                </TouchableOpacity>
            </View>
        </View>
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
    committed: {
        borderColor: '#FFD700',
        borderWidth: 2,
        // Glow effect for committed tasks
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
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
    snoozeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FF8C0020',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    snoozeText: {
        fontSize: 12,
        color: '#FF8C00',
        fontWeight: '600',
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
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginLeft: 8,
    },
    commitButton: {
        padding: 8,
        backgroundColor: '#FFD70020',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    snoozeButton: {
        padding: 8,
    },
});

export const TaskItem = withObservables(['task'], ({ task }) => ({
    task
}))(TaskItemComponent);
