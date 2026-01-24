import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withSpring,
    interpolate,
    withRepeat,
    withTiming,
    useAnimatedStyle,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { DisciplineService } from '../services/DisciplineService';
import { theme } from '../theme/styles';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface DisciplineMeterProps {
    score: number;
    size?: number;
}

export const DisciplineMeter: React.FC<DisciplineMeterProps> = ({
    score,
    size = 220
}) => {
    const progress = useSharedValue(0);
    const breathe = useSharedValue(1);

    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeWidth = 12;

    useEffect(() => {
        // Animate to the new score with a spring animation
        progress.value = withSpring(score / 100, {
            damping: 15,
            stiffness: 100,
            mass: 1,
        });
    }, [score]);

    // Micro-animation: Breathing effect
    useEffect(() => {
        breathe.value = withRepeat(
            withTiming(1.05, { duration: 2000 }),
            -1,
            true
        );
    }, []);

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = interpolate(
            progress.value,
            [0, 1],
            [circumference, 0]
        );

        return {
            strokeDashoffset,
        };
    });

    const glowStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: breathe.value }],
            opacity: interpolate(breathe.value, [1, 1.05], [0.3, 0.6]),
        };
    });

    // Get color and status based on score
    const color = DisciplineService.getScoreHexColor(score);
    const status = DisciplineService.getScoreStatus(score);

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {/* Breathing Background Glow */}
            <Animated.View
                style={[
                    StyleSheet.absoluteFillObject,
                    {
                        borderRadius: size / 2,
                        backgroundColor: color,
                        ...theme.shadows.glow,
                        shadowColor: color, // Override shadow color dynamically
                    },
                    glowStyle
                ]}
            />

            <Svg width={size} height={size}>
                {/* Background Circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={theme.colors.surface}
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* Progress Circle with Animation */}
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    animatedProps={animatedProps}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>

            {/* Center Content */}
            <View style={styles.centerContent}>
                <Text style={[styles.scoreText, { color }]}>
                    {Math.round(score)}
                </Text>
                <Text style={styles.statusLabel}>{status}</Text>
                <Text style={styles.disciplineLabel}>DISCIPLINE</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContent: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreText: {
        ...theme.typography.h1,
        fontSize: 64,
        lineHeight: 70,
    },
    statusLabel: {
        ...theme.typography.caption,
        color: theme.colors.white,
        letterSpacing: 3,
        marginTop: theme.spacing.s,
    },
    disciplineLabel: {
        ...theme.typography.caption,
        fontSize: 10,
        color: theme.colors.textDim,
        letterSpacing: 2,
        marginTop: 2,
    },
});
