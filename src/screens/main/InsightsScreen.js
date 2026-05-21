import React, { useContext, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Dimensions,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import {
  BarChart,
  LineChart,
  PieChart,
} from 'react-native-chart-kit';

import { AuthContext } from '../../context/AuthContext';

import ScreenWrapper from '../../components/ScreenWrapper';
import Card from '../../components/Card';
import AppInput from '../../components/AppInput';
import { ChoiceGroup } from '../../components/FormControls';

import { getUsageLogsByDateRange } from '../../services/usageService';
import { getMoodLogsByDateRange } from '../../services/moodService';

import { colors as defaultColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import {
  getDateDaysAgo,
  getMonthStartDate,
  getTodayDate,
} from '../../utils/dateHelpers';

const FILTER_OPTIONS = [
  { label: 'Today', value: 'today', icon: 'today' },
  { label: 'Last 3 days', value: '3days', icon: 'calendar' },
  { label: 'Last week', value: 'week', icon: 'calendar-outline' },
  { label: 'This month', value: 'month', icon: 'calendar-number' },
  { label: 'Custom', value: 'custom', icon: 'options' },
];

function getRange(filter, customStart, customEnd) {
  const today = getTodayDate();

  if (filter === '3days') {
    return { start: getDateDaysAgo(2), end: today };
  }

  if (filter === 'week') {
    return { start: getDateDaysAgo(6), end: today };
  }

  if (filter === 'month') {
    return { start: getMonthStartDate(), end: today };
  }

  if (filter === 'custom') {
    return {
      start: customStart || today,
      end: customEnd || today,
    };
  }

  return { start: today, end: today };
}

function buildDailyUsage(logs) {
  const grouped = {};

  logs.forEach((item) => {
    grouped[item.log_date] =
      (grouped[item.log_date] || 0) + (item.duration_minutes || 0);
  });

  return Object.entries(grouped);
}

function buildMoodTrend(logs, key) {
  const grouped = {};

  logs.forEach((item) => {
    grouped[item.log_date] = Number(item[key]) || 0;
  });

  return Object.entries(grouped);
}

export default function InsightsScreen() {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const styles = createStyles(colors);
  const { session } = useContext(AuthContext);

  const userId = session?.user?.id;

  const [screenTime, setScreenTime] = useState(0);
  const [focusScore, setFocusScore] = useState(100);
  const [stressLevel, setStressLevel] = useState('-');
  const [filter, setFilter] = useState('today');
  const [customStart, setCustomStart] = useState(getTodayDate());
  const [customEnd, setCustomEnd] = useState(getTodayDate());
  const [usageLogs, setUsageLogs] = useState([]);
  const [moodLogs, setMoodLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadInsights() {
    setLoading(true);

    const range = getRange(filter, customStart, customEnd);
    const usageResponse = await getUsageLogsByDateRange(
      userId,
      range.start,
      range.end
    );

    const moodResponse = await getMoodLogsByDateRange(
      userId,
      range.start,
      range.end
    );

    const nextUsageLogs = usageResponse.data || [];
    const nextMoodLogs = moodResponse.data || [];

    const totalMinutes = nextUsageLogs.reduce(
      (sum, item) => sum + (item.duration_minutes || 0),
      0
    );

    setUsageLogs(nextUsageLogs);
    setMoodLogs(nextMoodLogs);
    setScreenTime(totalMinutes);

    const moodData = nextMoodLogs[nextMoodLogs.length - 1];

    if (moodData) {
      setStressLevel(moodData.stress_level);

      const calculatedFocus =
        100 -
        moodData.stress_level * 10 -
        totalMinutes / 20;

      setFocusScore(
        Math.max(10, Math.round(calculatedFocus))
      );
    } else {
      setStressLevel('-');
      setFocusScore(Math.max(10, Math.round(100 - totalMinutes / 20)));
    }

    setLoading(false);
  }

  useEffect(() => {
    if (userId) {
      loadInsights();
    }
  }, [userId, filter, customStart, customEnd]);

  const dailyUsage = buildDailyUsage(usageLogs);
  const stressTrend = buildMoodTrend(moodLogs, 'stress_level');
  const focusTrend = buildMoodTrend(moodLogs, 'focus_level');
  const categoryTotals = usageLogs.reduce((result, item) => {
    result[item.category] =
      (result[item.category] || 0) + (item.duration_minutes || 0);
    return result;
  }, {});

  const chartWidth = Math.max(
    Dimensions.get('window').width - 76,
    280
  );
  const usageLabels = dailyUsage.map(([date]) => date.slice(5));
  const usageData = dailyUsage.map(([, minutes]) => minutes);
  const stressData = stressTrend.map(([, value]) => value);
  const focusData = focusTrend.map(([, value]) => value);
  const chartColors = [
    colors.primary,
    colors.secondary,
    colors.warning,
    colors.success,
    colors.danger,
    '#8B5CF6',
  ];
  const chartConfig = {
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    color: (opacity = 1) => `rgba(94, 234, 212, ${opacity})`,
    labelColor: () => colors.mutedText,
    decimalPlaces: 0,
    propsForBackgroundLines: {
      stroke: colors.border,
    },
  };
  const pieData = Object.entries(categoryTotals).map(
    ([name, minutes], index) => ({
      name,
      minutes,
      color: chartColors[index % chartColors.length],
      legendFontColor: colors.mutedText,
      legendFontSize: 12,
    })
  );

  return (
    <ScreenWrapper>
      <Text style={styles.title}>
        Wellbeing Insights
      </Text>

      <Text style={styles.subtitle}>
        Your digital wellbeing analytics and trends.
      </Text>

      <ChoiceGroup
        options={FILTER_OPTIONS}
        value={filter}
        onChange={setFilter}
      />

      {filter === 'custom' ? (
        <View style={styles.customRow}>
          <View style={styles.customField}>
            <AppInput
              title="Start"
              placeholder="YYYY-MM-DD"
              value={customStart}
              onChangeText={setCustomStart}
            />
          </View>

          <View style={styles.customField}>
            <AppInput
              title="End"
              placeholder="YYYY-MM-DD"
              value={customEnd}
              onChangeText={setCustomEnd}
            />
          </View>
        </View>
      ) : null}

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <>
          <View style={styles.metricGrid}>
            <Card style={styles.metricCard}>
              <Text style={styles.metric}>Screen Time</Text>
              <Text style={styles.value}>{screenTime}</Text>
              <Text style={styles.unit}>minutes</Text>
            </Card>

            <Card style={styles.metricCard}>
              <Text style={styles.metric}>Focus Score</Text>
              <Text style={styles.value}>{focusScore}</Text>
              <Text style={styles.unit}>out of 100</Text>
            </Card>

            <Card style={styles.metricCard}>
              <Text style={styles.metric}>Stress</Text>
              <Text style={styles.value}>{stressLevel}</Text>
              <Text style={styles.unit}>latest rating</Text>
            </Card>
          </View>

          <Card>
            <Text style={styles.chartTitle}>Daily Screen Time</Text>
            {usageData.length > 0 ? (
              <BarChart
                data={{
                  labels: usageLabels,
                  datasets: [{ data: usageData }],
                }}
                width={chartWidth}
                height={220}
                chartConfig={chartConfig}
                fromZero
                showValuesOnTopOfBars
                style={styles.chart}
              />
            ) : (
              <Text style={styles.emptyText}>No usage data in this range.</Text>
            )}
          </Card>

          <Card>
            <Text style={styles.chartTitle}>Mood Ratings</Text>
            {stressData.length > 0 || focusData.length > 0 ? (
              <LineChart
                data={{
                  labels: moodLogs.map((item) => item.log_date.slice(5)),
                  datasets: [
                    { data: stressData.length ? stressData : [0] },
                    { data: focusData.length ? focusData : [0] },
                  ],
                  legend: ['Stress', 'Focus'],
                }}
                width={chartWidth}
                height={220}
                chartConfig={chartConfig}
                fromZero
                bezier
                style={styles.chart}
              />
            ) : (
              <Text style={styles.emptyText}>No mood data in this range.</Text>
            )}
          </Card>

          <Card>
            <Text style={styles.chartTitle}>App Type Mix</Text>
            {pieData.length > 0 ? (
              <PieChart
                data={pieData}
                width={chartWidth}
                height={210}
                chartConfig={chartConfig}
                accessor="minutes"
                backgroundColor="transparent"
                paddingLeft="0"
                absolute
              />
            ) : (
              <Text style={styles.emptyText}>No category data in this range.</Text>
            )}
          </Card>
        </>
      )}
    </ScreenWrapper>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.text,
  },

  subtitle: {
    color: colors.mutedText,
    marginTop: 4,
    marginBottom: 18,
    lineHeight: 22,
  },

  metric: {
    fontSize: 13,
    color: colors.mutedText,
    fontWeight: '700',
  },

  value: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.text,
    marginTop: 8,
  },
  unit: {
    color: colors.mutedText,
    marginTop: 2,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 98,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 12,
  },
  chart: {
    borderRadius: 16,
  },
  emptyText: {
    color: colors.mutedText,
    lineHeight: 22,
  },
  customRow: {
    flexDirection: 'row',
    gap: 10,
  },
  customField: {
    flex: 1,
  },
  });
}

