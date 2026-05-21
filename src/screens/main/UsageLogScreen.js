import React, { useContext, useEffect, useState } from 'react';
import {
  Modal,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { AuthContext } from '../../context/AuthContext';

import ScreenWrapper from '../../components/ScreenWrapper';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import Card from '../../components/Card';
import FeedbackModal from '../../components/FeedbackModal';
import {
  ChoiceGroup,
  MinuteStepper,
} from '../../components/FormControls';

import {
  addUsageLog,
  deleteUsageLog,
  getTodayUsageLogs,
  updateUsageLog,
} from '../../services/usageService';

import { colors as defaultColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';

const APP_OPTIONS = [
  { label: 'Instagram', value: 'Instagram', icon: 'logo-instagram' },
  { label: 'YouTube', value: 'YouTube', icon: 'logo-youtube' },
  { label: 'TikTok', value: 'TikTok', icon: 'musical-notes' },
  { label: 'WhatsApp', value: 'WhatsApp', icon: 'chatbubbles' },
  { label: 'Netflix', value: 'Netflix', icon: 'play-circle' },
  { label: 'Other', value: 'Other', icon: 'apps' },
];

const CATEGORY_OPTIONS = [
  { label: 'Social', value: 'Social Media', icon: 'people' },
  { label: 'Entertainment', value: 'Entertainment', icon: 'film' },
  { label: 'Productivity', value: 'Productivity', icon: 'briefcase' },
  { label: 'Learning', value: 'Learning', icon: 'school' },
  { label: 'Games', value: 'Games', icon: 'game-controller' },
  { label: 'Messaging', value: 'Messaging', icon: 'chatbox' },
];

export default function UsageLogScreen() {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const styles = createStyles(colors);
  const { session } = useContext(AuthContext);

  const userId = session?.user?.id;

  const [appName, setAppName] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('30');
  const [customAppName, setCustomAppName] = useState('');

  const [logs, setLogs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [editingLog, setEditingLog] = useState(null);
  const [modal, setModal] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });

  async function loadLogs() {
    const { data, error } = await getTodayUsageLogs(userId);

    if (!error) {
      setLogs(data || []);
    }
  }

  useEffect(() => {
    if (userId) {
      loadLogs();
    }
  }, [userId]);

  async function handleSave() {
    const selectedApp = appName === 'Other' ? customAppName.trim() : appName;

    if (!selectedApp || !category || Number(duration) <= 0) {
      setModal({
        visible: true,
        type: 'warning',
        title: 'Missing information',
        message: 'Choose an app, type, and minutes before saving.',
      });
      return;
    }

    setSaving(true);

    const { error } = await addUsageLog(
      userId,
      selectedApp,
      category,
      duration
    );

    setSaving(false);

    if (error) {
      setModal({
        visible: true,
        type: 'error',
        title: 'Could not save usage',
        message: error.message,
      });
      return;
    }

    setAppName('');
    setCategory('');
    setDuration('30');
    setCustomAppName('');

    loadLogs();

    setModal({
      visible: true,
      type: 'success',
      title: 'Usage saved',
      message: 'Your app usage was added to today\'s activity.',
    });
  }

  function openLogDetails(item) {
    setSelectedLog(item);
    setEditingLog({
      appName: item.app_name,
      category: item.category,
      duration: String(item.duration_minutes || 0),
    });
  }

  async function handleUpdateLog() {
    if (!selectedLog || !editingLog.appName || !editingLog.category) {
      return;
    }

    setSaving(true);
    const { error } = await updateUsageLog(
      selectedLog.id,
      editingLog.appName,
      editingLog.category,
      editingLog.duration
    );
    setSaving(false);

    if (error) {
      setModal({
        visible: true,
        type: 'error',
        title: 'Update failed',
        message: error.message,
      });
      return;
    }

    setSelectedLog(null);
    setEditingLog(null);
    await loadLogs();
    setModal({
      visible: true,
      type: 'success',
      title: 'Usage updated',
      message: 'Today\'s activity was updated.',
    });
  }

  async function handleDeleteLog() {
    if (!selectedLog) {
      return;
    }

    setSaving(true);
    const { error } = await deleteUsageLog(selectedLog.id);
    setSaving(false);

    if (error) {
      setModal({
        visible: true,
        type: 'error',
        title: 'Delete failed',
        message: error.message,
      });
      return;
    }

    setSelectedLog(null);
    setEditingLog(null);
    await loadLogs();
    setModal({
      visible: true,
      type: 'success',
      title: 'Usage deleted',
      message: 'The activity item was removed.',
    });
  }

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Usage Log</Text>

      <Text style={styles.subtitle}>
        Track your daily app usage and digital habits.
      </Text>

      <Card>
        <ChoiceGroup
          title="Choose app"
          description="Select the app you used today."
          options={APP_OPTIONS}
          value={appName}
          onChange={setAppName}
        />

        {appName === 'Other' ? (
          <AppInput
            title="App name"
            description="Add the app name if it is not in the list."
            placeholder="Example: Reddit"
            value={customAppName}
            onChangeText={setCustomAppName}
          />
        ) : null}

        <ChoiceGroup
          title="App type"
          description="This helps CogniWell understand your digital behaviour."
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={setCategory}
        />

        <MinuteStepper
          title="Minutes used"
          description="Increase or decrease the total time spent today."
          value={duration}
          onChange={setDuration}
          step={5}
        />

        <AppButton
          title={saving ? 'Saving...' : 'Save Usage Log'}
          onPress={handleSave}
        />
      </Card>

      <Text style={styles.sectionTitle}>Today's Activity</Text>

      {logs.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>
            No usage logs added today.
          </Text>
        </Card>
      ) : (
        logs.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.84}
            onPress={() => openLogDetails(item)}
          >
          <Card>
            <Text style={styles.logTitle}>
              {item.app_name}
            </Text>

            <Text style={styles.logText}>
              Category: {item.category}
            </Text>

            <Text style={styles.logText}>
              Duration: {item.duration_minutes} minutes
            </Text>
          </Card>
          </TouchableOpacity>
        ))
      )}

      <Modal transparent visible={!!selectedLog} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Activity Details</Text>

            {editingLog ? (
              <>
                <AppInput
                  title="App"
                  value={editingLog.appName}
                  onChangeText={(text) =>
                    setEditingLog((current) => ({ ...current, appName: text }))
                  }
                />

                <ChoiceGroup
                  title="App type"
                  options={CATEGORY_OPTIONS}
                  value={editingLog.category}
                  onChange={(value) =>
                    setEditingLog((current) => ({ ...current, category: value }))
                  }
                />

                <MinuteStepper
                  title="Minutes"
                  value={editingLog.duration}
                  onChange={(value) =>
                    setEditingLog((current) => ({ ...current, duration: value }))
                  }
                />

                <AppButton
                  title={saving ? 'Saving...' : 'Save Changes'}
                  onPress={handleUpdateLog}
                />
                <AppButton
                  title={saving ? 'Deleting...' : 'Delete Activity'}
                  variant="secondary"
                  onPress={handleDeleteLog}
                />
                <AppButton
                  title="Close"
                  variant="secondary"
                  onPress={() => setSelectedLog(null)}
                />
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      <FeedbackModal
        visible={saving || modal.visible}
        loading={saving}
        type={modal.type}
        title={saving ? 'Saving usage' : modal.title}
        message={saving ? 'Please wait while your log is saved.' : modal.message}
        onClose={() => setModal((current) => ({ ...current, visible: false }))}
      />
    </ScreenWrapper>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  title: {
    fontSize: 30,
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

  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
  },

  emptyText: {
    color: colors.mutedText,
    fontSize: 15,
  },

  logTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },

  logText: {
    color: colors.mutedText,
    marginTop: 4,
    fontSize: 14,
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

