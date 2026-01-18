import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Home, Brain, BarChart2 } from 'lucide-react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { FocusScreen } from './src/screens/FocusScreen';

type Tab = 'home' | 'focus' | 'analytics';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'focus':
        return <FocusScreen />;
      case 'analytics':
        return (
          <View style={styles.centerContainer}>
            <Text style={styles.placeholderText}>ANALYTICS MODULE OFFLINE</Text>
            <Text style={styles.subText}>Coming in Sprint 3</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.content}>
        {renderContent()}
      </View>

      <SafeAreaView style={styles.tabBarContainer}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('home')}
          >
            <Home
              size={24}
              color={activeTab === 'home' ? '#00FF94' : '#666'}
            />
            <Text style={[styles.tabLabel, activeTab === 'home' && styles.activeTabLabel]}>
              HQ
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, styles.centerTab]}
            onPress={() => setActiveTab('focus')}
          >
            <View style={[styles.centerIcon, activeTab === 'focus' && styles.activeCenterIcon]}>
              <Brain
                size={28}
                color={activeTab === 'focus' ? '#000' : '#fff'}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('analytics')}
          >
            <BarChart2
              size={24}
              color={activeTab === 'analytics' ? '#00FF94' : '#666'}
            />
            <Text style={[styles.tabLabel, activeTab === 'analytics' && styles.activeTabLabel]}>
              DATA
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  placeholderText: {
    color: '#FF1744',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },
  subText: {
    color: '#666',
    fontSize: 14,
  },
  tabBarContainer: {
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 60,
    paddingBottom: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666',
    marginTop: 4,
    letterSpacing: 1,
  },
  activeTabLabel: {
    color: '#00FF94',
  },
  centerTab: {
    marginBottom: 20,
  },
  centerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  activeCenterIcon: {
    backgroundColor: '#00FF94',
    borderColor: '#00FF94',
    transform: [{ scale: 1.1 }],
  },
});
