import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import FeedbackModal from '../../components/FeedbackModal';
import Card from '../../components/Card';
import ThemeToggleButton from '../../components/ThemeToggleButton';
import {
  loginUser,
  sendPasswordReset,
} from '../../services/authService';
import { colors as defaultColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';

export default function LoginScreen({ navigation }) {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const styles = createStyles(colors);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });

  async function handleLogin() {
    console.log('Login button pressed');

    if (!email || !password) {
      setModal({
        visible: true,
        type: 'warning',
        title: 'Missing fields',
        message: 'Please enter email and password.',
      });
      return;
    }

    setLoading(true);

    const { data, error } = await loginUser(email.trim(), password);

    setLoading(false);

    console.log('Login data:', data);
    console.log('Login error:', error);

    if (error) {
      setModal({
        visible: true,
        type: 'error',
        title: 'Login failed',
        message:
          error.message?.toLowerCase().includes('email')
            ? `${error.message}. If you just signed up, confirm your email first.`
            : error.message,
      });
      return;
    }

    setModal({
      visible: true,
      type: 'success',
      title: 'Login successful',
      message: 'Welcome back to CogniWell AI.',
    });
  }

  async function handleForgotPassword() {
    if (!email) {
      setModal({
        visible: true,
        type: 'warning',
        title: 'Email needed',
        message: 'Enter your email first so we can send reset instructions.',
      });
      return;
    }

    setLoading(true);
    const { error } = await sendPasswordReset(email);
    setLoading(false);

    setModal({
      visible: true,
      type: error ? 'error' : 'success',
      title: error ? 'Reset failed' : 'Reset email sent',
      message: error
        ? error.message
        : 'Check your inbox for password reset instructions.',
    });
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ThemeToggleButton style={styles.themeToggle} />

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Sign in to continue tracking your wellbeing and focus patterns.
        </Text>

        <Card>
          <AppInput
            title="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <AppInput
            title="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              <AppButton title="Login" onPress={handleLogin} />
              <AppButton
                title="Forgot Password"
                variant="secondary"
                onPress={handleForgotPassword}
              />
            </>
          )}
        </Card>

        <TouchableOpacity
          style={styles.switchLink}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.switchText}>
            New here? Create an account
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <FeedbackModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal((current) => ({ ...current, visible: false }))}
      />
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  themeToggle: {
    position: 'absolute',
    top: 56,
    right: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.text,
  },
  subtitle: {
    color: colors.mutedText,
    lineHeight: 22,
    marginTop: 6,
    marginBottom: 18,
  },
  switchLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  switchText: {
    color: colors.primary,
    fontWeight: '800',
  },
  });
}

