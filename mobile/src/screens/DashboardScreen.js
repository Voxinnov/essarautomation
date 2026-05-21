import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import api from '../services/api';
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from '../utils/theme';

const DashboardScreen = ({ navigation }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard');
      setData(response.data.data);
    } catch (e) {
      console.log('Error fetching dashboard', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Get status color mappings
  const getStatusColor = (statusName) => {
    switch (statusName.toLowerCase()) {
      case 'completed': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'in_progress':
      case 'in progress': return COLORS.info;
      case 'on_hold':
      case 'on hold': return COLORS.secondary;
      default: return COLORS.textSecondary;
    }
  };

  // Find max value in monthly counts for graph scaling
  const maxTaskCount = data?.monthlyTasks?.length 
    ? Math.max(...data.monthlyTasks.map(t => t.count), 1) 
    : 1;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      contentContainerStyle={styles.scrollContent}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome Back</Text>
        <Text style={styles.headerSubtitle}>Here is your operational snapshot</Text>
      </View>

      {/* Grid of stats */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderLeftColor: COLORS.primary, borderLeftWidth: 4 }]}>
          <Text style={styles.statLabel}>Total Tasks</Text>
          <Text style={styles.statValue}>{data?.tasks?.total || 0}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: COLORS.warning, borderLeftWidth: 4 }]}>
          <Text style={styles.statLabel}>Pending Tasks</Text>
          <Text style={styles.statValue}>{data?.tasks?.pending || 0}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: COLORS.info, borderLeftWidth: 4 }]}>
          <Text style={styles.statLabel}>In Progress</Text>
          <Text style={styles.statValue}>{data?.tasks?.inProgress || 0}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: COLORS.success, borderLeftWidth: 4 }]}>
          <Text style={styles.statLabel}>Completed</Text>
          <Text style={styles.statValue}>{data?.tasks?.completed || 0}</Text>
        </View>
      </View>

      {/* Financial & Entity summaries */}
      <View style={styles.row}>
        <View style={[styles.summaryBox, { flex: 1.2 }]}>
          <Text style={styles.sectionTitle}>Billing Info</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Billing</Text>
            <Text style={styles.summaryValue}>₹{data?.billing?.total || '0.00'}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Received</Text>
            <Text style={[styles.summaryValue, { color: COLORS.success }]}>₹{data?.billing?.paid || '0.00'}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Pending</Text>
            <Text style={[styles.summaryValue, { color: COLORS.warning }]}>₹{data?.billing?.pending || '0.00'}</Text>
          </View>
        </View>

        <View style={[styles.summaryBox, { flex: 1 }]}>
          <Text style={styles.sectionTitle}>Expenses</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>This Month</Text>
            <Text style={[styles.summaryValue, { color: COLORS.error }]}>₹{data?.expenses?.monthly || '0.00'}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValue}>₹{data?.expenses?.total || '0.00'}</Text>
          </View>
        </View>
      </View>

      {/* Task Distribution (custom visual progress bars) */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Task Status Distribution</Text>
        {data?.taskStatusData?.map((item) => {
          const totalVal = data?.tasks?.total || 1;
          const percentage = Math.round((item.value / totalVal) * 100) || 0;
          return (
            <View key={item.name} style={styles.progressBarContainer}>
              <View style={styles.progressBarHeader}>
                <Text style={styles.progressBarLabel}>{item.name}</Text>
                <Text style={styles.progressBarValue}>{item.value} ({percentage}%)</Text>
              </View>
              <View style={styles.progressTrack}>
                <View 
                  style={[
                    styles.progressFill, 
                    { backgroundColor: item.color || getStatusColor(item.name), width: `${percentage}%` }
                  ]} 
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Monthly Task Trend (custom bar chart) */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Monthly Task Volume</Text>
        <View style={styles.chartContainer}>
          {data?.monthlyTasks?.map((item) => {
            const barHeight = Math.max((item.count / maxTaskCount) * 100, 5); // at least 5% height
            return (
              <View key={item.month} style={styles.chartBarWrapper}>
                <Text style={styles.chartBarCount}>{item.count}</Text>
                <View style={styles.chartBarTrack}>
                  <View style={[styles.chartBarFill, { height: `${barHeight}%` }]} />
                </View>
                <Text style={styles.chartBarLabel}>{item.month}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Recent Tasks List */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Recent Tasks</Text>
        {data?.recentTasks && data.recentTasks.length > 0 ? (
          data.recentTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskListItem}
              activeOpacity={0.7}
              onPress={() => {
                navigation.navigate('TasksTab', {
                  screen: 'TaskDetails',
                  params: { taskId: task.id, taskTitle: task.title }
                });
              }}
            >
              <View style={styles.taskListText}>
                <Text style={styles.taskListTitle} numberOfLines={1}>{task.title}</Text>
                <Text style={styles.taskListAssignee}>Assigned to: {task.assignee?.name || 'Unassigned'}</Text>
              </View>
              <View 
                style={[
                  styles.statusChip, 
                  { backgroundColor: getStatusColor(task.status) + '15' }
                ]}
              >
                <Text style={[styles.statusChipText, { color: getStatusColor(task.status) }]}>
                  {task.status?.replace('_', ' ')}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent tasks</Text>
        )}
      </View>

      {/* Employee work hours */}
      <View style={[styles.sectionCard, { marginBottom: SPACING.xxl }]}>
        <Text style={styles.sectionTitle}>Employee Logged Hours</Text>
        {data?.employeeHours && data.employeeHours.length > 0 ? (
          data.employeeHours.map((item) => {
            const name = item.user?.name || 'Unknown';
            const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            return (
              <View key={item.user_id || name} style={styles.employeeRow}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <Text style={styles.employeeName}>{name}</Text>
                <View style={styles.hoursBadge}>
                  <Text style={styles.hoursText}>{parseFloat(item.total_hours).toFixed(1)} hrs</Text>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>No hours logged yet</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statCard: {
    backgroundColor: COLORS.card,
    width: '48%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  summaryBox: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    ...SHADOWS.light,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
    paddingVertical: SPACING.xs,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.light,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  progressBarContainer: {
    marginBottom: SPACING.md,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  progressBarLabel: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  progressBarValue: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  progressTrack: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.xs,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
    paddingTop: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chartBarWrapper: {
    alignItems: 'center',
    width: '15%',
  },
  chartBarCount: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  chartBarTrack: {
    height: 100,
    width: 14,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.xs,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBarFill: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xs,
    width: '100%',
  },
  chartBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  taskListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  taskListText: {
    flex: 1,
    marginRight: SPACING.md,
  },
  taskListTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  taskListAssignee: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  employeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  employeeName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  hoursBadge: {
    backgroundColor: COLORS.primaryTint,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  hoursText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    paddingVertical: SPACING.md,
    fontStyle: 'italic',
  },
});

export default DashboardScreen;
