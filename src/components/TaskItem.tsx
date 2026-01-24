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
import Task, { EnergyLevel } from '../database/models/Task';
import { theme } from '../theme/styles';

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
                return <Flame size={16} color={theme.colors.error} />;
            case 'medium':
                return <Zap size={16} color={theme.colors.warning} />;
            case 'low':
                return <Battery size={16} color={theme.colors.success} />;
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
                    <CheckCircle2 size={24} color={theme.colors.success} />
                ) : (
                    <Circle size={24} color={theme.colors.textDim} />
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
                            <Clock size={12} color={theme.colors.warning} />
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
                        <Target size={20} color={theme.colors.warning} />
                    </TouchableOpacity>
                )}

                {/* Snooze Button */}
                <TouchableOpacity onPress={handleSnooze} style={styles.snoozeButton}>
                    <Clock size={18} color={theme.colors.textDim} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.surfaceLight,
    },
    nonNegotiable: {
        borderColor: theme.colors.primary,
        borderWidth: 2,
    },
    committed: {
        borderColor: theme.colors.warning,
        borderWidth: 2,
        ...theme.shadows.card,
        shadowColor: theme.colors.warning, // Override for commitment glow
    },
    checkbox: {
        marginRight: theme.spacing.m,
    },
    content: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.s,
    },
    title: {
        ...theme.typography.body,
        fontWeight: '600',
        color: theme.colors.white,
        flex: 1,
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: theme.colors.textDim,
    },
    badge: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.s,
        paddingVertical: 2,
        borderRadius: theme.borderRadius.s,
        marginLeft: theme.spacing.s,
    },
    badgeText: {
        ...theme.typography.caption,
        fontSize: 10,
        fontWeight: '900',
        color: theme.colors.black,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
    },
    energyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    energyText: {
        ...theme.typography.caption,
        color: theme.colors.textDim,
        textTransform: 'uppercase',
    },
    snoozeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255, 140, 0, 0.2)', // transparent orange
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: theme.borderRadius.s,
    },
    snoozeText: {
        ...theme.typography.caption,
        color: theme.colors.warning,
        fontWeight: '600',
    },
    commitBadge: {
        backgroundColor: 'rgba(255, 215, 0, 0.2)', // transparent gold
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: theme.borderRadius.s,
    },
    commitText: {
        ...theme.typography.caption,
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.warning,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.s,
        marginLeft: theme.spacing.s,
    },
    commitButton: {
        padding: theme.spacing.s,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderRadius: theme.borderRadius.m,
        borderWidth: 1,
        borderColor: theme.colors.warning,
    },
    snoozeButton: {
        padding: theme.spacing.s,
    },
});

export const TaskItem = withObservables(['task'], ({ task }) => ({
    task
}))(TaskItemComponent);
