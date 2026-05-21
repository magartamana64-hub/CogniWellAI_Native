import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors as defaultColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggleButton({ style }) {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const isDark = theme?.isDark;
  const styles = createStyles(colors);

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={theme?.toggleMode}
      activeOpacity={0.82}
    >
      <Ionicons
        name={isDark ? 'sunny' : 'moon'}
        size={16}
        color={colors.primary}
      />
      <Text style={styles.text}>
        {isDark ? 'White mode' : 'Dark mode'}
      </Text>
    </TouchableOpacity>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    button: {
      alignSelf: 'flex-end',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    text: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '800',
    },
  });
}
