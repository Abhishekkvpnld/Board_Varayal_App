# Board Varayal (ബോർഡ് വരയൽ) - Real-time 4×4 Board Game & Live 1–119 Spinner Platform

A modern, production-oriented, responsive web application for Kerala's traditional **Board Varayal** (Board Varakkal) game built using the **MERN Stack** (React + Vite, Tailwind CSS, Node.js, Express.js, MongoDB, Socket.IO).

---

## 🌟 Core Features & Modules

### 1. Unique 4×4 Board Generation (2,000 Verified Boards)
- Generates and persists exactly **2,000 unique 4×4 boards** containing 16 random, non-repeating numbers in range **1 to 119**.
- Each board stores a canonical hash of its sorted 16 numbers with a MongoDB unique index, mathematically guaranteeing zero duplicate combinations across the catalog.
- Interactive board inspector and selector with real-time availability filters.

### 2. Atomic Board Allocation & Concurrency Protection
- Paid users select available boards per game session.
- **Atomic MongoDB compound index** on `{ gameSessionId: 1, boardNumber: 1 }` prevents race conditions and physically blocks duplicate allocations (returns `409 Conflict`).
- Instant wallet deduction and real-time room broadcast when a board is claimed.

### 3. Live Number Spinner (1–119) & Socket.IO Broadcasting
- Cryptographically secure RNG on backend (`crypto.randomInt`) selecting non-repeating numbers from remaining available balls (1–119).
- Live ball drawing animation with audio synthesizer, Web Audio FX, and speech voice announcements (*"Number 47!"*).
- Full 1–119 numbers board matrix viewable at any time to inspect drawn vs remaining balls.
- Real-time Socket.IO room events: `NUMBER_DRAWN`, `MY_BOARD_UPDATED`, `GAME_STATUS_CHANGED`, `AUTO_SPIN_STATUS`, `PAYMENT_VERIFIED`.

### 4. Automatic Varayal Strikethrough & Winner Detection
- Backend automatically checks all allocated player cards upon each drawn ball.
- Highlights matching numbers with the traditional glowing crossed-out **Varayal (വരയൽ)** ribbon effect.
- Instant automated evaluation of configurable winning rules:
  - **Early Five (Fast 5)**: First 5 numbers marked
  - **Four Corners**: Top-Left, Top-Right, Bottom-Left, Bottom-Right
  - **Center Square (Inner 4)**: Core 2×2 cells
  - **Horizontal Lines**: Rows 1 through 4
  - **Diagonals**: Main and Anti diagonals
  - **Full House**: All 16 numbers marked
- Automatic wallet crediting for winners, celebratory sound fanfare, and confetti bursts.

### 5. Payment Integration & Admin Verification Workflow
- Deposit workflow with UPI ID (`varayal.games@upi`) and dynamic QR simulation.
- 12-digit Banking UTR / Transaction Reference verification with duplicate prevention.
- Admin verification queue: 1-click **Approve & Credit** or **Reject** with memo.
- Live socket notification to user upon payment approval.

### 6. Admin Control Console & Analytics
- Comprehensive KPI cards: Total Users, Live Games, Master Boards, Total Revenue, Pending UPI, Prizes Paid.
- Live Game Control: Create, schedule, start, pause, resume, manual spin ball, or automated timed spinner (3s–10s intervals).
- User Management: Search, view balances, manual balance adjustments (credit/debit), account activation/suspension.
- Audit Trail: Immutable logging of administrative and game actions.

### 7. Indian Gaming & Payment Compliance
- **18+ Age Verification**: Mandatory confirmation before registration.
- **State Jurisdiction Enforcement**: Blocks registrations from legally restricted regions (*Andhra Pradesh, Assam, Nagaland, Odisha, Sikkim, Telangana*).
- **Audit Trails**: Full transparency for numbers drawn, prize disbursals, and payment verification.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB (running on `mongodb://127.0.0.1:27018` or configured in `.env`)

### Start MongoDB
```bash
mongod --dbpath .\data\db --port 27018 --bind_ip 127.0.0.1
```

### Start Server
```bash
cd backend
npm install
node src/server.js
```
The server will automatically generate and seed the 2,000 unique boards, default admin, demo player, and active game sessions.

### Access Application
Open your browser to:
👉 **`http://localhost:5000`**

---

## 🔑 Default Credentials

| Role | Phone | Password | Starting Balance |
| :--- | :--- | :--- | :--- |
| **Master Admin** | `9876543210` | `AdminPassword@2026` | ₹25,000 |
| **Demo Player** | `9895012345` | `PlayerPassword@2026` | ₹500 |

*(Both accounts are pre-seeded and accessible via 1-click login buttons on the `/login` page).*

---

## 📁 Project Architecture

```
Board_Varayal/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB & Environment Config
│   │   ├── controllers/     # Auth, Board, Game, Payment, Admin Controllers
│   │   ├── middleware/      # JWT Protect, Admin Role, Compliance
│   │   ├── models/          # User, Board, GameSession, Allocation, Payment, Audit
│   │   ├── routes/          # Express REST Routes
│   │   ├── services/        # BoardGenerator, WinnerDetection, Spinner, Socket
│   │   ├── utils/           # Compliance definitions & Indian State lists
│   │   └── server.js        # Express + Socket.IO Server & SPA Static Host
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client with JWT interceptor
│   │   ├── components/      # Navbar, SpinnerWheel, BoardView, PaymentModal, etc.
│   │   ├── context/         # AuthContext & SocketContext
│   │   ├── pages/           # Landing, Lobby, Arena, Dashboard, Admin, HowToPlay
│   │   ├── utils/           # Web Audio API Sound & Speech Synthesis
│   │   ├── App.jsx          # React Router & Theme Layout
│   │   └── main.jsx         # TanStack Query & Root Mount
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

