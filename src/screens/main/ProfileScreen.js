import React, {
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Switch,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

import ScreenWrapper from '../../components/ScreenWrapper';
import Card from '../../components/Card';
import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import FeedbackModal from '../../components/FeedbackModal';

import {
  changeUserPassword,
  logoutUser,
  sendPasswordReset,
  updateUserProfile,
  verifyCurrentPassword,
} from '../../services/authService';

import { colors as defaultColors } from '../../constants/colors';

export default function ProfileScreen() {
  const { session } = useContext(AuthContext);
  const theme = useTheme();
  const { isDark, toggleMode } = theme;
  const colors = theme?.colors || defaultColors;
  const styles = createStyles(colors);

  const email = session?.user?.email || 'User';
  const metadata = session?.user?.user_metadata || {};
  const [activeSection, setActiveSection] = useState('');
  const [displayName, setDisplayName] = useState(
    metadata.full_name || 'CogniWell User'
  );
  const [ageRange, setAgeRange] = useState(metadata.age_range || '');
  const [goal, setGoal] = useState(metadata.wellbeing_goal || '');
  const [privacy, setPrivacy] = useState({
    analytics: true,
    coachPersonalization: true,
    exportConsent: false,
  });
  const [notifications, setNotifications] = useState({
    moodReminder: true,
    focusReminder: true,
    weeklySummary: true,
  });
  const [newPassword, setNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });

  useEffect(() => {
    async function loadSettings() {
      const savedPrivacy = await AsyncStorage.getItem('privacySettings');
      const savedNotifications = await AsyncStorage.getItem('notificationSettings');

      if (savedPrivacy) {
        setPrivacy(JSON.parse(savedPrivacy));
      }

      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
    }

    loadSettings();
  }, []);

  async function saveProfile() {
    setActiveSection('');
    setSaving(true);
    const { error } = await updateUserProfile({
      ...metadata,
      full_name: displayName,
      age_range: ageRange,
      wellbeing_goal: goal,
    });
    setSaving(false);

    setModal({
      visible: true,
      type: error ? 'error' : 'success',
      title: error ? 'Profile not saved' : 'Profile saved',
      message: error
        ? error.message
        : 'Your profile information has been updated.',
    });
  }

  async function updatePrivacy(nextPrivacy) {
    setPrivacy(nextPrivacy);
    await AsyncStorage.setItem('privacySettings', JSON.stringify(nextPrivacy));
  }

  async function updateNotifications(nextNotifications) {
    setNotifications(nextNotifications);
    await AsyncStorage.setItem(
      'notificationSettings',
      JSON.stringify(nextNotifications)
    );
  }

  async function savePassword() {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setModal({
        visible: true,
        type: 'warning',
        title: 'Missing password fields',
        message: 'Enter your old password and both new password fields.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setModal({
        visible: true,
        type: 'warning',
        title: 'Passwords do not match',
        message: 'Both new password fields must match.',
      });
      return;
    }

    if (newPassword.length < 6) {
      setModal({
        visible: true,
        type: 'warning',
        title: 'Password too short',
        message: 'Use at least 6 characters for your new password.',
      });
      return;
    }

    setActiveSection('');
    setSaving(true);

    const verifyResponse = await verifyCurrentPassword(email, oldPassword);

    if (verifyResponse.error) {
      setSaving(false);
      setModal({
        visible: true,
        type: 'error',
        title: 'Old password incorrect',
        message: verifyResponse.error.message,
      });
      return;
    }

    const { error } = await changeUserPassword(newPassword);
    setSaving(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setModal({
      visible: true,
      type: error ? 'error' : 'success',
      title: error ? 'Password not changed' : 'Password changed',
      message: error ? error.message : 'Your password has been updated.',
    });
  }

  async function resetPassword() {
    setActiveSection('');
    setSaving(true);
    const { error } = await sendPasswordReset(email);
    setSaving(false);

    setModal({
      visible: true,
      type: error ? 'error' : 'success',
      title: error ? 'Reset email failed' : 'Reset email sent',
      message: error
        ? error.message
        : 'Check your inbox for password reset instructions.',
    });
  }

  return (
    <ScreenWrapper>
      <Text style={styles.title}>
        Profile
      </Text>

      <Text style={styles.subtitle}>
        Manage your wellbeing account and preferences.
      </Text>

      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons
            name="person"
            size={40}
            color={colors.background}
          />
        </View>

        <Text style={styles.name}>
          {displayName}
        </Text>

        <Text style={styles.email}>
          {email}
        </Text>
      </Card>

      <Card>
        <View style={styles.themeRow}>
          <View style={styles.itemLeft}>
            <Ionicons
              name={isDark ? 'moon' : 'sunny'}
              size={24}
              color={colors.primary}
            />

            <View style={{ marginLeft: 14 }}>
              <Text style={styles.itemTitle}>
                {isDark ? 'Dark Mode' : 'White Mode'}
              </Text>

              <Text style={styles.itemSubtitle}>
                Switch the app appearance
              </Text>
            </View>
          </View>

          <Switch
            value={isDark}
            onValueChange={toggleMode}
            trackColor={{ false: colors.surface, true: colors.lightTeal }}
            thumbColor={isDark ? colors.primary : colors.secondary}
          />
        </View>

        <ProfileItem
          styles={styles}
          colors={colors}
          icon="create-outline"
          title="Edit Profile"
          subtitle="Update your personal information"
          active={activeSection === 'profile'}
          onPress={() => setActiveSection('profile')}
        />

        <ProfileItem
          styles={styles}
          colors={colors}
          icon="lock-closed-outline"
          title="Privacy Settings"
          subtitle="Manage your data and permissions"
          active={activeSection === 'privacy'}
          onPress={() => setActiveSection('privacy')}
        />

        <ProfileItem
          styles={styles}
          colors={colors}
          icon="notifications-outline"
          title="Notifications"
          subtitle="Configure reminder preferences"
          active={activeSection === 'notifications'}
          onPress={() => setActiveSection('notifications')}
        />

        <ProfileItem
          styles={styles}
          colors={colors}
          icon="shield-checkmark-outline"
          title="Security"
          subtitle="Account protection and login security"
          active={activeSection === 'security'}
          onPress={() => setActiveSection('security')}
        />
      </Card>

      <Card>
        <Text style={styles.infoTitle}>
          About CogniWell AI
        </Text>

        <Text style={styles.infoText}>
          CogniWell AI helps users build healthier digital habits
          using mood tracking, screen-time analytics, focus sessions,
          and AI-powered wellbeing recommendations.
        </Text>
      </Card>

      <AppButton
        title="Logout"
        onPress={logoutUser}
      />

      <FeedbackModal
        visible={saving || modal.visible}
        loading={saving}
        type={modal.type}
        title={saving ? 'Saving changes' : modal.title}
        message={saving ? 'Please wait while your account is updated.' : modal.message}
        onClose={() => setModal((current) => ({ ...current, visible: false }))}
      />

      <Modal transparent visible={!!activeSection} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>
              {activeSection === 'profile'
                ? 'Edit Profile'
                : activeSection === 'privacy'
                  ? 'Privacy Settings'
                  : activeSection === 'notifications'
                    ? 'Notifications'
                    : 'Security'}
            </Text>

            {activeSection === 'profile' ? (
              <>
                <AppInput
                  title="Display name"
                  placeholder="Your name"
                  value={displayName}
                  onChangeText={setDisplayName}
                />
                <AppInput
                  title="Age range"
                  placeholder="Example: 18-24"
                  value={ageRange}
                  onChangeText={setAgeRange}
                />
                <AppInput
                  title="Wellbeing goal"
                  placeholder="Example: Reduce late-night scrolling"
                  value={goal}
                  onChangeText={setGoal}
                />
                <AppButton
                  title={saving ? 'Saving...' : 'Save Profile'}
                  onPress={saveProfile}
                />
              </>
            ) : null}

            {activeSection === 'privacy' ? (
              <>
                <SettingsSwitch
                  styles={styles}
                  colors={colors}
                  title="Usage analytics"
                  subtitle="Use usage logs for dashboard insights"
                  value={privacy.analytics}
                  onValueChange={(value) =>
                    updatePrivacy({ ...privacy, analytics: value })
                  }
                />
                <SettingsSwitch
                  styles={styles}
                  colors={colors}
                  title="AI personalization"
                  subtitle="Allow the coach to tailor recommendations"
                  value={privacy.coachPersonalization}
                  onValueChange={(value) =>
                    updatePrivacy({ ...privacy, coachPersonalization: value })
                  }
                />
                <SettingsSwitch
                  styles={styles}
                  colors={colors}
                  title="Export consent"
                  subtitle="Allow future wellness report exports"
                  value={privacy.exportConsent}
                  onValueChange={(value) =>
                    updatePrivacy({ ...privacy, exportConsent: value })
                  }
                />
              </>
            ) : null}

            {activeSection === 'notifications' ? (
              <>
                <SettingsSwitch
                  styles={styles}
                  colors={colors}
                  title="Mood check-in reminder"
                  subtitle="Remind me to log my emotional status"
                  value={notifications.moodReminder}
                  onValueChange={(value) =>
                    updateNotifications({ ...notifications, moodReminder: value })
                  }
                />
                <SettingsSwitch
                  styles={styles}
                  colors={colors}
                  title="Focus session reminder"
                  subtitle="Nudge me to start a focus block"
                  value={notifications.focusReminder}
                  onValueChange={(value) =>
                    updateNotifications({ ...notifications, focusReminder: value })
                  }
                />
                <SettingsSwitch
                  styles={styles}
                  colors={colors}
                  title="Weekly summary"
                  subtitle="Show weekly wellbeing progress"
                  value={notifications.weeklySummary}
                  onValueChange={(value) =>
                    updateNotifications({ ...notifications, weeklySummary: value })
                  }
                />
              </>
            ) : null}

            {activeSection === 'security' ? (
              <>
                <AppInput
                  title="Old password"
                  placeholder="Enter your current password"
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry
                />
                <AppInput
                  title="New password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
                <AppInput
                  title="Confirm new password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
                <AppButton
                  title={saving ? 'Updating...' : 'Change Password'}
                  onPress={savePassword}
                />
                <AppButton
                  title="Send Forgot Password Email"
                  variant="secondary"
                  onPress={resetPassword}
                />
              </>
            ) : null}

            <AppButton
              title="Close"
              variant="secondary"
              onPress={() => setActiveSection('')}
            />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

function ProfileItem({
  icon,
  title,
  subtitle,
  active,
  onPress,
  styles,
  colors,
}) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.itemLeft}>
        <Ionicons
          name={icon}
          size={24}
          color={colors.primary}
        />

        <View style={{ marginLeft: 14 }}>
          <Text style={styles.itemTitle}>
            {title}
          </Text>

          <Text style={styles.itemSubtitle}>
            {subtitle}
          </Text>
        </View>
      </View>

      <Ionicons
        name={active ? 'chevron-down' : 'chevron-forward'}
        size={22}
        color={colors.mutedText}
      />
    </TouchableOpacity>
  );
}

function SettingsSwitch({
  title,
  subtitle,
  value,
  onValueChange,
  styles,
  colors,
}) {
  return (
    <View style={styles.switchRow}>
      <View style={styles.switchText}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.surface, true: colors.lightTeal }}
        thumbColor={value ? colors.primary : colors.mutedText}
      />
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.text,
  },

  subtitle: {
    fontSize: 15,
    color: colors.mutedText,
    marginTop: 4,
    marginBottom: 18,
    lineHeight: 22,
  },

  profileCard: {
    alignItems: 'center',
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primary,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 14,
  },

  name: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
  },

  email: {
    fontSize: 14,
    color: colors.mutedText,
    marginTop: 6,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  itemTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },

  itemSubtitle: {
    fontSize: 13,
    color: colors.mutedText,
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  switchText: {
    flex: 1,
    paddingRight: 14,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  infoTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 10,
  },

  infoText: {
    color: colors.mutedText,
    lineHeight: 22,
    fontSize: 15,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
  },
  sheet: {
    maxHeight: '88%',
    padding: 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 12,
  },
  });
}

