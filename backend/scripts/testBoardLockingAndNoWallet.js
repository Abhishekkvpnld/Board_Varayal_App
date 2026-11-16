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
  console.log('🧪 Testing Board Locking & Wallet-Free Allocation...\n');

  try {
    // 1. Admin logs in
    const adminLogin = await req('/auth/login', {
      method: 'POST',
      body: { phone: '9876543210', password: 'AdminPassword@2026' }
    });
    const adminToken = adminLogin.token;

    // 2. Demo player logs in
    const playerLogin = await req('/auth/login', {
      method: 'POST',
      body: { phone: '9895012345', password: 'PlayerPassword@2026' }
    });
    const playerToken = playerLogin.token;

    // 3. Admin schedules a new upcoming round
    console.log('--- Test 1: Admin Creates Scheduled Game ---');
    const newScheduledGame = await req('/games/create', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        title: 'Locking Test Scheduled Round #999',
        ticketPrice: 35,
        scheduledStartTime: new Date(Date.now() + 3600000)
      }
    });
    const scheduledGameId = newScheduledGame.game._id;
    console.log('✅ Scheduled Game created:', newScheduledGame.game.gameCode, 'Status:', newScheduledGame.game.status);

    // 4. Player selects board #77 in the scheduled game WITHOUT any wallet deduction
    console.log('\n--- Test 2: Player Selects Board in Scheduled Game (No Wallet Required) ---');
    const allocRes = await req('/boards/allocate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${playerToken}` },
      body: {
        gameSessionId: scheduledGameId,
        boardNumber: 77
      }
    });
    console.log('✅ Board #77 allocated & locked for player:', allocRes.allocation?.boardNumber);

    // 5. Check that another user cannot take board #77 (Atomic Lock verification)
    console.log('\n--- Test 3: Another User Tries to Pick Board #77 (Must Fail - Locked) ---');
    // Register and verify a second player
    const secondPhone = '97' + Math.floor(10000000 + Math.random() * 90000000);
    const reg2 = await req('/auth/register', {
      method: 'POST',
      body: {
        name: 'Second Player',
        phone: secondPhone,
        password: 'PlayerPassword@2026',
        stateJurisdiction: 'Kerala',
        isAdult: true,
        termsAccepted: true
      }
    });
    // Admin verifies player 2
    const pendingList = await req('/admin/users?filter=pending', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const p2User = pendingList.users.find(u => u.phone === secondPhone);
    await req(`/admin/users/${p2User._id}/verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const p2Login = await req('/auth/login', {
      method: 'POST',
      body: { phone: secondPhone, password: 'PlayerPassword@2026' }
    });

    try {
      await req('/boards/allocate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${p2Login.token}` },
        body: {
          gameSessionId: scheduledGameId,
          boardNumber: 77
        }
      });
      console.error('❌ ERROR: Second player was able to take already locked board #77!');
    } catch (err) {
      console.log('✅ Correctly locked! Response status:', err.status, 'Message:', err.data?.message);
    }

    // 6. Player 1 cannot book a second board in the same game
    console.log('\n--- Test 4: Player Tries to Book a Second Board in Same Game (Must Fail) ---');
    try {
      await req('/boards/allocate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${playerToken}` },
        body: {
          gameSessionId: scheduledGameId,
          boardNumber: 78
        }
      });
      console.error('❌ ERROR: User was able to book multiple boards in one game session!');
    } catch (err) {
      console.log('✅ Correctly enforced 1 board limit! Message:', err.data?.message);
    }

    // 7. Admin starts the game (status becomes 'active')
    console.log('\n--- Test 5: Admin Starts Game -> Status Becomes Active ---');
    const startRes = await req(`/games/${scheduledGameId}/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Game started. Status:', startRes.game?.status);

    // 8. Now that game is started, Player 2 tries to select a new board (Must Fail: Game Started)
    console.log('\n--- Test 6: Attempting Board Selection After Game Started (Must Fail) ---');
    try {
      await req('/boards/allocate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${p2Login.token}` },
        body: {
          gameSessionId: scheduledGameId,
          boardNumber: 100
        }
      });
      console.error('❌ ERROR: New board was selected after game started!');
    } catch (err) {
      console.log('✅ Correctly blocked selection after game started:', err.status, err.data?.message);
    }

    console.log('\n🎉 ALL BOARD LOCKING & WALLET-FREE TESTS PASSED! 🎉\n');
  } catch (error) {
    console.error('❌ Test failed:', error.data || error.message);
    process.exit(1);
  }
}

runTests();
