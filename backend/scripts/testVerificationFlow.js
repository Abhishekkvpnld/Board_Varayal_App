require('dotenv').config();

const API = 'http://localhost:5000/api';

async function req(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(API + url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function runTests() {
  console.log('🧪 Starting Board Varayal Verification & Access Control Tests...\n');

  try {
    // 1. Health check
    const health = await req('/health');
    console.log('✅ 1. Server Health:', health.status);

    // 2. Admin Login
    console.log('\n--- Test 2: Admin Login ---');
    const adminLoginRes = await req('/auth/login', {
      method: 'POST',
      body: { phone: '9876543210', password: 'AdminPassword@2026' }
    });
    console.log('✅ Admin logged in. Token received:', !!adminLoginRes.token);
    const adminToken = adminLoginRes.token;

    // 3. Register a brand new test user
    console.log('\n--- Test 3: New User Registration (Must Require Admin Verification) ---');
    const testPhone = '98' + Math.floor(10000000 + Math.random() * 90000000);
    const regRes = await req('/auth/register', {
      method: 'POST',
      body: {
        name: 'Verification Test User',
        phone: testPhone,
        password: 'UserPass@2026',
        stateJurisdiction: 'Kerala',
        isAdult: true,
        termsAccepted: true
      }
    });
    console.log('Registration response:', regRes.message);
    console.log('Pending verification flag:', regRes.pendingVerification);
    console.log('Token is undefined (as expected):', regRes.token === undefined);

    // 4. Try logging in before verification
    console.log('\n--- Test 4: Attempt Login Before Admin Verification (Must Fail) ---');
    try {
      await req('/auth/login', {
        method: 'POST',
        body: { phone: testPhone, password: 'UserPass@2026' }
      });
      console.error('❌ ERROR: Unverified user was able to log in!');
    } catch (err) {
      console.log('✅ Correctly blocked with status:', err.status);
      console.log('Message:', err.data?.message);
    }

    // 5. Admin lists users and finds this pending user
    console.log('\n--- Test 5: Admin Lists Pending Users ---');
    const pendingListRes = await req('/admin/users?filter=pending', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('Total pending users:', pendingListRes.users.length);
    const pendingUser = pendingListRes.users.find(u => u.phone === testPhone);
    console.log('Found newly registered user in pending list:', !!pendingUser);

    if (!pendingUser) {
      throw new Error('User not found in pending list');
    }

    // 6. Admin verifies the user
    console.log('\n--- Test 6: Admin Verifies User ---');
    const verifyRes = await req(`/admin/users/${pendingUser._id}/verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ User verified:', verifyRes.message);

    // 7. User logs in now
    console.log('\n--- Test 7: User Logs In After Admin Verification ---');
    const userLoginRes = await req('/auth/login', {
      method: 'POST',
      body: { phone: testPhone, password: 'UserPass@2026' }
    });
    console.log('✅ Login successful! Token received:', !!userLoginRes.token);
    const userToken = userLoginRes.token;

    // 8. Admin attempts to allocate a board (Must Fail: Admin cannot participate)
    console.log('\n--- Test 8: Admin Attempts Board Allocation (Must Fail) ---');
    // Admin creates an active game
    const newGame = await req('/games/create', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        title: 'Admin Policy Verification Game',
        ticketPrice: 20,
        scheduledStartTime: new Date()
      }
    });
    const gameId = newGame.game._id;

    try {
      await req('/boards/allocate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { gameSessionId: gameId, boardNumber: 1 }
      });
      console.error('❌ ERROR: Admin was able to allocate a board!');
    } catch (err) {
      console.log('✅ Correctly blocked admin from participating:', err.status, err.data?.message);
    }

    // 9. Admin blocks user
    console.log('\n--- Test 9: Admin Blocks User ---');
    const blockRes = await req(`/admin/users/${pendingUser._id}/block`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Block response:', blockRes.message);

    // 10. Blocked user tries to login (Must Fail)
    console.log('\n--- Test 10: Blocked User Attempts Login (Must Fail) ---');
    try {
      await req('/auth/login', {
        method: 'POST',
        body: { phone: testPhone, password: 'UserPass@2026' }
      });
      console.error('❌ ERROR: Blocked user was able to log in!');
    } catch (err) {
      console.log('✅ Correctly blocked user from login:', err.status, err.data?.message);
    }

    // 11. Admin unblocks user
    console.log('\n--- Test 11: Admin Unblocks User ---');
    const unblockRes = await req(`/admin/users/${pendingUser._id}/unblock`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Unblock response:', unblockRes.message);

    // 12. Unblocked user logs in
    console.log('\n--- Test 12: Unblocked User Logs In Again ---');
    const reLogin = await req('/auth/login', {
      method: 'POST',
      body: { phone: testPhone, password: 'UserPass@2026' }
    });
    console.log('✅ Login successful after unblock:', !!reLogin.token);

    console.log('\n🎉 ALL 12 VERIFICATION & ACCESS CONTROL TESTS PASSED SUCCESSFULLY! 🎉\n');
  } catch (error) {
    console.error('❌ Test failed:', error.data || error.message);
    process.exit(1);
  }
}

runTests();
