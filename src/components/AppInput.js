import React from 'react';
import { Text, TextInput, StyleSheet, View } from 'react-native';
import { colors as defaultColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

export default function AppInput({
  title,
  description,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
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

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType || 'default'}
      />
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
  input: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    color: colors.text,
  },
  });
}

