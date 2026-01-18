import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { FocusTimer } from '../components/FocusTimer';
import { StatsService } from '../services/StatsService';
import { Brain, Zap, Coffee } from 'lucide-react-native';

type FocusMode = 'deep' | 'standard' | 'quick';

export const FocusScreen: React.FC = () => {
    const [activeMode, setActiveMode] = useState<FocusMode | null>(null);

    const handleComplete = async (minutes: number) => {
        await StatsService.logFocusSession(minutes);
        setActiveMode(null);
    };

    if (activeMode) {
        const minutes = activeMode === 'deep' ? 90 : activeMode === 'standard' ? 25 : 15;
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.focusContainer}>
                    <Text style={styles.focusTitle}>
                        {activeMode === 'deep' ? 'DEEP WORK' : activeMode === 'standard' ? 'CORE FOCUS' : 'QUICK BURST'}
                    </Text>
                    <Text style={styles.focusSubtitle}>
                        {activeMode === 'deep' ? 'No distractions. Pure output.' : activeMode === 'standard' ? 'Standard block.' : 'High intensity.'}
                    </Text>

                    <View style={styles.timerWrapper}>
                        <FocusTimer initialMinutes={minutes} onComplete={handleComplete} />
                    </View>

                    <TouchableOpacity
                        style={styles.exitButton}
                        onPress={() => setActiveMode(null)}
                    >
                        <Text style={styles.exitButtonText}>EXIT MODE</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>NEURAL LINK</Text>
                    <Text style={styles.headerSubtitle}>Select Focus Protocol</Text>
                </View>

                <View style={styles.grid}>
                    <TouchableOpacity
                        style={[styles.card, styles.deepCard]}
                        onPress={() => setActiveMode('deep')}
                    >
                        <View style={styles.iconContainer}>
                            <Brain size={32} color="#FF1744" />
                        </View>
                        <Text style={styles.cardTitle}>DEEP WORK</Text>
                        <Text style={styles.cardDuration}>90 MIN</Text>
                        <Text style={styles.cardDesc}>Maximum cognitive load. No interruptions.</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.card, styles.standardCard]}
                        onPress={() => setActiveMode('standard')}
                    >
                        <View style={styles.iconContainer}>
                            <Zap size={32} color="#00FF94" />
                        </View>
                        <Text style={styles.cardTitle}>CORE FOCUS</Text>
                        <Text style={styles.cardDuration}>25 MIN</Text>
                        <Text style={styles.cardDesc}>Standard Pomodoro interval.</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.card, styles.quickCard]}
                        onPress={() => setActiveMode('quick')}
                    >
                        <View style={styles.iconContainer}>
                            <Coffee size={32} color="#FFD700" />
                        </View>
                        <Text style={styles.cardTitle}>QUICK BURST</Text>
                        <Text style={styles.cardDuration}>15 MIN</Text>
                        <Text style={styles.cardDesc}>Rapid task execution.</Text>
                    </TouchableOpacity>
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
        padding: 24,
    },
    header: {
        marginBottom: 40,
        marginTop: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        letterSpacing: 2,
        marginTop: 4,
        textTransform: 'uppercase',
    },
    grid: {
        gap: 16,
    },
    card: {
        backgroundColor: '#0a0a0a',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#1a1a1a',
    },
    deepCard: {
        borderColor: '#FF174450',
    },
    standardCard: {
        borderColor: '#00FF9450',
    },
    quickCard: {
        borderColor: '#FFD70050',
    },
    iconContainer: {
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 1,
        marginBottom: 4,
    },
    cardDuration: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 8,
    },
    cardDesc: {
        fontSize: 14,
        color: '#666',
    },
    focusContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    focusTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 4,
        marginBottom: 8,
    },
    focusSubtitle: {
        fontSize: 14,
        color: '#666',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    timerWrapper: {
        marginVertical: 40,
    },
    exitButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: '#333',
    },
    exitButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#666',
        letterSpacing: 2,
    },
});
