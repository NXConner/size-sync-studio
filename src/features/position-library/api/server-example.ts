// Example Express.js server implementation for Position Library API
// This is a reference implementation showing how to set up the backend

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Initialize Express app
const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Validation schemas
const createAchievementSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(50),
  type: z.string().min(1).max(50),
  description: z.string().optional(),
  requirements: z.array(z.string()),
  rewards: z.array(z.string()),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  isPublic: z.boolean()
});

const updatePreferencesSchema = z.object({
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  categories: z.array(z.string()).optional(),
  mood: z.enum(['romantic', 'playful', 'intimate', 'passionate']).optional(),
  duration: z.number().min(1).max(300).optional(),
  intensity: z.enum(['low', 'medium', 'high']).optional(),
  customTags: z.array(z.string()).optional(),
  privacy: z.enum(['private', 'public']).optional()
});

// Achievement Routes
app.get('/api/v1/achievements', async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = category ? { category: String(category) } : {};
    
    const [achievements, total] = await Promise.all([
      prisma.achievement.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.achievement.count({ where })
    ]);

    res.json({
      success: true,
      data: achievements,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch achievements'
    });
  }
});

app.get('/api/v1/achievements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const achievement = await prisma.achievement.findUnique({
      where: { id }
    });

    if (!achievement) {
      return res.status(404).json({
        success: false,
        error: 'Achievement not found'
      });
    }

    res.json({
      success: true,
      data: achievement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch achievement'
    });
  }
});

app.post('/api/v1/achievements', async (req, res) => {
  try {
    const validatedData = createAchievementSchema.parse(req.body);
    
    const achievement = await prisma.achievement.create({
      data: {
        ...validatedData,
        id: crypto.randomUUID()
      }
    });

    res.status(201).json({
      success: true,
      data: achievement
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create achievement'
    });
  }
});

app.put('/api/v1/achievements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const achievement = await prisma.achievement.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: achievement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update achievement'
    });
  }
});

app.delete('/api/v1/achievements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.achievement.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Achievement deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete achievement'
    });
  }
});

app.post('/api/v1/achievements/:id/unlock', async (req, res) => {
  try {
    const { id } = req.params;
    
    const achievement = await prisma.achievement.update({
      where: { id },
      data: {
        unlockedAt: new Date(),
        status: 'unlocked'
      }
    });

    res.json({
      success: true,
      data: achievement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to unlock achievement'
    });
  }
});

// Personalization Routes
app.get('/api/v1/personalization/preferences', async (req, res) => {
  try {
    // In a real app, you'd get the user ID from authentication
    const userId = req.headers['x-user-id'] as string;
    
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId }
    });

    res.json({
      success: true,
      data: preferences || {
        difficulty: 'beginner',
        categories: [],
        mood: 'romantic',
        duration: 15,
        intensity: 'medium',
        customTags: [],
        privacy: 'private'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch preferences'
    });
  }
});

app.put('/api/v1/personalization/preferences', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const validatedData = updatePreferencesSchema.parse(req.body);

    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: validatedData,
      create: {
        userId,
        ...validatedData
      }
    });

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update preferences'
    });
  }
});

// Analytics Routes
app.post('/api/v1/analytics/sessions', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const sessionData = req.body;

    const session = await prisma.session.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        ...sessionData
      }
    });

    // Update analytics aggregates
    await prisma.analytics.upsert({
      where: { userId },
      update: {
        totalSessions: { increment: 1 },
        totalDuration: { increment: sessionData.duration },
        totalPositions: { increment: sessionData.positions.length }
      },
      create: {
        userId,
        totalSessions: 1,
        totalDuration: sessionData.duration,
        totalPositions: sessionData.positions.length
      }
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to track session'
    });
  }
});

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString()
    }
  });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', error);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Position Library API server running on port ${PORT}`);
});

export default app;
