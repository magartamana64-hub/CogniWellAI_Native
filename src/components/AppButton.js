import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors as defaultColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

export default function AppButton({ title, onPress, variant = 'primary' }) {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const styles = createStyles(colors);
  const isSecondary = variant === 'secondary';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: isSecondary ? colors.surface : colors.primary },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.text, { color: isSecondary ? colors.primary : colors.background }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginVertical: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
  });
}

