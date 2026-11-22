import app from './app.js';
import { env } from './config/env.js';
import { testConnection } from './config/db.js';

async function startServer() {
  // Test DB connection before listening
  const dbStatus = await testConnection();
  if (dbStatus.connected) {
    console.log(`[Database] MySQL connection established successfully (${env.DB.HOST}:${env.DB.PORT}/${env.DB.NAME})`);
  } else {
    console.warn(`[Database] Warning: MySQL connection failed at startup:`, dbStatus.error);
    console.warn(`[Database] Server will start, but database operations will fail until resolved.`);
  }

  const server = app.listen(env.PORT, () => {
    console.log(`[UniMate Core Backend] Server is running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    console.log(`[UniMate Core Backend] Health endpoint: http://localhost:${env.PORT}/api/v1/health`);
  });

  // Graceful shutdown handling
  const gracefulShutdown = (signal) => {
    console.log(`\n[UniMate Core Backend] Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('[UniMate Core Backend] HTTP server closed.');
      process.exit(0);
    });

    // Force exit after 10s timeout
    setTimeout(() => {
      console.error('[UniMate Core Backend] Forcefully shutting down due to timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

startServer();
