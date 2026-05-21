import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import CustomPicker from '../components/CustomPicker';
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from '../utils/theme';

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'On Hold', value: 'on_hold' },
];

const PRIORITY_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

const FORM_PRIORITIES = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

const TasksScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  
  // Tasks list state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Task Creation Modal state
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [submittingTask, setSubmittingTask] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    client_id: '',
    hospital_id: '',
    doctor_id: '',
    assigned_to: '',
    priority: 'medium',
    status: 'pending',
    due_date: new Date(),
  });
  
  // Dropdown lists for the creation form
  const [clients, setClients] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [usersList, setUsersList] = useState([]);
  
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchTasks = async (pageNumber = 1, shouldAppend = false) => {
    try {
      if (pageNumber === 1 && !shouldAppend) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await api.get('/tasks', {
        params: {
          search,
          status: statusFilter,
          priority: priorityFilter,
          page: pageNumber,
          limit: 10,
        },
      });

      const newTasks = response.data.data || [];
      setTotalPages(response.data.totalPages || 1);
      setPage(pageNumber);

      if (shouldAppend) {
        setTasks((prev) => [...prev, ...newTasks]);
      } else {
        setTasks(newTasks);
      }
    } catch (e) {
      console.log('Error fetching tasks', e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const fetchDropdowns = async () => {
    // Strategy 1: Try the unified /tasks/options endpoint (works once backend is deployed)
    try {
      console.log('[API Debug] Trying /tasks/options endpoint...');
      const res = await api.get('/tasks/options');
      if (res.data?.success && res.data.data) {
        const { clients, hospitals, doctors, users } = res.data.data;
        console.log('[API Debug] Options fetched via /tasks/options. Counts -> clients:', clients?.length, 'hospitals:', hospitals?.length, 'doctors:', doctors?.length, 'users:', users?.length);
        setClients(clients || []);
        setHospitals(hospitals || []);
        setDoctors(doctors || []);
        setUsersList(users || []);
        return; // Success — no need for fallback
      }
    } catch (err) {
      console.log('[API Debug] /tasks/options not available (', err.response?.status, '), using fallback...');
    }

    // Strategy 2: Fallback — extract unique entities from the task list
    // This works with just tasks_view permission (no backend changes needed)
    try {
      console.log('[API Debug] Extracting dropdown data from task list...');
      const res = await api.get('/tasks?limit=500');
      const tasks = res.data?.data || [];

      const clientMap = new Map();
      const hospitalMap = new Map();
      const doctorMap = new Map();
      const userMap = new Map();

      tasks.forEach(task => {
        if (task.client && task.client.id) {
          clientMap.set(task.client.id, task.client);
        }
        if (task.hospital && task.hospital.id) {
          hospitalMap.set(task.hospital.id, task.hospital);
        }
        if (task.doctor && task.doctor.id) {
          doctorMap.set(task.doctor.id, task.doctor);
        }
        if (task.assignee && task.assignee.id) {
          userMap.set(task.assignee.id, task.assignee);
        }
        if (task.creator && task.creator.id) {
          userMap.set(task.creator.id, { ...task.creator, role: 'staff' });
        }
      });

      const extractedClients = [...clientMap.values()];
      const extractedHospitals = [...hospitalMap.values()];
      const extractedDoctors = [...doctorMap.values()];
      const extractedUsers = [...userMap.values()];

      console.log('[API Debug] Extracted from tasks. Counts -> clients:', extractedClients.length, 'hospitals:', extractedHospitals.length, 'doctors:', extractedDoctors.length, 'users:', extractedUsers.length);

      setClients(extractedClients);
      setHospitals(extractedHospitals);
      setDoctors(extractedDoctors);
      setUsersList(extractedUsers);
    } catch (err2) {
      console.log('[API Debug] Fallback extraction also failed:', err2.response?.status, err2.response?.data || err2.message);
    }
  };

  useEffect(() => {
    fetchTasks(1, false);
    fetchDropdowns();
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = () => {
    fetchTasks(1, false);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks(1, false);
  };

  const loadMoreTasks = () => {
    if (page < totalPages && !loadingMore && !loading) {
      fetchTasks(page + 1, true);
    }
  };

  const handleCreateTaskSubmit = async () => {
    if (!form.title.trim()) {
      Alert.alert('Validation', 'Please enter a task title.');
      return;
    }
    
    setSubmittingTask(true);
    try {
      await api.post('/tasks', {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        due_date: form.due_date.toISOString().split('T')[0],
      });
      
      setForm({
        title: '',
        description: '',
        client_id: '',
        hospital_id: '',
        doctor_id: '',
        assigned_to: '',
        priority: 'medium',
        status: 'pending',
        due_date: new Date(),
      });
      
      setCreateModalVisible(false);
      Alert.alert('Success', 'New task successfully created.');
      fetchTasks(1, false);
    } catch (err) {
      console.log('Error creating task', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setForm({ ...form, due_date: date });
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'in_progress':
      case 'in progress': return COLORS.info;
      case 'on_hold':
      case 'on hold': return COLORS.secondary;
      default: return COLORS.textSecondary;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return COLORS.error;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('TaskDetails', { taskId: item.id, taskTitle: item.title })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '15' }]}>
          <Text style={[styles.priorityBadgeText, { color: getPriorityColor(item.priority) }]}>
            {item.priority}
          </Text>
        </View>
      </View>

      {item.description ? (
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
      ) : null}

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <View style={styles.metaColumn}>
          <Text style={styles.metaLabel}>Client/Patient</Text>
          <Text style={styles.metaValue} numberOfLines={1}>
            {item.client?.patient_name || 'None'}
          </Text>
        </View>
        
        <View style={styles.metaColumn}>
          <Text style={styles.metaLabel}>Hospital</Text>
          <Text style={styles.metaValue} numberOfLines={1}>
            {item.hospital?.hospital_name || 'None'}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
            {item.status?.replace('_', ' ')}
          </Text>
        </View>
      </View>

      <View style={styles.dateRow}>
        <Text style={styles.dateText}>
          Due Date: {item.due_date ? new Date(item.due_date).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const pickerClients = clients.map(c => ({ label: c.patient_name, value: c.id }));
  const pickerHospitals = hospitals.map(h => ({ label: h.hospital_name, value: h.id }));
  const pickerDoctors = doctors.map(d => ({ label: d.doctor_name, value: d.id }));
  const pickerUsers = usersList.map(u => ({ label: u.name, value: u.id }));

  return (
    <View style={styles.container}>
      {/* Search & Clear Bar */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search task title..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchSubmit}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
          <Text style={styles.clearButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Status Filter Scroll */}
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionLabel}>Status:</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_OPTIONS}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filterScroll}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                statusFilter === item.value && styles.activeFilterChip,
              ]}
              onPress={() => setStatusFilter(item.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  statusFilter === item.value && styles.activeFilterChipText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Horizontal Priority Filter Scroll */}
      <View style={styles.filterSection}>
        <Text style={styles.filterSectionLabel}>Priority:</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={PRIORITY_OPTIONS}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filterScroll}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                priorityFilter === item.value && styles.activeFilterChip,
              ]}
              onPress={() => setPriorityFilter(item.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  priorityFilter === item.value && styles.activeFilterChipText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Tasks List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          onEndReached={loadMoreTasks}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tasks found matching criteria.</Text>
            </View>
          }
          ListFooterComponent={() =>
            loadingMore ? (
              <ActivityIndicator style={styles.footerLoader} size="small" color={COLORS.primary} />
            ) : null
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Floating Action Button (FAB) for Creating Task */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => setCreateModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* MODAL: CREATE TASK */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Task</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Text style={styles.closeModalBtn}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScrollContent} keyboardShouldPersistTaps="handled">
              {/* Task Title */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Task Title *</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="Enter task title..."
                  placeholderTextColor={COLORS.textLight}
                  value={form.title}
                  onChangeText={(val) => setForm({ ...form, title: val })}
                />
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.inputField, { height: 60, textAlignVertical: 'top' }]}
                  placeholder="Enter task details..."
                  placeholderTextColor={COLORS.textLight}
                  value={form.description}
                  onChangeText={(val) => setForm({ ...form, description: val })}
                  multiline
                />
              </View>

              {/* Client/Patient */}
              <View style={{ zIndex: 5000, width: '100%' }}>
                <CustomPicker
                  label="Client / Patient"
                  value={form.client_id}
                  items={pickerClients}
                  onValueChange={(val) => setForm({ ...form, client_id: val })}
                  placeholder="Select client..."
                />
              </View>

              {/* Hospital */}
              <View style={{ zIndex: 4000, width: '100%' }}>
                <CustomPicker
                  label="Hospital"
                  value={form.hospital_id}
                  items={pickerHospitals}
                  onValueChange={(val) => setForm({ ...form, hospital_id: val })}
                  placeholder="Select hospital..."
                />
              </View>

              {/* Doctor */}
              <View style={{ zIndex: 3000, width: '100%' }}>
                <CustomPicker
                  label="Doctor"
                  value={form.doctor_id}
                  items={pickerDoctors}
                  onValueChange={(val) => setForm({ ...form, doctor_id: val })}
                  placeholder="Select doctor..."
                />
              </View>

              {/* Assigned To */}
              <View style={{ zIndex: 2000, width: '100%' }}>
                <CustomPicker
                  label="Assign To Staff"
                  value={form.assigned_to}
                  items={pickerUsers}
                  onValueChange={(val) => setForm({ ...form, assigned_to: val })}
                  placeholder="Select staff member..."
                />
              </View>

              {/* Priority */}
              <View style={{ zIndex: 1000, width: '100%' }}>
                <CustomPicker
                  label="Priority"
                  value={form.priority}
                  items={FORM_PRIORITIES}
                  onValueChange={(val) => setForm({ ...form, priority: val })}
                  placeholder="Select priority..."
                />
              </View>

              {/* Due Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Due Date</Text>
                <TouchableOpacity
                  style={styles.datePickerBtn}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.datePickerBtnText}>
                    📅 {form.due_date.toLocaleDateString(undefined, { dateStyle: 'long' })}
                  </Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={form.due_date}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={handleDateChange}
                />
              )}

              {/* Submit Buttons */}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleCreateTaskSubmit}
                disabled={submittingTask}
                activeOpacity={0.8}
              >
                {submittingTask ? (
                  <ActivityIndicator color={COLORS.textWhite} />
                ) : (
                  <Text style={styles.submitBtnText}>Create Task</Text>
                )}
              </TouchableOpacity>

            </ScrollView>
          </View>
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
  searchBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    height: 40,
    fontSize: 14,
    color: COLORS.text,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  searchButtonText: {
    color: COLORS.textWhite,
    fontWeight: '700',
    fontSize: 13,
  },
  clearButton: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  clearButtonText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  filterSectionLabel: {
    width: 60,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterScroll: {
    gap: SPACING.xs,
    paddingRight: SPACING.lg,
  },
  filterChip: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.round,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeFilterChipText: {
    color: COLORS.textWhite,
    fontWeight: '700',
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 80, // Space for FAB
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
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  priorityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  divider: {
    height: 0.5,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  metaColumn: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  metaLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.xs,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dateRow: {
    marginTop: SPACING.sm,
    alignItems: 'flex-start',
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
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
  footerLoader: {
    marginVertical: SPACING.md,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.dark,
  },
  fabText: {
    color: COLORS.textWhite,
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: BORDER_RADIUS.md,
    borderTopRightRadius: BORDER_RADIUS.md,
    maxHeight: '90%',
    padding: SPACING.lg,
    ...SHADOWS.dark,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  closeModalBtn: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  modalScrollContent: {
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
    marginLeft: 2,
  },
  inputField: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    height: 44,
    fontSize: 14,
    color: COLORS.text,
  },
  datePickerBtn: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  datePickerBtnText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    ...SHADOWS.medium,
  },
  submitBtnText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default TasksScreen;
