import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors as defaultColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

export default function Card({ children, style }) {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const styles = createStyles(colors);
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    marginVertical: 8,

    borderWidth: 1,
    borderColor: colors.border,

    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },
  });
}

