import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { HomeScreen } from '../screens/HomeScreen';
import { FocusScreen } from '../screens/FocusScreen';
import { LinkVerification } from '../components/LinkVerification';
import { View, Text, StyleSheet } from 'react-native';
import { Home, Brain, BarChart2, Radio, User } from 'lucide-react-native';
import { theme } from '../theme/styles';

const Tab = createBottomTabNavigator();

// Placeholder screens for implementation
const PlanScreen = () => (
    <View style={styles.centerContainer}>
        <Text style={styles.placeholderText}>PLANNING MODULE</Text>
        <Text style={styles.subText}>Coming Soon</Text>
    </View>
);

const StatsScreen = () => (
    <View style={styles.centerContainer}>
        <Text style={styles.placeholderText}>ANALYTICS MODULE</Text>
        <Text style={styles.subText}>Coming Soon</Text>
    </View>
);

import { ProfileScreen } from '../screens/ProfileScreen';


export const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: theme.colors.background,
                        borderTopColor: theme.colors.surface,
                        height: 70, // Slightly taller for better touch area
                        paddingBottom: 10,
                        paddingTop: 10,
                    },
                    tabBarActiveTintColor: theme.colors.primary,
                    tabBarInactiveTintColor: theme.colors.textDim,
                    tabBarLabelStyle: {
                        fontSize: 10,
                        fontWeight: '600',
                        letterSpacing: 0.5,
                        marginTop: 4,
                    },
                }}
            >
                <Tab.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        tabBarLabel: 'HQ',
                        tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                    }}
                />
                <Tab.Screen
                    name="Plan"
                    component={PlanScreen}
                    options={{
                        tabBarLabel: 'PLAN',
                        tabBarIcon: ({ color, size }) => <User color={color} size={size} />, // Using User as placeholder for Plan if Calendar not Avail
                    }}
                />

                {/* Center Focus Button Style */}
                <Tab.Screen
                    name="Focus"
                    component={FocusScreen}
                    options={{
                        tabBarLabel: '',
                        tabBarIcon: ({ color, focused }) => (
                            <View style={[
                                styles.centerIcon,
                                focused && styles.centerIconActive
                            ]}>
                                <Brain color={focused ? theme.colors.black : theme.colors.white} size={28} />
                            </View>
                        ),
                    }}
                />

                <Tab.Screen
                    name="Stats"
                    component={StatsScreen}
                    options={{
                        tabBarLabel: 'DATA',
                        tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size} />,
                    }}
                />
                <Tab.Screen
                    name="Link"
                    component={LinkVerification}
                    options={{
                        tabBarLabel: 'LINK',
                        tabBarIcon: ({ color, size }) => <Radio color={color} size={size} />,
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: theme.colors.error,
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 8,
    },
    subText: {
        color: theme.colors.textDim,
        fontSize: 14,
    },
    centerIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.surfaceLight,
        marginBottom: 20, // Push it up
        ...theme.shadows.card,
    },
    centerIconActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
        transform: [{ scale: 1.1 }],
        ...theme.shadows.glow,
    }
});
