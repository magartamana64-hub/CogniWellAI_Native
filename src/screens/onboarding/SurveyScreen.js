import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppButton from '../../components/AppButton';
import Card from '../../components/Card';
import ThemeToggleButton from '../../components/ThemeToggleButton';
import { colors as defaultColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';

export default function SurveyScreen({ navigation }) {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <ThemeToggleButton style={styles.themeToggle} />

      <Text style={styles.title}>Initial Wellbeing Survey</Text>

      <Card>
        <Text style={styles.text}>This screen will later collect:</Text>
        <Text style={styles.item}>- Daily phone usage</Text>
        <Text style={styles.item}>- Distraction level</Text>
        <Text style={styles.item}>- Productivity tracking habits</Text>
        <Text style={styles.item}>- Personalised recommendation preference</Text>
      </Card>

      <AppButton title="Continue to Login" onPress={() => navigation.navigate('Login')} />
      <AppButton title="Create Account" variant="secondary" onPress={() => navigation.navigate('Register')} />
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 24,
      backgroundColor: colors.background,
      justifyContent: 'center',
    },
    themeToggle: {
      position: 'absolute',
      top: 56,
      right: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: '900',
      color: colors.text,
      marginBottom: 14,
    },
    text: {
      fontSize: 15,
      color: colors.text,
      marginBottom: 10,
    },
    item: {
      fontSize: 15,
      color: colors.mutedText,
      marginVertical: 4,
    },
  });
}
