import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface DisciplineMeterProps {
    score: number;
    size?: number;
}

export const DisciplineMeter: React.FC<DisciplineMeterProps> = ({ score, size = 200 }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: score / 100,
            duration: 1500,
            useNativeDriver: true,
        }).start();
    }, [score]);

    const strokeDashoffset = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [circumference, 0],
    });

    // Color based on score
    const getColor = () => {
        if (score >= 80) return '#00FF94'; // Neon green
        if (score >= 60) return '#FFD700'; // Gold
        if (score >= 40) return '#FF8C00'; // Orange
        return '#FF1744'; // Red
    };

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size}>
                {/* Background Circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#1a1a1a"
                    strokeWidth={10}
                    fill="none"
                />
                {/* Progress Circle */}
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={getColor()}
                    strokeWidth={10}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>
            <View style={styles.scoreContainer}>
                <Text style={[styles.scoreText, { color: getColor() }]}>{Math.round(score)}</Text>
                <Text style={styles.labelText}>DISCIPLINE</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreText: {
        fontSize: 56,
        fontWeight: '900',
        letterSpacing: -2,
    },
    labelText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        letterSpacing: 2,
        marginTop: 4,
    },
});
