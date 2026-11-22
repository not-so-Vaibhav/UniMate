import { testConnection } from '../config/db.js';
import { env } from '../config/env.js';

export async function getHealth(req, res, next) {
  try {
    const dbStatus = await testConnection();

    // Check AI Service connectivity (non-blocking fallback)
    let aiStatus = { type: 'FastAPI', status: 'standby_or_offline' };
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const aiRes = await fetch(`${env.AI_SERVICE.URL}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        aiStatus = {
          type: 'FastAPI',
          status: aiData.status || 'connected',
          service: aiData.service || 'UniMate AI Service',
          version: aiData.version || '1.0.0',
        };
      }
    } catch {
      // AI service is not running or timed out; remains standby in Phase 1
      aiStatus = { type: 'FastAPI', status: 'standby_or_offline' };
    }

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
      aiService: aiStatus,
    });
  } catch (error) {
    next(error);
  }
}
