import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Flame, Zap, Battery } from 'lucide-react-native';
import { theme } from '../theme/styles';
import { EnergyLevel } from '../database/models/Task';

interface EnergySelectorProps {
    selectedEnergy: EnergyLevel;
    onSelect: (level: EnergyLevel) => void;
}

export const EnergySelector: React.FC<EnergySelectorProps> = ({ selectedEnergy, onSelect }) => {
    const getIcon = (level: EnergyLevel, isActive: boolean) => {
        const color = isActive ? theme.colors.white : theme.colors.textDim;
        const size = 20;
        switch (level) {
            case 'high': return <Flame size={size} color={isActive ? theme.colors.error : color} />;
            case 'medium': return <Zap size={size} color={isActive ? theme.colors.warning : color} />;
            case 'low': return <Battery size={size} color={isActive ? theme.colors.success : color} />;
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>ENERGY LEVEL</Text>
            <View style={styles.buttonGroup}>
                {(['low', 'medium', 'high'] as const).map((level) => {
                    const isActive = selectedEnergy === level;
                    return (
                        <TouchableOpacity
                            key={level}
                            style={[
                                styles.button,
                                isActive && styles.buttonActive
                            ]}
                            onPress={() => onSelect(level)}
                        >
                            {getIcon(level, isActive)}
                            <Text style={[styles.buttonText, isActive && styles.textActive]}>
                                {level.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.l,
    },
    label: {
        ...theme.typography.caption,
        color: theme.colors.textDim,
        marginBottom: theme.spacing.s,
        letterSpacing: 1,
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: theme.spacing.s,
    },
    button: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.m,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        borderWidth: 1,
        borderColor: theme.colors.surfaceLight,
        gap: theme.spacing.xs,
    },
    buttonActive: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.surfaceLight,
        ...theme.shadows.glow, // Subtle glow
    },
    buttonText: {
        ...theme.typography.caption,
        fontSize: 10,
        color: theme.colors.textDim,
    },
    textActive: {
        color: theme.colors.white,
        fontWeight: 'bold',
    },
});
