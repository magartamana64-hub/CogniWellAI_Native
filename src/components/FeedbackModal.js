import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors as defaultColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

export default function FeedbackModal({
  visible,
  type = 'success',
  title,
  message,
  loading = false,
  onClose,
  primaryAction,
  secondaryAction,
}) {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const styles = createStyles(colors);
  const iconName =
    type === 'error'
      ? 'alert-circle'
      : type === 'warning'
        ? 'warning'
        : 'checkmark-circle';

  const accentColor =
    type === 'error'
      ? colors.danger
      : type === 'warning'
        ? colors.warning
        : colors.success;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <Ionicons name={iconName} size={42} color={accentColor} />
          )}

          <Text style={styles.title}>{title}</Text>

          {message ? <Text style={styles.message}>{message}</Text> : null}

          {!loading ? (
            <View style={styles.actions}>
              {secondaryAction ? (
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={secondaryAction.onPress}
                >
                  <Text style={styles.secondaryText}>
                    {secondaryAction.label}
                  </Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={primaryAction?.onPress || onClose}
              >
                <Text style={styles.primaryText}>
                  {primaryAction?.label || 'OK'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
  },
  modal: {
    width: '100%',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: colors.mutedText,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  button: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
  },
  primaryText: {
    color: colors.background,
    fontWeight: '800',
  },
  secondaryText: {
    color: colors.text,
    fontWeight: '800',
  },
  });
}

