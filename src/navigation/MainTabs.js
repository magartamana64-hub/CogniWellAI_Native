import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/main/DashboardScreen';
import UsageLogScreen from '../screens/main/UsageLogScreen';
import MoodCheckScreen from '../screens/main/MoodCheckScreen';
import RecommendationsScreen from '../screens/main/RecommendationsScreen';
import InsightsScreen from '../screens/main/InsightsScreen';
import FocusModeScreen from '../screens/main/FocusModeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import { colors as defaultColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

function TabIcon({ icon, label, focused }) {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const styles = createStyles(colors);

  return (
    <View style={[styles.tabItem, focused && styles.activeTab]}>
      <Ionicons name={icon} size={24} color={focused ? colors.primary : colors.mutedText} />
      <Text style={[styles.tabText, focused && styles.activeText]}>{label}</Text>
    </View>
  );
}

export default function MainTabs() {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const styles = createStyles(colors);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="home" label="Home" focused={focused} />,
        }}
      />

      <Tab.Screen
        name="Usage"
        component={UsageLogScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="time" label="Usage" focused={focused} />,
        }}
      />

      <Tab.Screen
        name="Mood"
        component={MoodCheckScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="happy" label="Mood" focused={focused} />,
        }}
      />

      <Tab.Screen
        name="Coach"
        component={RecommendationsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="sparkles" label="Coach" focused={focused} />,
        }}
      />

      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="bar-chart" label="Insights" focused={focused} />,
        }}
      />

      <Tab.Screen
        name="Focus"
        component={FocusModeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="timer" label="Focus" focused={focused} />,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="person" label="Profile" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
    height: 78,
    borderRadius: 24,
    backgroundColor: colors.tab,
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 58,
  },
  activeTab: {
    backgroundColor: colors.tab,
  },
  tabText: {
    fontSize: 10,
    color: colors.mutedText,
    marginTop: 3,
  },
  activeText: {
    color: colors.primary,
    fontWeight: '700',
  },
  });
}
