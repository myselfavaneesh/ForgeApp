import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../theme/styles';
import { Download, Database, Shield } from 'lucide-react-native';
import { BackupService } from '../services/BackupService';

export const ProfileScreen = () => {

    const handleExport = async () => {
        await BackupService.exportData();
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>OPERATOR PROFILE</Text>
                <Text style={styles.subtitle}>System Configuration</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>DATA MANAGEMENT</Text>

                <TouchableOpacity style={styles.menuItem} onPress={handleExport}>
                    <View style={styles.menuIcon}>
                        <Download size={20} color={theme.colors.primary} />
                    </View>
                    <View style={styles.menuContent}>
                        <Text style={styles.menuTitle}>Export Database</Text>
                        <Text style={styles.menuSubtitle}>Backup local data to JSON</Text>
                    </View>
                </TouchableOpacity>

            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>SYSTEM STATUS</Text>
                <View style={styles.infoRow}>
                    <Database size={16} color={theme.colors.textDim} />
                    <Text style={styles.infoText}>Local SQLite: Active</Text>
                </View>
                <View style={styles.infoRow}>
                    <Shield size={16} color={theme.colors.textDim} />
                    <Text style={styles.infoText}>Security: Offline Mode</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.l,
    },
    header: {
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.xxl,
    },
    title: {
        ...theme.typography.h2,
        color: theme.colors.primary,
        letterSpacing: 2,
    },
    subtitle: {
        ...theme.typography.caption,
        color: theme.colors.textDim,
        marginTop: theme.spacing.xs,
        letterSpacing: 1,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        ...theme.typography.caption,
        color: theme.colors.textDim,
        letterSpacing: 1,
        marginBottom: theme.spacing.m,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.m,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        borderWidth: 1,
        borderColor: theme.colors.surfaceLight,
        marginBottom: theme.spacing.s,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 209, 185, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.m,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        ...theme.typography.body,
        fontWeight: '600',
        color: theme.colors.white,
    },
    menuSubtitle: {
        ...theme.typography.caption,
        color: theme.colors.textDim,
        fontSize: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.s,
        marginBottom: theme.spacing.s,
    },
    infoText: {
        ...theme.typography.caption,
        color: theme.colors.textDim,
    }
});
