import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Platform,
  ScrollView,
  Linking,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../services/api';
import { locationService } from '../services/locationService';
import CustomPicker from '../components/CustomPicker';
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from '../utils/theme';

const TimeTrackingScreen = () => {
  const [logs, setLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeLog, setActiveLog] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Timer States
  const [elapsedText, setElapsedText] = useState('00:00:00');
  const timerIntervalRef = useRef(null);

  // New Active Entry Form State
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [description, setDescription] = useState('');
  const [submittingStart, setSubmittingStart] = useState(false);
  const [submittingStop, setSubmittingStop] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Manual Entry Modal State
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [manualForm, setManualForm] = useState({
    task_id: '',
    description: '',
    start_date: new Date(),
    start_time: new Date(),
    end_date: new Date(),
    end_time: new Date(),
  });
  
  // DateTimePicker display controls
  const [showDatePicker, setShowDatePicker] = useState(null); // 'start_date', 'start_time', 'end_date', 'end_time'

  useEffect(() => {
    fetchInitialData();
    return () => stopLocalTimer();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchLogs(),
        fetchTasks(),
        fetchActiveTimer(),
      ]);
    } catch (e) {
      console.log('Error initializing data', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await api.get('/time');
      setLogs(response.data.data || []);
    } catch (e) {
      console.log('Error fetching logs', e);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data.data || []);
    } catch (e) {
      console.log('Error fetching tasks', e);
    }
  };

  const fetchActiveTimer = async () => {
    try {
      const response = await api.get('/time/active');
      const active = response.data.data;
      setActiveLog(active);
      if (active) {
        startLocalTimer(active.start_time);
      } else {
        stopLocalTimer();
      }
    } catch (e) {
      console.log('Error fetching active timer', e);
    }
  };

  const startLocalTimer = (startTimeStr) => {
    stopLocalTimer();
    const startTime = new Date(startTimeStr);
    
    const updateTimer = () => {
      const diffMs = new Date() - startTime;
      if (diffMs < 0) return;
      const totalSecs = Math.floor(diffMs / 1000);
      const hrs = Math.floor(totalSecs / 3600).toString().padStart(2, '0');
      const mins = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0');
      const secs = (totalSecs % 60).toString().padStart(2, '0');
      setElapsedText(`${hrs}:${mins}:${secs}`);
    };

    updateTimer();
    timerIntervalRef.current = setInterval(updateTimer, 1000);
  };

  const stopLocalTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setElapsedText('00:00:00');
  };

  const handleStartTimer = async () => {
    if (!selectedTaskId) {
      Alert.alert('Validation', 'Please select a task to start the timer.');
      return;
    }
    setSubmittingStart(true);
    setLocationLoading(true);
    try {
      // Capture location before starting
      const loc = await locationService.getCurrentLocation();

      const response = await api.post('/time/start', {
        task_id: selectedTaskId,
        description: description.trim(),
        latitude: loc.latitude,
        longitude: loc.longitude,
        address: loc.location_address,
      });
      
      const active = response.data.data;
      setActiveLog(active);
      startLocalTimer(active.start_time);
      setSelectedTaskId('');
      setDescription('');
      
      // Refresh list
      fetchLogs();
      Alert.alert('Checked In', 'Time session started.');
    } catch (e) {
      console.log('Error starting timer', e);
      Alert.alert('Error', e.response?.data?.message || 'Failed to start timer');
    } finally {
      setSubmittingStart(false);
      setLocationLoading(false);
    }
  };

  const handleStopTimer = async () => {
    if (!activeLog) return;
    setSubmittingStop(true);
    setLocationLoading(true);
    try {
      // Capture location before stopping
      const loc = await locationService.getCurrentLocation();

      await api.post(`/time/stop/${activeLog.id}`, {
        latitude: loc.latitude,
        longitude: loc.longitude,
        address: loc.location_address,
      });
      setActiveLog(null);
      stopLocalTimer();
      
      // Refresh data
      fetchLogs();
      Alert.alert('Checked Out', 'Time session ended and logged.');
    } catch (e) {
      console.log('Error stopping timer', e);
      Alert.alert('Error', 'Failed to stop timer');
    } finally {
      setSubmittingStop(false);
      setLocationLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    const { task_id, description, start_date, start_time, end_date, end_time } = manualForm;
    if (!task_id) {
      Alert.alert('Validation', 'Please select a task');
      return;
    }

    // Combine dates and times
    const startObj = new Date(
      start_date.getFullYear(),
      start_date.getMonth(),
      start_date.getDate(),
      start_time.getHours(),
      start_time.getMinutes()
    );

    const endObj = new Date(
      end_date.getFullYear(),
      end_date.getMonth(),
      end_date.getDate(),
      end_time.getHours(),
      end_time.getMinutes()
    );

    if (endObj <= startObj) {
      Alert.alert('Validation', 'End time must be after start time');
      return;
    }

    try {
      await api.post('/time/manual', {
        task_id,
        description,
        start_time: startObj.toISOString(),
        end_time: endObj.toISOString(),
      });

      setManualModalVisible(false);
      setManualForm({
        task_id: '',
        description: '',
        start_date: new Date(),
        start_time: new Date(),
        end_date: new Date(),
        end_time: new Date(),
      });
      fetchLogs();
      Alert.alert('Success', 'Manual time entry created.');
    } catch (e) {
      console.log('Failed to post manual log', e);
      Alert.alert('Error', 'Failed to save manual time log.');
    }
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(null);
    if (!date) return;
    
    if (showDatePicker === 'start_date') {
      setManualForm({ ...manualForm, start_date: date });
    } else if (showDatePicker === 'start_time') {
      setManualForm({ ...manualForm, start_time: date });
    } else if (showDatePicker === 'end_date') {
      setManualForm({ ...manualForm, end_date: date });
    } else if (showDatePicker === 'end_time') {
      setManualForm({ ...manualForm, end_time: date });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchLogs(), fetchActiveTimer()]);
    setRefreshing(false);
  };

  const openInMaps = (lat, lng) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    Linking.openURL(url).catch(() => {});
  };

  const renderLocationChip = (lat, lng, address, label) => {
    if (!lat && !lng) return null;
    const displayText = address || `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`;
    const truncated = displayText.length > 35 ? displayText.substring(0, 35) + '…' : displayText;
    return (
      <TouchableOpacity
        style={styles.locationChip}
        onPress={() => openInMaps(lat, lng)}
        activeOpacity={0.7}
      >
        <Text style={styles.locationChipLabel}>{label}</Text>
        <Text style={styles.locationChipText}>📍 {truncated}</Text>
      </TouchableOpacity>
    );
  };

  const renderLog = ({ item }) => {
    let durationStr = 'Active';
    if (item.end_time) {
      const diff = new Date(item.end_time) - new Date(item.start_time);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      durationStr = `${hours}h ${mins}m`;
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.task?.title || 'General / Internal'}</Text>
          {item.is_manual ? (
            <View style={styles.manualLabel}><Text style={styles.manualLabelText}>MANUAL</Text></View>
          ) : null}
        </View>

        <Text style={styles.cardDate}>
          📅 {new Date(item.start_time).toLocaleDateString()}
        </Text>
        
        <Text style={styles.cardTime}>
          🕒 {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {item.end_time ? ` to ${new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ' (Current Session)'}
        </Text>

        {item.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        ) : null}

        {/* Location Info */}
        {(item.start_latitude || item.stop_latitude) && (
          <View style={styles.locationRow}>
            {renderLocationChip(item.start_latitude, item.start_longitude, item.start_address, 'Start')}
            {renderLocationChip(item.stop_latitude, item.stop_longitude, item.stop_address, 'Stop')}
          </View>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.durationText}>Total: {durationStr}</Text>
          {!item.end_time && (
            <View style={styles.activePulse}>
              <View style={styles.pulseDot} />
              <Text style={styles.activeText}>ACTIVE</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const pickerTasks = tasks.map(t => ({ label: t.title, value: t.id }));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderLog}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Live Timer Section */}
            {activeLog ? (
              <View style={styles.timerPanel}>
                <View style={styles.timerHeader}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.timerHeaderTitle}>Timer Running</Text>
                </View>
                <Text style={styles.timerTaskTitle} numberOfLines={1}>
                  {activeLog.task?.title || 'Active Session'}
                </Text>
                {activeLog.description ? (
                  <Text style={styles.timerDesc} numberOfLines={2}>{activeLog.description}</Text>
                ) : null}
                
                <Text style={styles.timerCounter}>{elapsedText}</Text>

                {activeLog.start_address ? (
                  <View style={styles.timerLocationChip}>
                    <Text style={styles.timerLocationText} numberOfLines={1}>
                      📍 Started at: {activeLog.start_address}
                    </Text>
                  </View>
                ) : null}
                
                <TouchableOpacity
                  style={[styles.stopButton, locationLoading && styles.buttonDisabled]}
                  onPress={handleStopTimer}
                  disabled={submittingStop || locationLoading}
                  activeOpacity={0.8}
                >
                  {(submittingStop || locationLoading) ? (
                    <View style={styles.buttonLoadingRow}>
                      <ActivityIndicator color={COLORS.textWhite} size="small" />
                      <Text style={styles.stopButtonText}>
                        {locationLoading ? ' Getting Location…' : ' Stopping…'}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.stopButtonText}>🔴 Check Out</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.timerPanel}>
                <Text style={styles.timerPanelTitle}>Start Working Session</Text>
                
                <View style={{ zIndex: 1000, width: '100%' }}>
                  <CustomPicker
                    label="Choose Task"
                    value={selectedTaskId}
                    items={pickerTasks}
                    onValueChange={setSelectedTaskId}
                    placeholder="Select active task..."
                  />
                </View>

                <TextInput
                  style={styles.timerInput}
                  placeholder="Notes (optional)..."
                  placeholderTextColor={COLORS.textLight}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                />

                <TouchableOpacity
                  style={[styles.startButton, locationLoading && styles.buttonDisabled]}
                  onPress={handleStartTimer}
                  disabled={submittingStart || locationLoading}
                  activeOpacity={0.8}
                >
                  {(submittingStart || locationLoading) ? (
                    <View style={styles.buttonLoadingRow}>
                      <ActivityIndicator color={COLORS.textWhite} size="small" />
                      <Text style={styles.startButtonText}>
                        {locationLoading ? ' Locating…' : ' Starting…'}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.startButtonText}>🟢 Check In</Text>
                  )}
                </TouchableOpacity>

                <Text style={styles.locationHint}>
                  📍 Location auto-saved on check-in & check-out
                </Text>
              </View>
            )}

            {/* Quick Actions Panel */}
            <View style={styles.actionsPanel}>
              <Text style={styles.historyTitle}>Work History logs</Text>
              <TouchableOpacity
                style={styles.manualBtn}
                onPress={() => setManualModalVisible(true)}
              >
                <Text style={styles.manualBtnText}>+ Log Hours Manually</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No historical work logs found.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* MODAL: MANUAL TIME LOG */}
      <Modal
        visible={manualModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setManualModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Log Hours Manually</Text>

              {/* Task Selector */}
              <View style={{ zIndex: 1000, width: '100%', marginBottom: SPACING.md }}>
                <CustomPicker
                  label="Select Task"
                  value={manualForm.task_id}
                  items={pickerTasks}
                  onValueChange={(val) => setManualForm({ ...manualForm, task_id: val })}
                  placeholder="Choose task..."
                />
              </View>

              {/* Notes */}
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Work Note</Text>
                <TextInput
                  style={[styles.modalInput, { height: 60, textAlignVertical: 'top' }]}
                  placeholder="What did you work on?"
                  value={manualForm.description}
                  onChangeText={(val) => setManualForm({ ...manualForm, description: val })}
                  multiline
                />
              </View>

              {/* Start Date & Time */}
              <View style={styles.dateTimeSelectors}>
                <Text style={styles.modalInputLabel}>Start Time</Text>
                <View style={styles.pickerRow}>
                  <TouchableOpacity
                    style={styles.pickerBtn}
                    onPress={() => setShowDatePicker('start_date')}
                  >
                    <Text style={styles.pickerBtnText}>
                      📅 {manualForm.start_date.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.pickerBtn}
                    onPress={() => setShowDatePicker('start_time')}
                  >
                    <Text style={styles.pickerBtnText}>
                      🕒 {manualForm.start_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* End Date & Time */}
              <View style={styles.dateTimeSelectors}>
                <Text style={styles.modalInputLabel}>End Time</Text>
                <View style={styles.pickerRow}>
                  <TouchableOpacity
                    style={styles.pickerBtn}
                    onPress={() => setShowDatePicker('end_date')}
                  >
                    <Text style={styles.pickerBtnText}>
                      📅 {manualForm.end_date.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.pickerBtn}
                    onPress={() => setShowDatePicker('end_time')}
                  >
                    <Text style={styles.pickerBtnText}>
                      🕒 {manualForm.end_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Platform DateTimePicker Renderer */}
              {showDatePicker && (
                <DateTimePicker
                  value={
                    showDatePicker === 'start_date' ? manualForm.start_date :
                    showDatePicker === 'start_time' ? manualForm.start_time :
                    showDatePicker === 'end_date' ? manualForm.end_date : manualForm.end_time
                  }
                  mode={showDatePicker.includes('date') ? 'date' : 'time'}
                  display="default"
                  onChange={handleDateChange}
                />
              )}

              {/* Modal buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalCancelBtn]}
                  onPress={() => setManualModalVisible(false)}
                >
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalSaveBtn]}
                  onPress={handleManualSubmit}
                >
                  <Text style={styles.modalSaveBtnText}>Log Session</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingBottom: SPACING.md,
  },
  timerPanel: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  timerPanelTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  timerHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.error,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timerTaskTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  timerDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  timerCounter: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginVertical: SPACING.lg,
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  timerInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    height: 60,
    fontSize: 14,
    color: COLORS.text,
    marginTop: SPACING.md,
    textAlignVertical: 'top',
  },
  startButton: {
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    marginTop: SPACING.md,
    ...SHADOWS.light,
  },
  startButtonText: {
    color: COLORS.textWhite,
    fontWeight: '850',
    fontSize: 16,
  },
  stopButton: {
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    marginTop: SPACING.xs,
    ...SHADOWS.light,
  },
  stopButtonText: {
    color: COLORS.textWhite,
    fontWeight: '850',
    fontSize: 16,
  },
  actionsPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  manualBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    ...SHADOWS.light,
  },
  manualBtnText: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.md,
  },
  manualLabel: {
    backgroundColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  manualLabelText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  cardDate: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  cardTime: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  cardDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  activePulse: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    marginRight: 6,
  },
  activeText: {
    fontSize: 11,
    color: COLORS.error,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    width: '100%',
    ...SHADOWS.dark,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  modalInputGroup: {
    marginBottom: SPACING.md,
  },
  modalInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    height: 40,
    fontSize: 14,
    color: COLORS.text,
  },
  dateTimeSelectors: {
    marginBottom: SPACING.md,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  pickerBtn: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerBtnText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  modalBtn: {
    paddingHorizontal: SPACING.lg,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelBtn: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCancelBtnText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  modalSaveBtn: {
    backgroundColor: COLORS.primary,
  },
  modalSaveBtnText: {
    color: COLORS.textWhite,
    fontWeight: '700',
  },
  // Location styles
  locationHint: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  timerLocationChip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    alignSelf: 'center',
    marginBottom: SPACING.sm,
    maxWidth: '90%',
  },
  timerLocationText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  buttonLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  locationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  locationChip: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    flex: 1,
    minWidth: 120,
  },
  locationChipLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  locationChipText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default TimeTrackingScreen;
