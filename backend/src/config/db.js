const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/board_varayal');
    console.log(`[MongoDB] Connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Error] ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

