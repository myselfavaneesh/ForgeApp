import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { database } from '../database';
import Task from '../database/models/Task';
import DailyStat from '../database/models/DailyStat';
import { StatsService } from '../services/StatsService';

export const LinkVerification = () => {
    const [logs, setLogs] = useState<string[]>([]);

    const log = (message: string) => {
        setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`]);
    };

    const runVerification = async () => {
        setLogs([]);
        log('Starting Verification Sequence...');
        const collection = database.collections.get<Task>('tasks');
        const testTitle = `Verify_${Date.now()}`;
        let createdTask: Task | null = null;

        try {
            // 1. CREATE
            log('Step 1: Creating Task...');
            await database.write(async () => {
                createdTask = await collection.create(task => {
                    task.title = testTitle;
                    task.isNonNegotiable = true;
                    task.energyLevel = 'high';
                    task.status = 'pending';
                    task.snoozeCount = 0;
                    task.didCommit = false;
                });
            });

            if (createdTask) {
                // Verification of ID existence to satisfy strict TS if needed, though 'createdTask' is typed.
                const task = createdTask as Task;
                log(`✅ Created: ${task.id} - ${task.title}`);
            } else {
                throw new Error('Task creation returned null');
            }

            // 2. QUERY
            log('Step 2: Querying Task...');
            const fetchedTasks = await collection.query().fetch();
            // forceful type check
            const found = fetchedTasks.find(t => t.id === createdTask?.id);
            if (found) {
                log(`✅ Found in DB: ${found.title}`);
            } else {
                throw new Error('Task not found in query');
            }

            // 3. UPDATE (Snooze)
            log('Step 3: Updating (Snooze)...');
            await database.write(async () => {
                await found?.incrementSnooze();
            });
            log(`✅ Snooze Count: ${found?.snoozeCount}`);

            // 4. UPDATE (Commit)
            log('Step 4: Updating (Commit)...');
            await database.write(async () => {
                await found?.commit();
            });
            log(`✅ Did Commit: ${found?.didCommit}`);

            // 5. ANALYTICS HANDSHAKE (Pulse)
            log('Step 5: Testing Pulse Analytics Link...');
            const testScore = Math.floor(Math.random() * 100);
            await StatsService.syncScore(testScore);
            const todayStat = await StatsService.getTodayStat();
            if (todayStat.score === testScore) {
                log(`✅ Analytics Synced: Score ${todayStat.score}`);
            } else {
                throw new Error(`Analytics Sync Failed. Expected ${testScore}, got ${todayStat.score}`);
            }

            // 6. DELETE (Cleanup)
            log('Step 6: Deleting Task...');
            await database.write(async () => {
                await found?.markAsDeleted();
                await found?.destroyPermanently();
            });

            // Verify Deletion
            const tasksAfterDelete = await collection.query().fetch();
            const foundAfterDelete = tasksAfterDelete.find(t => t.id === createdTask?.id);
            if (!foundAfterDelete) {
                log('✅ Task Deleted Successfully');
            } else {
                throw new Error('Task still exists after delete');
            }

            log('🏁 ALL SYSTEMS GO. LINKS VERIFIED.');

        } catch (e: any) {
            log(`❌ ERROR: ${e.message}`);
            console.error(e);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>System Link Verification</Text>
            <TouchableOpacity style={styles.button} onPress={runVerification}>
                <Text style={styles.buttonText}>INITIATE HANDSHAKE SEQUENCE</Text>
            </TouchableOpacity>

            <ScrollView style={styles.console}>
                {logs.map((L, i) => (
                    <Text key={i} style={styles.logText}>{L}</Text>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#000',
    },
    title: {
        color: '#00FF94',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        letterSpacing: 2,
    },
    button: {
        backgroundColor: '#1a1a1a',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#00FF94',
        marginBottom: 20,
    },
    buttonText: {
        color: '#00FF94',
        textAlign: 'center',
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    console: {
        flex: 1,
        backgroundColor: '#0a0a0a',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    logText: {
        color: '#00FF94',
        fontFamily: 'monospace',
        marginBottom: 4,
        fontSize: 12,
    }
});
