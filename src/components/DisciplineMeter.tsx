import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withSpring,
    interpolate,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { DisciplineService } from '../services/DisciplineService';

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

    // Get color and status based on score
    const color = DisciplineService.getScoreHexColor(score);
    const status = DisciplineService.getScoreStatus(score);

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size}>
                {/* Background Circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#1a1a1a"
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
        fontSize: 64,
        fontWeight: '900',
        letterSpacing: -3,
        lineHeight: 64,
    },
    statusLabel: {
        fontSize: 14,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 3,
        marginTop: 8,
    },
    disciplineLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: '#666',
        letterSpacing: 2,
        marginTop: 2,
    },
});
