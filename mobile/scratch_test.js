const axios = require('axios');
const BASE_URL = 'https://essaram.bvox.in/api';

async function probe() {
  try {
    console.log('Logging in...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'vishnu@voxinnov.com',
      password: 'Test@123#'
    });
    const token = loginRes.data.token;
    console.log('Login success! Token length:', token?.length);
    console.log('User Role:', loginRes.data.data?.role);
    
    const client = axios.create({
      baseURL: BASE_URL,
      headers: { Authorization: `Bearer ${token}` }
    });

    const endpoints = [
      '/clients?limit=100',
      '/hospitals?limit=100',
      '/doctors?limit=100',
      '/auth/users'
    ];

    for (const url of endpoints) {
      try {
        console.log(`\n--- Fetching ${url} ---`);
        const res = await client.get(url);
        console.log(`Status: ${res.status}`);
        console.log(`Success field: ${res.data?.success}`);
        console.log(`Data count: ${Array.isArray(res.data?.data) ? res.data.data.length : typeof res.data?.data}`);
        if (res.data?.data && res.data.data.length > 0) {
          console.log(`First item keys:`, Object.keys(res.data.data[0]));
          console.log(`First item preview:`, JSON.stringify(res.data.data[0]).substring(0, 150));
        }
      } catch (err) {
        console.log(`Failed fetching ${url}: ${err.message}`);
        if (err.response) {
          console.log(`Response status: ${err.response.status}`);
          console.log(`Response message:`, JSON.stringify(err.response.data));
        }
      }
    }
  } catch (e) {
    console.error('Probe failed:', e.message);
  }
}

probe();
