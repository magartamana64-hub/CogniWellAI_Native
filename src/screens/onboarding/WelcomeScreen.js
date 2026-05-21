import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppButton from '../../components/AppButton';
import ThemeToggleButton from '../../components/ThemeToggleButton';
import CogniWellLogo from '../../components/CogniWellLogo';
import { colors as defaultColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';

export default function WelcomeScreen({ navigation }) {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <ThemeToggleButton style={styles.themeToggle} />

      <CogniWellLogo width={170} style={styles.logo} />
      <Text style={styles.logoText}>CogniWell AI</Text>
      <Text style={styles.subtitle}>Your adaptive digital wellbeing coach</Text>

      <AppButton title="Get Started" onPress={() => navigation.navigate('Consent')} />
      <AppButton
        title="I already have an account"
        variant="secondary"
        onPress={() => navigation.navigate('Login')}
      />
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      padding: 24,
    },
    themeToggle: {
      position: 'absolute',
      top: 56,
      right: 20,
    },
    logoText: {
      fontSize: 36,
      fontWeight: '900',
      color: colors.text,
      textAlign: 'center',
    },
    logo: {
      alignSelf: 'center',
      marginBottom: 12,
    },
    title: {
      fontSize: 34,
      fontWeight: '900',
      textAlign: 'center',
      color: colors.text,
      marginTop: 18,
    },
    subtitle: {
      fontSize: 16,
      textAlign: 'center',
      color: colors.mutedText,
      marginVertical: 20,
      lineHeight: 23,
    },
  });
}
