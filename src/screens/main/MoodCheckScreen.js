import React, {
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  Modal,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

import { AuthContext } from '../../context/AuthContext';

import ScreenWrapper from '../../components/ScreenWrapper';
import AppButton from '../../components/AppButton';
import Card from '../../components/Card';
import FeedbackModal from '../../components/FeedbackModal';
import {
  ChoiceGroup,
  RatingSelector,
} from '../../components/FormControls';

import {
  addMoodLog,
  deleteMoodLog,
  getMoodLogs,
  updateMoodLog,
} from '../../services/moodService';

import { colors as defaultColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';

const MOOD_OPTIONS = [
  { label: 'Happy', value: 'Happy', icon: 'sunny' },
  { label: 'Calm', value: 'Calm', icon: 'leaf' },
  { label: 'Focused', value: 'Focused', icon: 'radio-button-on' },
  { label: 'Tired', value: 'Tired', icon: 'moon' },
  { label: 'Stressed', value: 'Stressed', icon: 'flash' },
  { label: 'Sad', value: 'Sad', icon: 'rainy' },
];

const SLEEP_OPTIONS = [
  { label: 'Poor', value: 'Poor', icon: 'cloudy-night' },
  { label: 'Fair', value: 'Fair', icon: 'partly-sunny' },
  { label: 'Good', value: 'Good', icon: 'moon' },
  { label: 'Great', value: 'Great', icon: 'sparkles' },
];

export default function MoodCheckScreen() {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const styles = createStyles(colors);
  const { session } = useContext(AuthContext);

  const userId = session?.user?.id;

  const [mood, setMood] = useState('');
  const [stressLevel, setStressLevel] = useState('');
  const [focusLevel, setFocusLevel] = useState('');
  const [energyLevel, setEnergyLevel] = useState('');
  const [sleepQuality, setSleepQuality] = useState('');
  const [history, setHistory] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [editingMood, setEditingMood] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });

  async function loadHistory() {
    const { data, error } = await getMoodLogs(userId);

    if (!error) {
      setHistory(data || []);
    }
  }

  useEffect(() => {
    if (userId) {
      loadHistory();
    }
  }, [userId]);

  async function handleSave() {
    if (
      !mood ||
      !stressLevel ||
      !focusLevel ||
      !energyLevel ||
      !sleepQuality
    ) {
      setModal({
        visible: true,
        type: 'warning',
        title: 'Missing information',
        message: 'Choose your mood, ratings, and sleep quality before saving.',
      });
      return;
    }

    setSaving(true);

    const { error } = await addMoodLog(
      userId,
      mood,
      stressLevel,
      focusLevel,
      energyLevel,
      sleepQuality
    );

    setSaving(false);

    if (error) {
      setModal({
        visible: true,
        type: 'error',
        title: 'Could not save mood',
        message: error.message,
      });
      return;
    }

    setMood('');
    setStressLevel('');
    setFocusLevel('');
    setEnergyLevel('');
    setSleepQuality('');

    setModal({
      visible: true,
      type: 'success',
      title: 'Mood saved',
      message: 'Your wellbeing check-in has been saved.',
    });

    loadHistory();
  }

  function openMoodDetails(item) {
    setSelectedMood(item);
    setEditingMood({
      mood: item.mood,
      stressLevel: String(item.stress_level || ''),
      focusLevel: String(item.focus_level || ''),
      energyLevel: String(item.energy_level || ''),
      sleepQuality: item.sleep_quality,
    });
  }

  async function handleUpdateMood() {
    if (!selectedMood || !editingMood) {
      return;
    }

    setSaving(true);
    const { error } = await updateMoodLog(
      selectedMood.id,
      editingMood.mood,
      editingMood.stressLevel,
      editingMood.focusLevel,
      editingMood.energyLevel,
      editingMood.sleepQuality
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

    setSelectedMood(null);
    setEditingMood(null);
    await loadHistory();
    setModal({
      visible: true,
      type: 'success',
      title: 'Mood updated',
      message: 'Your mood history was updated.',
    });
  }

  async function handleDeleteMood() {
    if (!selectedMood) {
      return;
    }

    setSaving(true);
    const { error } = await deleteMoodLog(selectedMood.id);
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

    setSelectedMood(null);
    setEditingMood(null);
    await loadHistory();
    setModal({
      visible: true,
      type: 'success',
      title: 'Mood deleted',
      message: 'The mood entry was removed.',
    });
  }

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Mood Check-in</Text>

      <Text style={styles.subtitle}>
        Reflect on your wellbeing and mental state today.
      </Text>

      <Card>
        <ChoiceGroup
          title="Current emotional status"
          description="Choose the feeling that best matches right now."
          options={MOOD_OPTIONS}
          value={mood}
          onChange={setMood}
        />

        <RatingSelector
          title="Stress level"
          description="1 is low, 5 is high."
          value={stressLevel}
          onChange={setStressLevel}
        />

        <RatingSelector
          title="Focus level"
          description="1 is poor, 5 is excellent."
          value={focusLevel}
          onChange={setFocusLevel}
        />

        <RatingSelector
          title="Energy level"
          description="1 is low, 5 is high."
          value={energyLevel}
          onChange={setEnergyLevel}
        />

        <ChoiceGroup
          title="Sleep quality"
          description="How well did you sleep last night?"
          options={SLEEP_OPTIONS}
          value={sleepQuality}
          onChange={setSleepQuality}
        />

        <AppButton
          title={saving ? 'Saving...' : 'Save Mood Check-in'}
          onPress={handleSave}
        />
      </Card>

      <Text style={styles.sectionTitle}>Mood History</Text>

      {history.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>No mood history yet.</Text>
        </Card>
      ) : (
        history.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.84}
            onPress={() => openMoodDetails(item)}
          >
            <Card>
              <Text style={styles.logTitle}>{item.mood}</Text>
              <Text style={styles.logText}>
                {item.log_date} | Stress {item.stress_level} | Focus {item.focus_level}
              </Text>
              <Text style={styles.logText}>
                Energy {item.energy_level} | Sleep {item.sleep_quality}
              </Text>
            </Card>
          </TouchableOpacity>
        ))
      )}

      <Modal transparent visible={!!selectedMood} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Mood Details</Text>

            {editingMood ? (
              <ScrollView
                style={styles.sheetScroll}
                contentContainerStyle={styles.sheetContent}
                showsVerticalScrollIndicator={false}
              >
                <ChoiceGroup
                  title="Current emotional status"
                  options={MOOD_OPTIONS}
                  value={editingMood.mood}
                  onChange={(value) =>
                    setEditingMood((current) => ({ ...current, mood: value }))
                  }
                />

                <RatingSelector
                  title="Stress level"
                  value={editingMood.stressLevel}
                  onChange={(value) =>
                    setEditingMood((current) => ({ ...current, stressLevel: value }))
                  }
                />

                <RatingSelector
                  title="Focus level"
                  value={editingMood.focusLevel}
                  onChange={(value) =>
                    setEditingMood((current) => ({ ...current, focusLevel: value }))
                  }
                />

                <RatingSelector
                  title="Energy level"
                  value={editingMood.energyLevel}
                  onChange={(value) =>
                    setEditingMood((current) => ({ ...current, energyLevel: value }))
                  }
                />

                <ChoiceGroup
                  title="Sleep quality"
                  options={SLEEP_OPTIONS}
                  value={editingMood.sleepQuality}
                  onChange={(value) =>
                    setEditingMood((current) => ({ ...current, sleepQuality: value }))
                  }
                />

                <AppButton
                  title={saving ? 'Saving...' : 'Save Changes'}
                  onPress={handleUpdateMood}
                />
                <AppButton
                  title={saving ? 'Deleting...' : 'Delete Mood Entry'}
                  variant="secondary"
                  onPress={handleDeleteMood}
                />
                <AppButton
                  title="Close"
                  variant="secondary"
                  onPress={() => setSelectedMood(null)}
                />
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>

      <FeedbackModal
        visible={saving || modal.visible}
        loading={saving}
        type={modal.type}
        title={saving ? 'Saving mood' : modal.title}
        message={saving ? 'Please wait while your check-in is saved.' : modal.message}
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
    maxHeight: '90%',
    padding: 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sheetScroll: {
    maxHeight: '100%',
  },
  sheetContent: {
    paddingBottom: 18,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 12,
  },
  });
}

