import React, {
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Text,
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

import StatCard from '../../components/StatCard';
import Card from '../../components/Card';

import { colors as defaultColors } from '../../constants/colors';
import { getTodayUsageLogs } from '../../services/usageService';
import { getLatestMood } from '../../services/moodService';
import { getFocusSessions } from '../../services/focusService';
import { calculateFocusScore } from '../../utils/focusScore';

export default function DashboardScreen({ navigation }) {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const styles = createStyles(colors);
  const { session } = useContext(AuthContext);

  const userEmail = session?.user?.email || 'User';
  const userId = session?.user?.id;
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    screenTime: 0,
    focusScore: 100,
    stressLevel: '-',
    mood: 'Not logged',
    focusMinutes: 0,
    completedSessions: 0,
    topApp: 'No app yet',
  });

  async function loadDashboard() {
    setLoading(true);
    const [usageResponse, moodResponse, focusResponse] = await Promise.all([
      getTodayUsageLogs(userId),
      getLatestMood(userId),
      getFocusSessions(userId),
    ]);

    const usageLogs = usageResponse.data || [];
    const mood = moodResponse.data || null;
    const focusSessions = focusResponse.data || [];
    const todayKey = new Date().toISOString().split('T')[0];
    const todaysFocus = focusSessions.filter((item) =>
      (item.ended_at || item.started_at || '').startsWith(todayKey)
    );

    const screenTime = usageLogs.reduce(
      (sum, item) => sum + (item.duration_minutes || 0),
      0
    );
    const socialMediaTime = usageLogs
      .filter((item) => item.category?.toLowerCase().includes('social'))
      .reduce((sum, item) => sum + (item.duration_minutes || 0), 0);
    const topApp = usageLogs.reduce(
      (result, item) =>
        (item.duration_minutes || 0) > result.minutes
          ? { name: item.app_name, minutes: item.duration_minutes || 0 }
          : result,
      { name: 'No app yet', minutes: 0 }
    );
    const focusMinutes = todaysFocus.reduce(
      (sum, item) => sum + (item.duration_minutes || 0),
      0
    );
    const score = calculateFocusScore(
      screenTime,
      socialMediaTime,
      Number(mood?.stress_level || 3),
      Number(mood?.focus_level || 3)
    );

    setMetrics({
      screenTime,
      focusScore: score,
      stressLevel: mood?.stress_level || '-',
      mood: mood?.mood || 'Not logged',
      focusMinutes,
      completedSessions: todaysFocus.filter((item) => item.completed).length,
      topApp: topApp.name,
    });
    setLoading(false);
  }

  useEffect(() => {
    if (userId) {
      const unsubscribe = navigation.addListener('focus', loadDashboard);
      loadDashboard();
      return unsubscribe;
    }

    return undefined;
  }, [userId, navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>
          Welcome back
        </Text>

        <Text style={styles.email}>
          {userEmail}
        </Text>

        <Text style={styles.title}>
          Today's Wellbeing
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <>
            <View style={styles.row}>
              <StatCard
                title="Screen Time"
                value={`${metrics.screenTime}m`}
                subtitle="Logged today"
              />

              <StatCard
                title="Focus Score"
                value={`${metrics.focusScore}`}
                subtitle={
                  metrics.focusScore >= 75
                    ? 'Steady'
                    : metrics.focusScore >= 45
                      ? 'Needs care'
                      : 'Low'
                }
              />
            </View>

            <View style={styles.metricGrid}>
              <MetricPill
                icon="happy"
                title="Mood"
                value={metrics.mood}
                color={colors.softRose}
                colors={colors}
                styles={styles}
              />
              <MetricPill
                icon="flash"
                title="Stress"
                value={`${metrics.stressLevel}/5`}
                color={colors.lightBlue}
                colors={colors}
                styles={styles}
              />
              <MetricPill
                icon="timer"
                title="Focus Time"
                value={`${metrics.focusMinutes}m`}
                color={colors.lightGreen}
                colors={colors}
                styles={styles}
              />
              <MetricPill
                icon="phone-portrait"
                title="Top App"
                value={metrics.topApp}
                color={colors.softViolet}
                colors={colors}
                styles={styles}
              />
            </View>
          </>
        )}

        <Card style={styles.coachCard}>
          <View style={styles.coachIcon}>
            <Ionicons
              name="sparkles"
              size={24}
              color={colors.primary}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.coachTitle}>
              AI Wellbeing Coach
            </Text>

            <Text style={styles.coachText}>
              Track your digital habits, mood, focus,
              and wellbeing to receive personalised
              recommendations and healthier screen habits.
            </Text>
          </View>
        </Card>

        <MenuButton
          icon="time"
          title="Add Usage Log"
          subtitle="Track apps and screen time"
          onPress={() => navigation.navigate('Usage')}
          colors={colors}
          styles={styles}
        />

        <MenuButton
          icon="happy"
          title="Mood Check-in"
          subtitle="Record your emotional wellbeing"
          onPress={() => navigation.navigate('Mood')}
          colors={colors}
          styles={styles}
        />

        <MenuButton
          icon="sparkles"
          title="AI Coach"
          subtitle="Receive personalised recommendations"
          onPress={() => navigation.navigate('Coach')}
          colors={colors}
          styles={styles}
        />

        <MenuButton
          icon="bar-chart"
          title="Insights"
          subtitle="View wellbeing analytics and trends"
          onPress={() => navigation.navigate('Insights')}
          colors={colors}
          styles={styles}
        />

        <MenuButton
          icon="timer"
          title="Focus Mode"
          subtitle="Start distraction-free focus sessions"
          onPress={() => navigation.navigate('Focus')}
          colors={colors}
          styles={styles}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricPill({
  icon,
  title,
  value,
  color,
  colors,
  styles,
}) {
  return (
    <View style={styles.metricPill}>
      <View style={[styles.metricIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={18} color={colors.text} />
      </View>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function MenuButton({
  icon,
  title,
  subtitle,
  onPress,
  colors,
  styles,
}) {
  return (
    <TouchableOpacity
      style={styles.menuButton}
      onPress={onPress}
    >
      <View style={styles.menuLeft}>
        <Ionicons
          name={icon}
          size={28}
          color={colors.background}
        />

        <View style={{ marginLeft: 16 }}>
          <Text style={styles.menuText}>
            {title}
          </Text>

          <Text style={styles.menuSubtitle}>
            {subtitle}
          </Text>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={28}
        color={colors.background}
      />
    </TouchableOpacity>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 20,
    paddingBottom: 120,
  },

  greeting: {
    fontSize: 18,
    color: colors.mutedText,
    fontWeight: '700',
  },

  email: {
    fontSize: 14,
    color: colors.mutedText,
    marginTop: 2,
    marginBottom: 14,
  },

  title: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 18,
  },

  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  metricPill: {
    width: '48%',
    padding: 14,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricTitle: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '800',
  },
  metricValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 4,
  },

  coachCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  coachIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.lightTeal,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  coachTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },

  coachText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.mutedText,
    marginTop: 6,
  },

  menuButton: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 22,
    marginVertical: 8,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuText: {
    color: colors.background,
    fontSize: 20,
    fontWeight: '900',
  },

  menuSubtitle: {
    color: colors.background,
    opacity: 0.82,
    fontSize: 13,
    marginTop: 4,
  },
  });
}
