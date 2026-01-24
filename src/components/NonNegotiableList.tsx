import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Task from '../database/models/Task';
import { TaskItem } from './TaskItem';
import { theme } from '../theme/styles';

interface NonNegotiablesListProps {
    tasks: Task[];
}

export const NonNegotiablesList: React.FC<NonNegotiablesListProps> = ({ tasks }) => {
    // Filter for Non-Negotiable tasks (limit to 3 for the "List" view if desired, but showing all pending for now)
    const nonNegotiables = tasks.filter(t => t.isNonNegotiable && t.status !== 'completed');

    if (nonNegotiables.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>NON-NEGOTIABLES</Text>
            <View style={styles.list}>
                {nonNegotiables.map(task => (
                    <TaskItem key={task.id} task={task} />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.xl,
    },
    title: {
        ...theme.typography.h3,
        color: theme.colors.white,
        marginBottom: theme.spacing.m,
        letterSpacing: 0.5,
    },
    list: {
        gap: theme.spacing.s,
    },
});
