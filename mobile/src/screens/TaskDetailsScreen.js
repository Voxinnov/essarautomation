import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { locationService } from '../services/locationService';
import CustomPicker from '../components/CustomPicker';
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from '../utils/theme';

const TaskDetailsScreen = ({ route, navigation }) => {
  const { taskId, taskTitle } = route.params || {};
  const { user } = useContext(AuthContext);

  // States
  const [task, setTask] = useState(null);
  const [workUpdates, setWorkUpdates] = useState([]);
  const [remarks, setRemarks] = useState([]);
  const [taskProducts, setTaskProducts] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [productsCatalog, setProductsCatalog] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('updates'); // 'updates', 'remarks', 'products'
  
  // Footer input state
  const [newRemarkText, setNewRemarkText] = useState('');
  const [submittingFooter, setSubmittingFooter] = useState(false);

  // Modals state
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    size: '',
    model: '',
    update_date: new Date().toISOString().split('T')[0],
    update_note: '',
  });
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  const [productModalVisible, setProductModalVisible] = useState(false);
  const [productForm, setProductForm] = useState({
    product_id: '',
    quantity_required: '1',
  });
  const [submittingProduct, setSubmittingProduct] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: taskTitle || 'Task Details' });
    if (taskId) {
      fetchAllData();
    }
  }, [taskId]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [taskRes, updatesRes, remarksRes, productsRes, statusesRes, catalogRes] = await Promise.all([
        api.get(`/tasks/${taskId}`),
        api.get(`/work-updates/task/${taskId}`),
        api.get(`/remarks/task/${taskId}`),
        api.get(`/tasks/${taskId}/products`),
        api.get('/statuses/').catch(() => ({ data: { data: [] } })),
        api.get('/stock/products').catch(() => ({ data: { data: [] } })),
      ]);

      setTask(taskRes.data.data);
      setWorkUpdates(updatesRes.data.data || []);
      setRemarks(remarksRes.data.data || []);
      setTaskProducts(productsRes.data.data || []);
      setStatuses(statusesRes.data.data || []);
      setProductsCatalog(catalogRes.data.data || []);
    } catch (e) {
      console.log('Error fetching task details', e);
      Alert.alert('Error', 'Failed to load task details.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, { ...task, status: newStatus });
      setTask(response.data.data);
      Alert.alert('Success', `Status updated to ${newStatus.replace('_', ' ')}`);
    } catch (e) {
      console.log('Error updating status', e);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handlePostFooterRemark = async () => {
    if (!newRemarkText.trim()) return;
    setSubmittingFooter(true);

    // Staff policy: Add to work updates automatically with live staff location tracking
    if (user?.role === 'staff') {
      try {
        // 1. Get GPS coordinates & address
        const locationData = await locationService.getCurrentLocation();
        
        // 2. Post to work-updates
        await api.post('/work-updates', {
          task_id: taskId,
          update_note: newRemarkText.trim(),
          update_date: new Date().toISOString().split('T')[0],
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          location_address: locationData.location_address,
        });

        setNewRemarkText('');
        // Refresh updates
        const updatesRes = await api.get(`/work-updates/task/${taskId}`);
        setWorkUpdates(updatesRes.data.data || []);
        Alert.alert('Success', 'Work update logged with location tracking.');
      } catch (err) {
        console.log('Error posting staff work update', err);
        Alert.alert('Error', 'Failed to post staff work update.');
      } finally {
        setSubmittingFooter(false);
      }
      return;
    }

    // Standard Direct Remark (Admins/Managers)
    try {
      const res = await api.post('/remarks', {
        task_id: taskId,
        remark: newRemarkText.trim(),
      });
      setRemarks([res.data.data, ...remarks]);
      setNewRemarkText('');
    } catch (err) {
      console.log('Error posting remark', err);
      Alert.alert('Error', 'Failed to add remark.');
    } finally {
      setSubmittingFooter(false);
    }
  };

  const handleAddWorkUpdate = async () => {
    if (!updateForm.update_note.trim()) {
      Alert.alert('Validation', 'Please enter an update note');
      return;
    }
    setSubmittingUpdate(true);

    try {
      // 1. Fetch GPS location
      const locationData = await locationService.getCurrentLocation();

      // 2. Submit work update
      await api.post('/work-updates', {
        task_id: taskId,
        size: updateForm.size,
        model: updateForm.model,
        update_date: updateForm.update_date,
        update_note: updateForm.update_note.trim(),
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        location_address: locationData.location_address,
      });

      // 3. Clear & Close Modal
      setUpdateForm({
        size: '',
        model: '',
        update_date: new Date().toISOString().split('T')[0],
        update_note: '',
      });
      setUpdateModalVisible(false);

      // 4. Refresh Updates
      const updatesRes = await api.get(`/work-updates/task/${taskId}`);
      setWorkUpdates(updatesRes.data.data || []);
      Alert.alert('Success', 'Work update successfully saved with GPS tracking.');
    } catch (e) {
      console.log('Failed to add work update', e);
      Alert.alert('Error', 'Failed to add work update.');
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const handleRequestProduct = async () => {
    if (!productForm.product_id) {
      Alert.alert('Validation', 'Please select a product');
      return;
    }
    const qty = parseInt(productForm.quantity_required);
    if (isNaN(qty) || qty < 1) {
      Alert.alert('Validation', 'Quantity must be 1 or more');
      return;
    }
    setSubmittingProduct(true);

    try {
      await api.post(`/tasks/${taskId}/products`, {
        product_id: productForm.product_id,
        quantity_required: qty,
      });

      setProductForm({ product_id: '', quantity_required: '1' });
      setProductModalVisible(false);

      // Refresh Products List
      const productsRes = await api.get(`/tasks/${taskId}/products`);
      setTaskProducts(productsRes.data.data || []);
      Alert.alert('Success', 'Product request submitted.');
    } catch (e) {
      console.log('Failed request product', e);
      Alert.alert('Error', 'Failed to request product.');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteRemark = async (remarkId) => {
    Alert.alert('Confirm Delete', 'Delete this remark?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/remarks/${remarkId}`);
            setRemarks(remarks.filter((r) => r.id !== remarkId));
          } catch (e) {
            Alert.alert('Error', 'Failed to delete remark');
          }
        },
      },
    ]);
  };

  // Color Helper for Badges
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Format Status Picker Options
  const pickerStatuses = statuses.length > 0 
    ? statuses.map(s => ({ label: s.label, value: s.name })) 
    : [
        { label: 'Pending', value: 'pending' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'On Hold', value: 'on_hold' },
      ];

  // Format Catalog options
  const pickerProducts = productsCatalog.map(p => ({
    label: `${p.name} (In Stock: ${p.current_stock})`,
    value: p.id
  }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        {/* Core Task Details Card */}
        <View style={styles.taskCard}>
          <View style={styles.taskCardHeader}>
            <Text style={styles.taskTitle}>{task?.title}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task?.priority) + '15' }]}>
              <Text style={[styles.priorityBadgeText, { color: getPriorityColor(task?.priority) }]}>
                {task?.priority}
              </Text>
            </View>
          </View>

          {task?.description ? (
            <Text style={styles.taskDesc}>{task.description}</Text>
          ) : (
            <Text style={[styles.taskDesc, { fontStyle: 'italic', color: COLORS.textLight }]}>
              No description provided.
            </Text>
          )}

          <View style={styles.divider} />

          {/* Quick status selector */}
          <View style={styles.statusSelectRow}>
            <Text style={styles.statusLabel}>Change Status:</Text>
            <View style={{ flex: 1, maxWidth: 160 }}>
              <CustomPicker
                value={task?.status}
                items={pickerStatuses}
                onValueChange={(val) => val && handleStatusUpdate(val)}
                placeholder="Status..."
              />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Grid Meta Information */}
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Client/Patient</Text>
              <Text style={styles.metaValue}>{task?.client?.patient_name || '-'}</Text>
              {task?.client?.phone && <Text style={styles.metaSubvalue}>{task.client.phone}</Text>}
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Hospital</Text>
              <Text style={styles.metaValue}>{task?.hospital?.hospital_name || '-'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Doctor</Text>
              <Text style={styles.metaValue}>{task?.doctor?.doctor_name || '-'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Assigned To</Text>
              <Text style={styles.metaValue}>{task?.assignee?.name || 'Unassigned'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Due Date</Text>
              <Text style={[styles.metaValue, { color: COLORS.error }]}>
                {task?.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Created By</Text>
              <Text style={styles.metaValue}>{task?.creator?.name || '-'}</Text>
            </View>
          </View>
        </View>

        {/* Tab Headers */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'updates' && styles.activeTabButton]}
            onPress={() => setActiveTab('updates')}
          >
            <Text style={[styles.tabText, activeTab === 'updates' && styles.activeTabText]}>
              Work Updates ({workUpdates.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'remarks' && styles.activeTabButton]}
            onPress={() => setActiveTab('remarks')}
          >
            <Text style={[styles.tabText, activeTab === 'remarks' && styles.activeTabText]}>
              Remarks ({remarks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'products' && styles.activeTabButton]}
            onPress={() => setActiveTab('products')}
          >
            <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>
              Inventory ({taskProducts.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Contents */}
        <View style={styles.tabContentContainer}>
          
          {/* UPDATES TAB */}
          {activeTab === 'updates' && (
            <View>
              <View style={styles.tabActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => setUpdateModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionBtnText}>+ Add Work Update</Text>
                </TouchableOpacity>
              </View>

              {workUpdates.length === 0 ? (
                <Text style={styles.emptyText}>No work updates yet.</Text>
              ) : (
                workUpdates.map((item) => (
                  <View key={item.id} style={styles.updateCard}>
                    <View style={styles.updateRow}>
                      {item.size ? <View style={styles.specBadge}><Text style={styles.specText}>Size: {item.size}</Text></View> : null}
                      {item.model ? <View style={[styles.specBadge, { backgroundColor: COLORS.infoTint }]}><Text style={[styles.specText, { color: COLORS.info }]}>Model: {item.model}</Text></View> : null}
                      {item.update_date ? <Text style={styles.updateDateText}>{new Date(item.update_date).toLocaleDateString()}</Text> : null}
                    </View>
                    
                    {item.location_address || item.latitude ? (
                      <View style={styles.locationBadge}>
                        <Text style={styles.locationBadgeText}>📍 {item.location_address || `${item.latitude}, ${item.longitude}`}</Text>
                      </View>
                    ) : null}

                    {item.update_note ? <Text style={styles.updateNoteText}>{item.update_note}</Text> : null}
                    <Text style={styles.updateMetaText}>
                      By {item.updater?.name} — {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}

          {/* REMARKS TAB */}
          {activeTab === 'remarks' && (
            <View>
              {remarks.length === 0 ? (
                <Text style={styles.emptyText}>No remarks yet.</Text>
              ) : (
                remarks.map((item) => (
                  <View key={item.id} style={styles.remarkRow}>
                    <View style={styles.remarkAvatar}>
                      <Text style={styles.remarkAvatarText}>
                        {item.user?.name?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.remarkContent}>
                      <View style={styles.remarkHeader}>
                        <Text style={styles.remarkUser}>{item.user?.name}</Text>
                        <View style={styles.remarkTimeContainer}>
                          <Text style={styles.remarkTime}>
                            {new Date(item.created_at || item.createdAt).toLocaleDateString()} at {new Date(item.created_at || item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                          {user?.role !== 'staff' && (user?.id === item.user_id || user?.role === 'admin') && (
                            <TouchableOpacity onPress={() => handleDeleteRemark(item.id)} style={styles.deleteRemarkBtn}>
                              <Text style={styles.deleteRemarkText}>🗑️</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                      <Text style={styles.remarkBody}>{item.remark}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <View>
              <View style={styles.tabActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => setProductModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionBtnText}>+ Request Product</Text>
                </TouchableOpacity>
              </View>

              {taskProducts.length === 0 ? (
                <Text style={styles.emptyText}>No products requested for this task.</Text>
              ) : (
                <View style={styles.tableCard}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableCol, { flex: 2 }]}>Product</Text>
                    <Text style={[styles.tableCol, { textAlign: 'center' }]}>Req</Text>
                    <Text style={[styles.tableCol, { textAlign: 'center' }]}>Ful</Text>
                    <Text style={[styles.tableCol, { flex: 1.5, textAlign: 'right' }]}>Status</Text>
                  </View>
                  {taskProducts.map((tp) => (
                    <View key={tp.id} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 2, fontWeight: '600' }]} numberOfLines={1}>
                        {tp.product?.name}
                      </Text>
                      <Text style={[styles.tableCell, { textAlign: 'center' }]}>
                        {tp.quantity_required}
                      </Text>
                      <Text style={[styles.tableCell, { textAlign: 'center' }]}>
                        {tp.quantity_fulfilled}
                      </Text>
                      <View style={[styles.tableCell, { flex: 1.5, alignItems: 'flex-end' }]}>
                        <View 
                          style={[
                            styles.tableStatusBadge, 
                            { 
                              backgroundColor: 
                                tp.status === 'fulfilled' ? COLORS.successTint :
                                tp.status === 'backordered' ? COLORS.warningTint : COLORS.border
                            }
                          ]}
                        >
                          <Text 
                            style={[
                              styles.tableStatusText, 
                              { 
                                color: 
                                  tp.status === 'fulfilled' ? COLORS.success :
                                  tp.status === 'backordered' ? COLORS.warning : COLORS.textSecondary
                              }
                            ]}
                          >
                            {tp.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

        </View>
      </ScrollView>

      {/* Floating Bottom Input for Standard Remarks / Intercepted Staff Updates */}
      <View style={styles.footerInputContainer}>
        <TextInput
          style={styles.footerInput}
          placeholder={user?.role === 'staff' ? "Add note (GPS tracked update)..." : "Add remark..."}
          placeholderTextColor={COLORS.textLight}
          value={newRemarkText}
          onChangeText={setNewRemarkText}
          multiline
        />
        <TouchableOpacity
          style={[styles.footerPostBtn, !newRemarkText.trim() && styles.disabledPostBtn]}
          onPress={handlePostFooterRemark}
          disabled={!newRemarkText.trim() || submittingFooter}
        >
          {submittingFooter ? (
            <ActivityIndicator size="small" color={COLORS.textWhite} />
          ) : (
            <Text style={styles.footerPostText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* MODAL: ADD WORK UPDATE */}
      <Modal
        visible={updateModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setUpdateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Work Update</Text>
            
            <View style={styles.modalRowInputs}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalInputLabel}>Size</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. XL"
                  value={updateForm.size}
                  onChangeText={(size) => setUpdateForm({ ...updateForm, size })}
                />
              </View>
              <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                <Text style={styles.modalInputLabel}>Model</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. M-120"
                  value={updateForm.model}
                  onChangeText={(model) => setUpdateForm({ ...updateForm, model })}
                />
              </View>
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Update Date</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="YYYY-MM-DD"
                value={updateForm.update_date}
                onChangeText={(update_date) => setUpdateForm({ ...updateForm, update_date })}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Update Note</Text>
              <TextInput
                style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Enter details..."
                value={updateForm.update_note}
                onChangeText={(update_note) => setUpdateForm({ ...updateForm, update_note })}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setUpdateModalVisible(false)}
                disabled={submittingUpdate}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSaveBtn]}
                onPress={handleAddWorkUpdate}
                disabled={submittingUpdate}
              >
                {submittingUpdate ? (
                  <ActivityIndicator size="small" color={COLORS.textWhite} />
                ) : (
                  <Text style={styles.modalSaveBtnText}>Save Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: REQUEST PRODUCT */}
      <Modal
        visible={productModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setProductModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Request Product for Task</Text>

            <View style={{ zIndex: 1000, width: '100%' }}>
              <CustomPicker
                label="Select Product"
                value={productForm.product_id}
                items={pickerProducts}
                onValueChange={(val) => setProductForm({ ...productForm, product_id: val })}
                placeholder="Choose a product..."
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Quantity Required</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="number-pad"
                value={productForm.quantity_required}
                onChangeText={(quantity_required) => setProductForm({ ...productForm, quantity_required })}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setProductModalVisible(false)}
                disabled={submittingProduct}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSaveBtn]}
                onPress={handleRequestProduct}
                disabled={submittingProduct}
              >
                {submittingProduct ? (
                  <ActivityIndicator size="small" color={COLORS.textWhite} />
                ) : (
                  <Text style={styles.modalSaveBtnText}>Submit Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 100, // Extra padding to clear the footer input
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  taskCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.md,
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
  taskDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  divider: {
    height: 0.5,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  statusSelectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  metaItem: {
    width: '50%',
    marginBottom: SPACING.md,
    paddingRight: SPACING.sm,
  },
  metaLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  metaSubvalue: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.sm,
    padding: 4,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  tabButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.textWhite,
    fontWeight: '700',
  },
  tabContentContainer: {
    paddingBottom: 20,
  },
  tabActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: SPACING.md,
  },
  actionBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    ...SHADOWS.light,
  },
  actionBtnText: {
    color: COLORS.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    paddingVertical: SPACING.xl,
  },
  updateCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    ...SHADOWS.light,
  },
  updateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  specBadge: {
    backgroundColor: COLORS.primaryTint,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  specText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  updateDateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 'auto',
  },
  locationBadge: {
    backgroundColor: '#ffebee',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
    marginVertical: SPACING.xs,
  },
  locationBadgeText: {
    fontSize: 11,
    color: '#c62828',
    fontWeight: '600',
  },
  updateNoteText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 18,
    marginVertical: SPACING.xs,
  },
  updateMetaText: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  remarkRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.light,
  },
  remarkAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  remarkAvatarText: {
    color: COLORS.textWhite,
    fontWeight: '700',
    fontSize: 14,
  },
  remarkContent: {
    flex: 1,
  },
  remarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  remarkUser: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  remarkTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  remarkTime: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  deleteRemarkBtn: {
    padding: 2,
  },
  deleteRemarkText: {
    fontSize: 12,
  },
  remarkBody: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 17,
  },
  tableCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    ...SHADOWS.light,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.border,
    padding: SPACING.sm,
  },
  tableCol: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 13,
    color: COLORS.text,
    flex: 1,
  },
  tableStatusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  tableStatusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  footerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    maxHeight: 80,
    marginRight: SPACING.sm,
    fontSize: 14,
    color: COLORS.text,
  },
  footerPostBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledPostBtn: {
    opacity: 0.6,
  },
  footerPostText: {
    color: COLORS.textWhite,
    fontWeight: '700',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    ...SHADOWS.dark,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  modalRowInputs: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  modalInputGroup: {
    marginBottom: SPACING.sm,
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  modalBtn: {
    paddingHorizontal: SPACING.md,
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
});

export default TaskDetailsScreen;
