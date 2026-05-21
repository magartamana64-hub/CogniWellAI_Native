import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { AuthContext } from '../../context/AuthContext';

import ScreenWrapper from '../../components/ScreenWrapper';
import Card from '../../components/Card';
import AppInput from '../../components/AppInput';
import { ChoiceGroup } from '../../components/FormControls';

import { getUsageLogsByDateRange } from '../../services/usageService';
import { getMoodLogsByDateRange } from '../../services/moodService';

import { analyzeUserBehaviour } from '../../services/aiService';

import { formatAIResponse } from '../../utils/recommendationEngine';

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

function getDailyRecommendations(usageLogs, moodLogs) {
  const days = {};

  usageLogs.forEach((item) => {
    if (!days[item.log_date]) {
      days[item.log_date] = { usage: [], mood: null };
    }
    days[item.log_date].usage.push(item);
  });

  moodLogs.forEach((item) => {
    if (!days[item.log_date]) {
      days[item.log_date] = { usage: [], mood: null };
    }
    days[item.log_date].mood = item;
  });

  return Object.entries(days)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, data]) => {
      const totalMinutes = data.usage.reduce(
        (sum, item) => sum + (item.duration_minutes || 0),
        0
      );
      const highestCategory = data.usage.reduce((result, item) => {
        const minutes = item.duration_minutes || 0;
        return minutes > result.minutes
          ? { category: item.category, minutes }
          : result;
      }, { category: 'No dominant app type', minutes: 0 });
      const stress = Number(data.mood?.stress_level) || 0;
      const focus = Number(data.mood?.focus_level) || 0;

      const recommendations = [];

      if (totalMinutes > 180) {
        recommendations.push('Schedule two screen breaks and move one high-use app away from your home screen.');
      }

      if (stress >= 4) {
        recommendations.push('Use a 5-minute breathing reset before your next focus block.');
      }

      if (focus <= 2 && focus > 0) {
        recommendations.push('Start with one 15-minute low-pressure task to rebuild focus momentum.');
      }

      if (highestCategory.minutes > 60) {
        recommendations.push(`Set a soft limit for ${highestCategory.category.toLowerCase()} apps tomorrow.`);
      }

      if (recommendations.length === 0) {
        recommendations.push('Keep the routine steady and log one focus session to compare tomorrow.');
      }

      return {
        date,
        totalMinutes,
        highestCategory,
        stress: data.mood?.stress_level || '-',
        focus: data.mood?.focus_level || '-',
        recommendations,
      };
    });
}

export default function RecommendationsScreen() {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const styles = createStyles(colors);
  const { session } = useContext(AuthContext);

  const userId = session?.user?.id;

  const [loading, setLoading] = useState(true);

  const [analysis, setAnalysis] = useState('');
  const [aiSummary, setAiSummary] = useState(null);
  const [filter, setFilter] = useState('today');
  const [customStart, setCustomStart] = useState(getTodayDate());
  const [customEnd, setCustomEnd] = useState(getTodayDate());
  const [dailyRecommendations, setDailyRecommendations] = useState([]);

  async function loadAIAnalysis() {
    try {
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

      const usageLogs = usageResponse.data || [];

      const moodLogs = moodResponse.data || [];
      const moodData = moodLogs[moodLogs.length - 1] || {};

      console.log('Usage logs:', usageLogs);
      console.log('Mood data:', moodData);

      const aiResult =
        await analyzeUserBehaviour({
          usage_logs: usageLogs,
          mood: moodData,
          mood_logs: moodLogs,
          date_range: range,
        });

      console.log('AI Result:', aiResult);

      const formatted =
        formatAIResponse(aiResult);

      setAnalysis(formatted);
      setAiSummary(aiResult);
      setDailyRecommendations(
        getDailyRecommendations(usageLogs, moodLogs)
      );

      setLoading(false);
    } catch (error) {
      console.log(error);

      setAnalysis(
        'Failed to generate AI analysis.'
      );
      setAiSummary(null);
      setDailyRecommendations([]);

      setLoading(false);
    }
  }

  useEffect(() => {
    if (userId) {
      loadAIAnalysis();
    }
  }, [userId, filter, customStart, customEnd]);

  return (
    <ScreenWrapper>
      <Text style={styles.title}>
        AI Wellbeing Coach
      </Text>

      <Text style={styles.subtitle}>
        Advanced behavioural analysis and daily recommendations.
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
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      ) : (
        <>
          <Card>
            <Text style={styles.cardTitle}>AI Analysis</Text>
            {aiSummary ? (
              <>
                <View style={styles.visualRow}>
                  <ScoreRing
                    score={aiSummary.focus_score || 0}
                    label="Focus"
                    colors={colors}
                    styles={styles}
                  />
                  <RiskBadge
                    risk={aiSummary.risk_level || 'Low'}
                    colors={colors}
                    styles={styles}
                  />
                </View>

                <View style={styles.summaryGrid}>
                  <SummaryTile
                    label="Screen time"
                    value={`${aiSummary.total_screen_time || 0}m`}
                    styles={styles}
                  />
                  <SummaryTile
                    label="Social apps"
                    value={`${aiSummary.social_media_time || 0}m`}
                    styles={styles}
                  />
                </View>

                <Text style={styles.cardTitle}>Recommendations</Text>
                {(aiSummary.recommendations || []).map((item) => (
                  <View key={item} style={styles.recommendationRow}>
                    <View style={styles.dot} />
                    <Text style={styles.recommendationText}>{item}</Text>
                  </View>
                ))}
              </>
            ) : (
              <Text style={styles.analysis}>
                {analysis || 'No AI analysis available for this range.'}
              </Text>
            )}
          </Card>

          <Text style={styles.sectionTitle}>Daily Recommendations</Text>

          {dailyRecommendations.length === 0 ? (
            <Card>
              <Text style={styles.analysis}>
                Add usage and mood logs to see daily coaching recommendations.
              </Text>
            </Card>
          ) : (
            dailyRecommendations.map((item) => (
              <Card key={item.date}>
                <Text style={styles.cardTitle}>{item.date}</Text>
                <View style={styles.pillRow}>
                  <Text style={styles.pill}>{item.totalMinutes} min</Text>
                  <Text style={styles.pill}>Stress {item.stress}</Text>
                  <Text style={styles.pill}>Focus {item.focus}</Text>
                </View>

                {item.recommendations.map((recommendation) => (
                  <Text key={recommendation} style={styles.recommendation}>
                    {recommendation}
                  </Text>
                ))}
              </Card>
            ))
          )}
        </>
      )}
    </ScreenWrapper>
  );
}

function ScoreRing({ score, label, colors, styles }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (Math.max(0, Math.min(score, 100)) / 100) * circumference;
  const strokeColor =
    score >= 75
      ? colors.success
      : score >= 45
        ? colors.warning
        : colors.danger;

  return (
    <View style={styles.ringBox}>
      <Svg width={118} height={118}>
        <Circle
          cx="59"
          cy="59"
          r={radius}
          stroke={colors.border}
          strokeWidth="12"
          fill="none"
        />
        <Circle
          cx="59"
          cy="59"
          r={radius}
          stroke={strokeColor}
          strokeWidth="12"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={progress}
          strokeLinecap="round"
          fill="none"
          rotation="-90"
          origin="59, 59"
        />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={styles.ringScore}>{score}</Text>
        <Text style={styles.ringLabel}>{label}</Text>
      </View>
    </View>
  );
}

function RiskBadge({ risk, colors, styles }) {
  const normalized = risk.toLowerCase();
  const color =
    normalized === 'high'
      ? colors.danger
      : normalized === 'moderate'
        ? colors.warning
        : colors.success;

  return (
    <View style={[styles.riskBadge, { borderColor: color }]}>
      <Text style={[styles.riskLevel, { color }]}>{risk}</Text>
      <Text style={styles.riskLabel}>Risk level</Text>
      <Text style={styles.riskHelp}>
        {normalized === 'high'
          ? 'Reduce load now'
          : normalized === 'moderate'
            ? 'Watch patterns'
            : 'Healthy range'}
      </Text>
    </View>
  );
}

function SummaryTile({ label, value, styles }) {
  return (
    <View style={styles.summaryTile}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
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

  analysis: {
    fontSize: 16,
    lineHeight: 28,
    color: colors.text,
  },
  visualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  ringBox: {
    width: 118,
    height: 118,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  ringScore: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
  },
  ringLabel: {
    color: colors.mutedText,
    fontWeight: '800',
  },
  riskBadge: {
    flex: 1,
    minHeight: 108,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  riskLevel: {
    fontSize: 28,
    fontWeight: '900',
  },
  riskLabel: {
    color: colors.mutedText,
    fontWeight: '800',
    marginTop: 2,
  },
  riskHelp: {
    color: colors.text,
    marginTop: 8,
    fontWeight: '700',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  summaryTile: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  summaryLabel: {
    color: colors.mutedText,
    fontWeight: '800',
  },
  summaryValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  recommendationText: {
    flex: 1,
    color: colors.text,
    lineHeight: 23,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    marginTop: 10,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 10,
  },
  customRow: {
    flexDirection: 'row',
    gap: 10,
  },
  customField: {
    flex: 1,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.lightBlue,
    color: colors.secondary,
    fontWeight: '800',
    overflow: 'hidden',
  },
  recommendation: {
    color: colors.text,
    lineHeight: 23,
    marginTop: 6,
  },
  });
}
