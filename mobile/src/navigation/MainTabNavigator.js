import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import TasksScreen from '../screens/TasksScreen';
import TaskDetailsScreen from '../screens/TaskDetailsScreen';
import TimeTrackingScreen from '../screens/TimeTrackingScreen';
import AttendanceScreen from '../screens/AttendanceScreen';

import { COLORS } from '../utils/theme';

const Tab = createBottomTabNavigator();
const TasksStack = createNativeStackNavigator();

// Stack for Tasks so we can navigate into Task Details
const TasksNavigator = () => {
  return (
    <TasksStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.textWhite,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <TasksStack.Screen 
        name="TasksList" 
        component={TasksScreen} 
        options={{ title: 'Tasks' }}
      />
      <TasksStack.Screen 
        name="TaskDetails" 
        component={TaskDetailsScreen} 
        options={{ title: 'Task Details' }}
      />
    </TasksStack.Navigator>
  );
};

const MainTabNavigator = () => {
  const { logout } = React.useContext(AuthContext);
  const navigation = useNavigation();

  const HeaderRight = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
      <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={{ marginRight: 15 }}>
        <Text style={{ fontSize: 18 }}>🔔</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={logout}>
        <Text style={{ color: COLORS.textWhite, fontWeight: 'bold' }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.textWhite,
        headerTitleStyle: { fontWeight: 'bold' },
        headerRight: () => <HeaderRight />,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ 
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, backgroundColor: color, borderRadius: 12 }} />
          )
        }} 
      />
      <Tab.Screen 
        name="TasksTab" 
        component={TasksNavigator} 
        options={{ 
          headerShown: false, // TasksNavigator handles its own headers
          title: 'Tasks',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, backgroundColor: color, borderRadius: 4 }} />
          )
        }} 
      />
      <Tab.Screen 
        name="Time" 
        component={TimeTrackingScreen} 
        options={{ 
          title: 'Time Logs',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, backgroundColor: color, borderRadius: 12, borderWidth: 2, borderColor: 'white' }} />
          )
        }} 
      />
      <Tab.Screen 
        name="Attendance" 
        component={AttendanceScreen} 
        options={{ 
          title: 'Attendance',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, backgroundColor: color, borderRadius: 4 }} />
          )
        }} 
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
