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
  registerUser,
  sendPasswordReset,
} from '../../services/authService';
import { colors as defaultColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';

export default function RegisterScreen({ navigation }) {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const styles = createStyles(colors);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });

  async function handleRegister() {
    if (!name || !email || !password || !confirmPassword) {
      setModal({
        visible: true,
        type: 'warning',
        title: 'Missing fields',
        message: 'Please enter name, email, password, and confirm password.',
      });
      return;
    }

    if (password !== confirmPassword) {
      setModal({
        visible: true,
        type: 'warning',
        title: 'Passwords do not match',
        message: 'Password and confirm password must be the same.',
      });
      return;
    }

    if (password.length < 6) {
      setModal({
        visible: true,
        type: 'warning',
        title: 'Password too short',
        message: 'Use at least 6 characters for your password.',
      });
      return;
    }

    setLoading(true);
    const { error } = await registerUser(email.trim(), password, name.trim());
    setLoading(false);

    if (!error) {
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }

    setModal({
      visible: true,
      type: error ? 'error' : 'success',
      title: error ? 'Register failed' : 'Confirm your email',
      message: error
        ? error.message
        : 'We sent a confirmation link to your email. Confirm your email, then return to the Login screen.',
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

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Start your digital wellbeing journey with a personal profile.
        </Text>

        <Card>
          <AppInput
            title="Full name"
            placeholder="Your name"
            value={name}
            onChangeText={setName}
          />

          <AppInput
            title="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <AppInput
            title="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <AppInput
            title="Confirm password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              <AppButton title="Create Account" onPress={handleRegister} />
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
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.switchText}>
            Already confirmed? Login instead
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <FeedbackModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => {
          const wasSuccess = modal.type === 'success';
          setModal((current) => ({ ...current, visible: false }));
          if (wasSuccess) {
            navigation.navigate('Login');
          }
        }}
        primaryAction={
          modal.type === 'success'
            ? {
                label: 'Go to Login',
                onPress: () => {
                  setModal((current) => ({ ...current, visible: false }));
                  navigation.navigate('Login');
                },
              }
            : null
        }
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

