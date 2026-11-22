import { testConnection } from '../config/db.js';
import { env } from '../config/env.js';

export async function getHealth(req, res, next) {
  try {
    const dbStatus = await testConnection();

    const isHealthy = dbStatus.connected;
    const statusCode = isHealthy ? 200 : 503;

    res.status(statusCode).json({
      success: isHealthy,
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'UniMate Core Backend',
      version: '1.0.0',
      uptimeSeconds: Math.floor(process.uptime()),
      environment: env.NODE_ENV,
      database: {
        type: 'MySQL',
        status: dbStatus.connected ? 'connected' : 'disconnected',
        ...(dbStatus.error && { error: dbStatus.error }),
      },
    });
  } catch (error) {
    next(error);
  }
}
