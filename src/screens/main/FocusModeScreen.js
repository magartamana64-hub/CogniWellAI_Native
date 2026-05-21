import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  AppState,
  Modal,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import ScreenWrapper from '../../components/ScreenWrapper';
import Card from '../../components/Card';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import FeedbackModal from '../../components/FeedbackModal';
import { MinuteStepper } from '../../components/FormControls';
import {
  addFocusSession,
  deleteFocusSession,
  getFocusSessions,
  updateFocusSession,
} from '../../services/focusService';
import { colors as defaultColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function FocusModeScreen({ navigation }) {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const styles = createStyles(colors);
  const { session } = useContext(AuthContext);
  const userId = session?.user?.id;
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState('25');
  const [activeSession, setActiveSession] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [history, setHistory] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [modal, setModal] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });
  const warnedForBlur = useRef(false);
  const savedSession = useRef(false);

  async function loadHistory() {
    const { data, error } = await getFocusSessions(userId);

    if (!error) {
      setHistory(data || []);
    }
  }

  async function saveFocusSession(completed) {
    if (!userId || savedSession.current) {
      return;
    }

    savedSession.current = true;
    await addFocusSession(userId, goal, duration, completed);
    loadHistory();
  }

  useEffect(() => {
    if (userId) {
      loadHistory();
    }
  }, [userId]);

  useEffect(() => {
    if (!activeSession) {
      return undefined;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          clearInterval(timer);
          setActiveSession(false);
          saveFocusSession(true);
          setModal({
            visible: true,
            type: 'success',
            title: 'Focus complete',
            message: 'Nice work. Your focus session finished.',
          });
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      if (activeSession && !warnedForBlur.current) {
        warnedForBlur.current = true;
        setModal({
          visible: true,
          type: 'warning',
          title: 'Focus session is running',
          message: 'Your timer will keep running in the background. Return to Focus Mode or cancel the session.',
        });
      }
    });

    return unsubscribe;
  }, [activeSession, navigation]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (activeSession && nextState !== 'active') {
        setModal({
          visible: true,
          type: 'warning',
          title: 'Stay with your focus block',
          message: 'Your timer is still running. Come back when you are ready to continue.',
        });
      }
    });

    return () => subscription.remove();
  }, [activeSession]);

  function handleStartFocus() {
    if (!goal || Number(duration) <= 0) {
      setModal({
        visible: true,
        type: 'warning',
        title: 'Missing fields',
        message: 'Enter a focus goal and choose a duration.',
      });
      return;
    }

    warnedForBlur.current = false;
    savedSession.current = false;
    setRemainingSeconds(Number(duration) * 60);
    setActiveSession(true);
    setModal({
      visible: true,
      type: 'success',
      title: 'Focus started',
      message: `Goal: ${goal}\nDuration: ${duration} minutes`,
    });
  }

  function cancelFocusSession() {
    saveFocusSession(false);
    setActiveSession(false);
    setRemainingSeconds(0);
    setModal({
      visible: true,
      type: 'warning',
      title: 'Session cancelled',
      message: 'Your focus timer has been stopped.',
    });
  }

  function openSessionDetails(item) {
    setSelectedSession(item);
    setEditingSession({
      goal: item.goal,
      duration: String(item.duration_minutes || 0),
      completed: !!item.completed,
    });
  }

  async function handleUpdateSession() {
    if (!selectedSession || !editingSession) {
      return;
    }

    const { error } = await updateFocusSession(
      selectedSession.id,
      editingSession.goal,
      editingSession.duration,
      editingSession.completed
    );

    if (error) {
      setModal({
        visible: true,
        type: 'error',
        title: 'Update failed',
        message: error.message,
      });
      return;
    }

    setSelectedSession(null);
    setEditingSession(null);
    await loadHistory();
    setModal({
      visible: true,
      type: 'success',
      title: 'Focus history updated',
      message: 'Your session details were saved.',
    });
  }

  async function handleDeleteSession() {
    if (!selectedSession) {
      return;
    }

    const { error } = await deleteFocusSession(selectedSession.id);

    if (error) {
      setModal({
        visible: true,
        type: 'error',
        title: 'Delete failed',
        message: error.message,
      });
      return;
    }

    setSelectedSession(null);
    setEditingSession(null);
    await loadHistory();
    setModal({
      visible: true,
      type: 'success',
      title: 'Focus session deleted',
      message: 'The session was removed from history.',
    });
  }

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Focus Mode</Text>
      <Text style={styles.subtitle}>
        Start distraction-free focus sessions.
      </Text>

      <Card>
        {activeSession ? (
          <View style={styles.timerBlock}>
            <Text style={styles.timerLabel}>Current Session</Text>
            <Text style={styles.goal}>{goal}</Text>
            <Text style={styles.timer}>{formatTime(remainingSeconds)}</Text>
            <Text style={styles.timerHelp}>
              The timer keeps running if you switch tabs.
            </Text>
            <AppButton
              title="Cancel Focus Session"
              variant="secondary"
              onPress={cancelFocusSession}
            />
          </View>
        ) : null}

        <AppInput
          title="Focus goal"
          description="Example: Study networking, complete assignment, read book"
          placeholder="Enter your focus goal"
          value={goal}
          onChangeText={setGoal}
        />

        <MinuteStepper
          title="Focus duration"
          description="Choose session length in minutes."
          value={duration}
          onChange={setDuration}
          step={5}
        />

        <AppButton
          title={activeSession ? 'Restart Focus Session' : 'Start Focus Session'}
          onPress={handleStartFocus}
        />
      </Card>

      <Text style={styles.sectionTitle}>Focus History</Text>

      {history.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>No focus sessions yet.</Text>
        </Card>
      ) : (
        history.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.84}
            onPress={() => openSessionDetails(item)}
          >
            <Card>
              <Text style={styles.historyTitle}>{item.goal}</Text>
              <Text style={styles.historyText}>
                {item.duration_minutes} minutes | {item.completed ? 'Completed' : 'Cancelled'}
              </Text>
              <Text style={styles.historyText}>
                {item.ended_at ? new Date(item.ended_at).toLocaleString() : 'Saved session'}
              </Text>
            </Card>
          </TouchableOpacity>
        ))
      )}

      <Modal transparent visible={!!selectedSession} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Focus Session</Text>

            {editingSession ? (
              <>
                <AppInput
                  title="Goal"
                  value={editingSession.goal}
                  onChangeText={(text) =>
                    setEditingSession((current) => ({ ...current, goal: text }))
                  }
                />
                <MinuteStepper
                  title="Duration"
                  value={editingSession.duration}
                  onChange={(value) =>
                    setEditingSession((current) => ({ ...current, duration: value }))
                  }
                />
                <AppButton
                  title={
                    editingSession.completed
                      ? 'Mark Cancelled'
                      : 'Mark Completed'
                  }
                  variant="secondary"
                  onPress={() =>
                    setEditingSession((current) => ({
                      ...current,
                      completed: !current.completed,
                    }))
                  }
                />
                <AppButton title="Save Changes" onPress={handleUpdateSession} />
                <AppButton
                  title="Delete Session"
                  variant="secondary"
                  onPress={handleDeleteSession}
                />
                <AppButton
                  title="Close"
                  variant="secondary"
                  onPress={() => setSelectedSession(null)}
                />
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      <FeedbackModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        primaryAction={{
          label: activeSession && modal.type === 'warning' ? 'Return' : 'OK',
          onPress: () => {
            setModal((current) => ({ ...current, visible: false }));
            if (activeSession && modal.type === 'warning') {
              navigation.navigate('Focus');
            }
          },
        }}
        secondaryAction={
          activeSession && modal.type === 'warning'
            ? {
                label: 'Cancel',
                onPress: cancelFocusSession,
              }
            : null
        }
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
    color: colors.mutedText,
    marginTop: 4,
    marginBottom: 16,
  },
  timerBlock: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  timerLabel: {
    color: colors.mutedText,
    fontWeight: '800',
  },
  goal: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
  },
  timer: {
    marginTop: 12,
    fontSize: 54,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0,
  },
  timerHelp: {
    color: colors.mutedText,
    marginTop: 6,
    marginBottom: 10,
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
  historyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  historyText: {
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
    maxHeight: '86%',
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

