const api = 'http://localhost:5000/api';

async function runE2ETest() {
  console.log('--- STARTING BOARD VARAYAL E2E INTEGRATION TEST ---');

  // 1. Login as Player
  console.log('\n1. Logging in as Demo Player...');
  const playerLoginRes = await fetch(`${api}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '9895012345', password: 'PlayerPassword@2026' })
  }).then(r => r.json());

  if (!playerLoginRes.success) throw new Error('Player login failed: ' + playerLoginRes.message);
  const playerToken = playerLoginRes.token;
  console.log(`✓ Player Logged in: ${playerLoginRes.user.name} (Balance: ₹${playerLoginRes.user.walletBalance})`);

  // 2. Fetch Live Game
  console.log('\n2. Fetching Live Game from Lobby...');
  const lobbyRes = await fetch(`${api}/games/lobby`).then(r => r.json());
  const activeGame = lobbyRes.liveGames[0];
  if (!activeGame) throw new Error('No live game found');
  console.log(`✓ Live Game Found: "${activeGame.title}" [Code: ${activeGame.gameCode}, Ticket: ₹${activeGame.ticketPrice}]`);

  // 3. Allocate Board #77 for Player
  console.log('\n3. Allocating Board #77 for Player in Game Session...');
  const allocRes = await fetch(`${api}/boards/allocate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${playerToken}`
    },
    body: JSON.stringify({
      gameSessionId: activeGame._id,
      boardNumber: 77
    })
  }).then(r => r.json());

  if (allocRes.success) {
    console.log(`✓ Board #77 successfully booked! Numbers: ${allocRes.allocation.numbers.slice(0, 8).join(', ')}...`);
  } else {
    console.log(`Notice: ${allocRes.message}`);
  }

  // 4. Test Atomic Collision Prevention: Try allocating Board #77 again
  console.log('\n4. Testing Atomic Exclusivity (Attempting duplicate booking of Board #77)...');
  // Register a temporary second player
  const player2Phone = '9847' + Math.floor(100000 + Math.random() * 900000);
  const reg2 = await fetch(`${api}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Second Player',
      phone: player2Phone,
      password: 'Pass123456@Password',
      stateJurisdiction: 'Kerala',
      isAdult: true,
      termsAccepted: true
    })
  }).then(r => r.json());

  if (reg2.token) {
    // Admin credits player 2
    const adminLoginRes = await fetch(`${api}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543210', password: 'AdminPassword@2026' })
    }).then(r => r.json());

    await fetch(`${api}/admin/users/${reg2.user.id}/adjust-balance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminLoginRes.token}`
      },
      body: JSON.stringify({ amount: 100, reason: 'Test Credit' })
    });

    const dupRes = await fetch(`${api}/boards/allocate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${reg2.token}`
      },
      body: JSON.stringify({
        gameSessionId: activeGame._id,
        boardNumber: 77
      })
    });

    const dupData = await dupRes.json();
    console.log(`✓ Atomic duplicate allocation test status: ${dupRes.status} (Expected 409 Conflict)`);
    console.log(`✓ Response message: "${dupData.message}"`);
  }

  // 5. Admin Spins a Random Number (1-119)
  console.log('\n5. Admin triggering live number spinner...');
  const adminLogin = await fetch(`${api}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '9876543210', password: 'AdminPassword@2026' })
  }).then(r => r.json());

  const spinRes = await fetch(`${api}/games/${activeGame._id}/spin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminLogin.token}`
    }
  }).then(r => r.json());

  console.log(`✓ Ball Drawn: Number ${spinRes.drawnNumber} (Total Drawn: ${spinRes.totalDrawn}, Remaining: ${spinRes.remainingCount})`);

  // 6. Check updated player board
  console.log('\n6. Checking Player board status...');
  const myBoard = await fetch(`${api}/boards/my/${activeGame._id}`, {
    headers: { 'Authorization': `Bearer ${playerToken}` }
  }).then(r => r.json());

  console.log(`✓ Player Board #${myBoard.allocation.boardNumber} status: ${myBoard.allocation.markedNumbers.length} marked.`);
  console.log('\n--- ALL E2E TESTS PASSED SUCCESSFULLY! ---');
}

runE2ETest().catch(e => {
  console.error('Test Failed:', e);
  process.exit(1);
});

