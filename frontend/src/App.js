import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './utils/theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import TasksPage from './pages/tasks/TasksPage';
import TaskDetailPage from './pages/tasks/TaskDetailPage';
import ClientsPage from './pages/clients/ClientsPage';
import HospitalsPage from './pages/hospitals/HospitalsPage';
import DoctorsPage from './pages/doctors/DoctorsPage';
import WorkUpdatesPage from './pages/workupdates/WorkUpdatesPage';
import TimeTrackingPage from './pages/time/TimeTrackingPage';
import BillingPage from './pages/billing/BillingPage';
import ExpensesPage from './pages/expenses/ExpensesPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/reports/SettingsPage';
import StockPage from './pages/stock/StockPage';
import ProformaPage from './pages/proforma/ProformaPage';
import UsersPage from './pages/admin/UsersPage';
import RolesPage from './pages/admin/RolesPage';
import StatusManagementPage from './pages/settings/StatusManagementPage';
import BankAccountsPage from './pages/settings/BankAccountsPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? <DashboardLayout>{children}</DashboardLayout> : <Navigate to="/login" replace />;
};

const PermissionRoute = ({ children, permissionKey, adminOnly = false }) => {
  const { user, loading, hasPermission } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') {
      // Alert access violation softly but prevent component mount
      alert("Access Denied: Super Admin privileges required.");
      return <Navigate to="/dashboard" replace />;
  }
  if (permissionKey && !hasPermission(permissionKey)) {
      alert(`Access Denied: You do not have permission to access this module (${permissionKey}).`);
      return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><PermissionRoute permissionKey="dashboard_view"><DashboardPage /></PermissionRoute></PrivateRoute>} />
            <Route path="/tasks" element={<PrivateRoute><PermissionRoute permissionKey="tasks_view"><TasksPage /></PermissionRoute></PrivateRoute>} />
            <Route path="/tasks/:id" element={<PrivateRoute><PermissionRoute permissionKey="tasks_view"><TaskDetailPage /></PermissionRoute></PrivateRoute>} />
            <Route path="/clients" element={<PrivateRoute><PermissionRoute permissionKey="clients_view"><ClientsPage /></PermissionRoute></PrivateRoute>} />
            <Route path="/hospitals" element={<PrivateRoute><PermissionRoute permissionKey="hospitals_view"><HospitalsPage /></PermissionRoute></PrivateRoute>} />
            <Route path="/doctors" element={<PrivateRoute><PermissionRoute permissionKey="doctors_view"><DoctorsPage /></PermissionRoute></PrivateRoute>} />
            <Route path="/work-updates" element={<PrivateRoute><PermissionRoute permissionKey="work_updates_view"><WorkUpdatesPage /></PermissionRoute></PrivateRoute>} />
            <Route path="/time-tracking" element={<PrivateRoute><PermissionRoute permissionKey="time_tracking_view"><TimeTrackingPage /></PermissionRoute></PrivateRoute>} />
            <Route path="/billing" element={<PrivateRoute><PermissionRoute permissionKey="billing_view"><BillingPage /></PermissionRoute></PrivateRoute>} />
            <Route path="/proforma" element={<PrivateRoute><PermissionRoute permissionKey="proforma_view"><ProformaPage /></PermissionRoute></PrivateRoute>} />
            <Route path="/expenses" element={<PrivateRoute><PermissionRoute permissionKey="expenses_view"><ExpensesPage /></PermissionRoute></PrivateRoute>} />
            <Route path="/stock" element={<PrivateRoute><PermissionRoute permissionKey="stock_view"><StockPage /></PermissionRoute></PrivateRoute>} />
            <Route path="/reports" element={<PrivateRoute><PermissionRoute permissionKey="reports_view"><ReportsPage /></PermissionRoute></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><PermissionRoute permissionKey="settings_view"><SettingsPage /></PermissionRoute></PrivateRoute>} />
            <Route path="/settings/status" element={<PrivateRoute><PermissionRoute adminOnly><StatusManagementPage /></PermissionRoute></PrivateRoute>} />
            <Route path="/settings/bank-accounts" element={<PrivateRoute><PermissionRoute adminOnly><BankAccountsPage /></PermissionRoute></PrivateRoute>} />
            <Route path="/users" element={<PrivateRoute><PermissionRoute permissionKey="users_manage"><UsersPage /></PermissionRoute></PrivateRoute>} />
            <Route path="/role-management" element={<PrivateRoute><PermissionRoute permissionKey="roles_manage"><RolesPage /></PermissionRoute></PrivateRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
