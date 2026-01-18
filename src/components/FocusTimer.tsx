import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedProps,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Play, Pause, Square, SkipForward } from 'lucide-react-native';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const { width } = Dimensions.get('window');
const TIMER_SIZE = width * 0.7;
const STROKE_WIDTH = 15;
const RADIUS = (TIMER_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface FocusTimerProps {
    initialMinutes?: number;
    onComplete?: (minutes: number) => void;
}

export const FocusTimer = ({
    initialMinutes = 25,
    onComplete
}: FocusTimerProps) => {
    const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
    const [isActive, setIsActive] = useState(false);
    const [totalTime, setTotalTime] = useState(initialMinutes * 60);

    // Animations
    const progress = useSharedValue(1);
    const pulse = useSharedValue(1);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    const newTime = prev - 1;
                    progress.value = withTiming(newTime / totalTime, {
                        duration: 1000,
                        easing: Easing.linear,
                    });
                    return newTime;
                });
            }, 1000);

            // Start breathing animation
            pulse.value = withRepeat(
                withSequence(
                    withTiming(1.05, { duration: 2000 }),
                    withTiming(1, { duration: 2000 })
                ),
                -1,
                true
            );
        } else if (timeLeft === 0) {
            if (isActive) {
                setIsActive(false);
                onComplete?.(Object.is(totalTime, NaN) ? 0 : totalTime / 60);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            pulse.value = withTiming(1);
        } else {
            pulse.value = withTiming(1);
            if (interval) clearInterval(interval);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft, totalTime, progress, pulse, onComplete]);

    const toggleTimer = useCallback(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsActive(!isActive);
    }, [isActive]);

    const stopTimer = useCallback(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setIsActive(false);
        setTimeLeft(totalTime);
        progress.value = withTiming(1, { duration: 500 });
    }, [totalTime, progress]);

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = CIRCUMFERENCE * (1 - progress.value);
        return {
            strokeDashoffset,
        };
    });

    const breathingStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: pulse.value }],
        };
    });

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.timerContainer, breathingStyle]}>
                <Svg width={TIMER_SIZE} height={TIMER_SIZE}>
                    {/* Background Circle */}
                    <Circle
                        cx={TIMER_SIZE / 2}
                        cy={TIMER_SIZE / 2}
                        r={RADIUS}
                        stroke="#1a1a1a"
                        strokeWidth={STROKE_WIDTH}
                        fill="none"
                    />
                    {/* Progress Circle */}
                    <AnimatedCircle
                        cx={TIMER_SIZE / 2}
                        cy={TIMER_SIZE / 2}
                        r={RADIUS}
                        stroke={isActive ? "#00FF94" : "#666"}
                        strokeWidth={STROKE_WIDTH}
                        fill="none"
                        strokeDasharray={CIRCUMFERENCE}
                        animatedProps={animatedProps}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${TIMER_SIZE / 2}, ${TIMER_SIZE / 2}`}
                    />
                </Svg>

                <View style={styles.timeDisplay}>
                    <Text style={[styles.timeText, { color: isActive ? "#00FF94" : "#fff" }]}>
                        {formatTime(timeLeft)}
                    </Text>
                    <Text style={styles.label}>FOCUS</Text>
                </View>
            </Animated.View>

            <View style={styles.controls}>
                {!isActive && timeLeft !== totalTime && (
                    <TouchableOpacity style={styles.controlButton} onPress={stopTimer}>
                        <Square size={24} color="#FF1744" fill="#FF1744" />
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.mainButton, isActive && styles.activeButton]}
                    onPress={toggleTimer}
                >
                    {isActive ? (
                        <Pause size={32} color="#000" fill="#000" />
                    ) : (
                        <Play size={32} color="#000" fill="#000" style={{ marginLeft: 4 }} />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    timeDisplay: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeText: {
        fontSize: 64,
        fontWeight: '900',
        fontVariant: ['tabular-nums'],
        letterSpacing: -2,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#666',
        letterSpacing: 4,
        marginTop: 8,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 32,
    },
    mainButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    activeButton: {
        backgroundColor: '#00FF94',
        shadowColor: '#00FF94',
    },
    controlButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#1a1a1a',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
});
