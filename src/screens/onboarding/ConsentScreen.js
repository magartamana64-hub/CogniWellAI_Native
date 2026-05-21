import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppButton from '../../components/AppButton';
import Card from '../../components/Card';
import ThemeToggleButton from '../../components/ThemeToggleButton';
import { colors as defaultColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';

export default function ConsentScreen({ navigation }) {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <ThemeToggleButton style={styles.themeToggle} />

      <Text style={styles.title}>Privacy & Consent</Text>

      <Card>
        <Text style={styles.text}>
          CogniWell AI uses your screen-time logs, mood check-ins, and focus data to provide personalised digital wellbeing recommendations.
        </Text>
        <Text style={styles.text}>
          Your data is stored securely and used only to improve your own wellbeing insights.
        </Text>
        <Text style={styles.warning}>
          This app provides general wellbeing guidance and does not provide medical advice.
        </Text>
      </Card>

      <AppButton title="I Agree" onPress={() => navigation.navigate('Register')} />
      <AppButton title="Back" variant="secondary" onPress={() => navigation.goBack()} />
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
      marginBottom: 12,
      lineHeight: 22,
    },
    warning: {
      fontSize: 14,
      color: colors.warning,
      fontWeight: '700',
      marginTop: 8,
    },
  });
}
