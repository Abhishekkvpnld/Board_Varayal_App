require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');

const path = require('path');
const connectDB = require('./config/db');
const { initSocket } = require('./services/socketService');
const { generate2000UniqueBoards } = require('./services/boardGeneratorService');
const User = require('./models/User');
const GameSession = require('./models/GameSession');

// Import routes
const authRoutes = require('./routes/authRoutes');
const boardRoutes = require('./routes/boardRoutes');
const gameRoutes = require('./routes/gameRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
initSocket(io);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'Board Varayal Platform',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Serve Static Frontend Assets
const distPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(distPath));

// For SPA routing, serve index.html on unknown non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Seed default data if necessary
// async function seedInitialData() {
//   try {
//     // 1. Ensure 2,000 unique 4x4 boards exist
//     console.log('[Init] Checking 2,000 unique master boards...');
//     await generate2000UniqueBoards(false);

//     // 2. Ensure default admin account exists
//     const adminExists = await User.findOne({ role: 'admin' });
//     if (!adminExists) {
//       console.log('[Init] Creating default administrator account...');
//       await User.create({
//         name: 'Master Admin',
//         phone: '9876543210',
//         password: 'AdminPassword@2026',
//         role: 'admin',
//         walletBalance: 25000,
//         isAdult: true,
//         stateJurisdiction: 'Kerala',
//         termsAccepted: true,
//         isVerified: true,
//         isBlocked: false
//       });
//       console.log('[Init] Default Admin created (Phone: 9876543210 / Password: AdminPassword@2026)');
//     }

//     // 3. Ensure a live demo user exists for immediate evaluation
//     const demoUser = await User.findOne({ phone: '9895012345' });
//     if (!demoUser) {
//       await User.create({
//         name: 'Rahul Varma',
//         phone: '9895012345',
//         password: 'PlayerPassword@2026',
//         role: 'user',
//         walletBalance: 500,
//         isAdult: true,
//         stateJurisdiction: 'Kerala',
//         termsAccepted: true,
//         isVerified: true,
//         isBlocked: false
//       });
//       console.log('[Init] Demo Player created (Phone: 9895012345 / Password: PlayerPassword@2026)');
//     }

//     // 4. Ensure an active and upcoming game session exists
//     const existingActiveGame = await GameSession.findOne({ gameCode: 'BV-LIVE' });
//     if (!existingActiveGame) {
//       console.log('[Init] Creating default Game Sessions...');
//       const admin = await User.findOne({ role: 'admin' });

//       // Create Active Live Game
//       await GameSession.create({
//         title: 'Kerala Mega Varayal Live #101',
//         gameCode: 'BV-LIVE',
//         description: 'Thrilling 4x4 Board Varayal live event with ₹1,000 total prize pool!',
//         status: 'active',
//         ticketPrice: 25,
//         scheduledStartTime: new Date(),
//         actualStartTime: new Date(),
//         drawnNumbers: [],
//         remainingNumbers: Array.from({ length: 119 }, (_, i) => i + 1),
//         createdBy: admin ? admin._id : null
//       });

//       // Create Scheduled Game
//       const inOneHour = new Date(Date.now() + 60 * 60 * 1000);
//       await GameSession.create({
//         title: 'Night Star Jackpot Varayal #102',
//         gameCode: 'BV-NIGHT',
//         description: 'Super jackpot round tonight with bumper Full House prizes.',
//         status: 'scheduled',
//         ticketPrice: 50,
//         scheduledStartTime: inOneHour,
//         createdBy: admin ? admin._id : null
//       });
//       console.log('[Init] Game Sessions initialized.');
//     }
//   } catch (err) {
//     console.error('[Init Error]', err);
//   }
// }

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  // await seedInitialData();
  server.listen(PORT, () => {
    console.log(`[Board Varayal Server] Running on PORT: ${PORT}`);
  });
});
