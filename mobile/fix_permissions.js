const axios = require('axios');
const BASE_URL = 'https://essaram.bvox.in/api';

async function fixStaffPermissions() {
  try {
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@office.com',
      password: 'admin123'
    });
    const token = loginRes.data.token;
    console.log('   Login success! Token length:', token?.length);

    const headers = { Authorization: `Bearer ${token}` };

    // Step 2: Get all roles
    console.log('2. Fetching roles...');
    const rolesRes = await axios.get(`${BASE_URL}/roles`, { headers });
    const roles = rolesRes.data.data || rolesRes.data;
    console.log('   Found roles:', roles.map(r => `${r.name} (id:${r.id})`).join(', '));

    // Step 3: Find staff role
    const staffRole = roles.find(r => r.name.toLowerCase() === 'staff');
    if (!staffRole) {
      console.error('   ERROR: Staff role not found!');
      return;
    }
    console.log('3. Staff role found. ID:', staffRole.id);
    console.log('   Current permissions:', JSON.stringify(staffRole.permissions));

    // Step 4: Add missing permissions
    const currentPerms = staffRole.permissions || [];
    const newPerms = [
      'dashboard_view',
      'tasks_view', 'tasks_create', 'tasks_edit',
      'clients_view',
      'hospitals_view',
      'doctors_view',
      'work_updates_view', 'work_updates_create',
      'time_tracking_view'
    ];

    console.log('4. Updating staff permissions to:', JSON.stringify(newPerms));
    const updateRes = await axios.put(`${BASE_URL}/roles/${staffRole.id}`, {
      permissions: newPerms
    }, { headers });

    console.log('   Update response:', JSON.stringify(updateRes.data));
    console.log('\n✅ Staff role updated successfully! Staff can now create tasks and view clients/hospitals/doctors.');

  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.status, JSON.stringify(error.response.data));
    } else {
      console.error('Error:', error.message);
    }
  }
}

fixStaffPermissions();
