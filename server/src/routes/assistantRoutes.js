import { Router } from 'express';
import pool from '../config/db.js';
import { env } from '../config/env.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = Router();

// ==========================================
// 1. CONVERSATION MANAGEMENT
// ==========================================

// GET /api/v1/assistant/conversations - List authenticated user's conversations
router.get('/conversations', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [conversations] = await pool.query(
      `SELECT c.id, c.title, c.created_at, c.updated_at,
              (SELECT m.content FROM assistant_messages m 
               WHERE m.conversation_id = c.id 
               ORDER BY m.id DESC LIMIT 1) AS last_message,
              (SELECT COUNT(*) FROM assistant_messages m 
               WHERE m.conversation_id = c.id) AS message_count
       FROM assistant_conversations c
       WHERE c.user_id = ?
       ORDER BY c.updated_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: {
        conversations,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/assistant/conversations - Start a new inquiry thread
router.post('/conversations', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;
    const conversationTitle = title && typeof title === 'string' && title.trim() 
      ? title.trim().substring(0, 100) 
      : 'New Campus Inquiry';

    const [result] = await pool.query(
      `INSERT INTO assistant_conversations (user_id, title) VALUES (?, ?)`,
      [userId, conversationTitle]
    );

    const [created] = await pool.query(
      `SELECT id, title, created_at, updated_at FROM assistant_conversations WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'New campus conversation initialized.',
      data: {
        conversation: created[0],
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/assistant/conversations/:id - Fetch conversation history with ownership validation
router.get('/conversations/:id', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const conversationId = parseInt(req.params.id, 10);

    if (isNaN(conversationId)) {
      throw ApiError.badRequest('Invalid conversation ID');
    }

    const [conversations] = await pool.query(
      `SELECT id, user_id, title, created_at, updated_at FROM assistant_conversations WHERE id = ?`,
      [conversationId]
    );

    if (conversations.length === 0) {
      throw ApiError.notFound('Conversation not found');
    }

    const conversation = conversations[0];
    if (conversation.user_id !== userId && req.user.role !== 'admin') {
      throw ApiError.forbidden('Unauthorized: You cannot access another student\'s assistant conversations');
    }

    const [messages] = await pool.query(
      `SELECT id, conversation_id, sender, content, sources, created_at 
       FROM assistant_messages 
       WHERE conversation_id = ? 
       ORDER BY id ASC`,
      [conversationId]
    );

    // Format sources JSON if present
    const parsedMessages = messages.map((m) => {
      let parsedSources = [];
      if (m.sources) {
        try {
          parsedSources = typeof m.sources === 'string' ? JSON.parse(m.sources) : m.sources;
        } catch {
          parsedSources = [];
        }
      }
      return {
        ...m,
        sources: parsedSources,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        conversation,
        messages: parsedMessages,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/assistant/conversations/:id/messages - Send query, proxy to FastAPI, persist thread
router.post('/conversations/:id/messages', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const conversationId = parseInt(req.params.id, 10);
    const { content } = req.body;

    if (isNaN(conversationId)) {
      throw ApiError.badRequest('Invalid conversation ID');
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      throw ApiError.badRequest('Message content cannot be empty');
    }

    const cleanContent = content.trim();

    // Verify ownership
    const [conversations] = await pool.query(
      `SELECT id, user_id, title FROM assistant_conversations WHERE id = ?`,
      [conversationId]
    );

    if (conversations.length === 0) {
      throw ApiError.notFound('Conversation not found');
    }

    const conv = conversations[0];
    if (conv.user_id !== userId && req.user.role !== 'admin') {
      throw ApiError.forbidden('Unauthorized: You cannot send queries in another user\'s thread');
    }

    // 1. Insert user message
    const [userMsgResult] = await pool.query(
      `INSERT INTO assistant_messages (conversation_id, sender, content) VALUES (?, 'user', ?)`,
      [conversationId, cleanContent]
    );

    // 2. Fetch recent conversation history
    const [recentMsgs] = await pool.query(
      `SELECT sender, content FROM assistant_messages 
       WHERE conversation_id = ? AND id < ? 
       ORDER BY id DESC LIMIT 6`,
      [conversationId, userMsgResult.insertId]
    );

    const history = recentMsgs.reverse();

    // 3. Forward to FastAPI AI service
    let aiResponseData = {
      grounded: false,
      confidence: 0.0,
      answer: 'The campus AI knowledge service is temporarily unreachable. Please visit the departmental counters directly.',
      sources: [],
      suggested_followups: [],
    };

    try {
      const aiServiceUrl = `${env.AI_SERVICE.URL}/api/v1/assistant/query`;
      const response = await fetch(aiServiceUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: cleanContent,
          conversation_id: conversationId,
          history,
        }),
      });

      if (response.ok) {
        const payload = await response.json();
        if (payload?.success && payload?.data) {
          aiResponseData = payload.data;
        }
      } else {
        console.warn(`[Assistant] AI service returned status ${response.status}`);
      }
    } catch (aiErr) {
      console.error('[Assistant] Failed to communicate with FastAPI service:', aiErr.message);
    }

    // 4. Insert assistant message
    const sourcesJson = JSON.stringify(aiResponseData.sources || []);
    const [assistantMsgResult] = await pool.query(
      `INSERT INTO assistant_messages (conversation_id, sender, content, sources) VALUES (?, 'assistant', ?, ?)`,
      [conversationId, aiResponseData.answer, sourcesJson]
    );

    // 5. Update conversation timestamp & auto-update title if it's default
    let updatedTitle = conv.title;
    if (conv.title === 'New Campus Inquiry') {
      updatedTitle = cleanContent.length > 36 ? cleanContent.substring(0, 33) + '...' : cleanContent;
      await pool.query(
        `UPDATE assistant_conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [updatedTitle, conversationId]
      );
    } else {
      await pool.query(
        `UPDATE assistant_conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [conversationId]
      );
    }

    res.status(200).json({
      success: true,
      data: {
        userMessage: {
          id: userMsgResult.insertId,
          conversation_id: conversationId,
          sender: 'user',
          content: cleanContent,
          sources: [],
          created_at: new Date(),
        },
        assistantMessage: {
          id: assistantMsgResult.insertId,
          conversation_id: conversationId,
          sender: 'assistant',
          content: aiResponseData.answer,
          sources: aiResponseData.sources || [],
          grounded: aiResponseData.grounded,
          confidence: aiResponseData.confidence,
          provider_used: aiResponseData.provider_used || 'deterministic',
          model_used: aiResponseData.model_used || null,
          suggested_followups: aiResponseData.suggested_followups || [],
          created_at: new Date(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/assistant/conversations/:id - Delete conversation thread
router.delete('/conversations/:id', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const conversationId = parseInt(req.params.id, 10);

    if (isNaN(conversationId)) {
      throw ApiError.badRequest('Invalid conversation ID');
    }

    const [conversations] = await pool.query(
      `SELECT id, user_id FROM assistant_conversations WHERE id = ?`,
      [conversationId]
    );

    if (conversations.length === 0) {
      throw ApiError.notFound('Conversation not found');
    }

    if (conversations[0].user_id !== userId && req.user.role !== 'admin') {
      throw ApiError.forbidden('Unauthorized: You cannot delete another user\'s conversation');
    }

    await pool.query(`DELETE FROM assistant_conversations WHERE id = ?`, [conversationId]);

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
