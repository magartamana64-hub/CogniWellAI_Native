import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors as defaultColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

export function ChoiceGroup({
  title,
  description,
  options,
  value,
  onChange,
  columns = 2,
}) {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const styles = createStyles(colors);

  return (
    <View style={styles.wrapper}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}

      <View style={styles.choiceGrid}>
        {options.map((option) => {
          const selected = value === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.choice,
                { width: columns === 1 ? '100%' : '48%' },
                selected && styles.choiceSelected,
              ]}
              onPress={() => onChange(option.value)}
            >
              {option.icon ? (
                <Ionicons
                  name={option.icon}
                  size={18}
                  color={selected ? colors.background : colors.primary}
                />
              ) : null}
              <Text
                style={[
                  styles.choiceText,
                  selected && styles.choiceTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export function RatingSelector({
  title,
  description,
  value,
  onChange,
}) {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const styles = createStyles(colors);

  return (
    <View style={styles.wrapper}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}

      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((item) => {
          const selected = Number(value) === item;

          return (
            <TouchableOpacity
              key={item}
              style={[styles.rating, selected && styles.ratingSelected]}
              onPress={() => onChange(String(item))}
            >
              <Text
                style={[
                  styles.ratingText,
                  selected && styles.ratingTextSelected,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export function MinuteStepper({
  title,
  description,
  value,
  onChange,
  step = 5,
}) {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const styles = createStyles(colors);
  const minutes = Number(value) || 0;

  function updateMinutes(nextValue) {
    onChange(String(Math.max(0, nextValue)));
  }

  return (
    <View style={styles.wrapper}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}

      <View style={styles.stepper}>
        <TouchableOpacity
          style={styles.stepButton}
          onPress={() => updateMinutes(minutes - step)}
        >
          <Ionicons name="remove" size={22} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.stepValue}>
          <Text style={styles.stepNumber}>{minutes}</Text>
          <Text style={styles.stepLabel}>minutes</Text>
        </View>

        <TouchableOpacity
          style={styles.stepButton}
          onPress={() => updateMinutes(minutes + step)}
        >
          <Ionicons name="add" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  wrapper: {
    marginBottom: 18,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: colors.mutedText,
    marginBottom: 10,
    lineHeight: 18,
  },
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  choice: {
    minHeight: 46,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  choiceSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  choiceText: {
    color: colors.text,
    fontWeight: '700',
    flexShrink: 1,
  },
  choiceTextSelected: {
    color: colors.background,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  rating: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.input,
  },
  ratingSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  ratingTextSelected: {
    color: colors.background,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.input,
  },
  stepButton: {
    width: 56,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  stepValue: {
    flex: 1,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
  },
  stepLabel: {
    fontSize: 12,
    color: colors.mutedText,
  },
  });
}

