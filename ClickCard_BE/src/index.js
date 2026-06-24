require('dotenv').config();
const http = require('http');
const app = require('./app');
const socket = require('./utils/socket');

const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// Initialize Socket.io
socket.init(server);

server.listen(PORT, () => {
  console.log(`🚀 ClickCard Backend server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please stop the process using that port or set a different PORT.`);
    process.exit(1);
  }
  console.error('Server error:', err);
  process.exit(1);
});
