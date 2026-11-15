let ioInstance = null;

function initSocket(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    // console.log(`[Socket] Connected: ${socket.id}`);

    // Join game room
    socket.on('join_game', ({ gameId, userId }) => {
      if (gameId) {
        socket.join(`game:${gameId}`);
        // console.log(`[Socket] User ${userId || 'guest'} joined room: game:${gameId}`);
      }
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    // Leave game room
    socket.on('leave_game', ({ gameId }) => {
      if (gameId) {
        socket.leave(`game:${gameId}`);
      }
    });

    // Join admin channel
    socket.on('join_admin', ({ adminToken }) => {
      socket.join('admin_channel');
    });

    socket.on('disconnect', () => {
      // console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });
}

function getIO() {
  return ioInstance;
}

function broadcastToGame(gameId, event, payload) {
  if (ioInstance) {
    ioInstance.to(`game:${gameId}`).emit(event, payload);
  }
}

function sendToUser(userId, event, payload) {
  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit(event, payload);
  }
}

function broadcastToAdmin(event, payload) {
  if (ioInstance) {
    ioInstance.to('admin_channel').emit(event, payload);
  }
}

function broadcastGlobal(event, payload) {
  if (ioInstance) {
    ioInstance.emit(event, payload);
  }
}

module.exports = {
  initSocket,
  getIO,
  broadcastToGame,
  sendToUser,
  broadcastToAdmin,
  broadcastGlobal
};

