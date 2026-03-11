import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SessionTrackingService {
  /**
   * Track a gaming session by calculating playtime delta
   * Call this whenever playtime is synced for a game
   */
  async trackSession(params: {
    userId: string;
    gameId: string;
    platform: string;
    newPlaytimeMinutes: number;
    oldPlaytimeMinutes: number;
    sessionDate?: Date; // Optional: date when the session occurred (defaults to today)
  }): Promise<void> {
    const { userId, gameId, platform, newPlaytimeMinutes, oldPlaytimeMinutes, sessionDate } = params;
    
    // Calculate delta (how much was played since last sync)
    const deltaMinutes = newPlaytimeMinutes - oldPlaytimeMinutes;
    
    // Only track if there's a positive delta
    if (deltaMinutes <= 0) {
      return;
    }
    
    // Use provided session date or default to today
    // Normalize date to start of day (UTC)
    let date = sessionDate ? new Date(sessionDate) : new Date();
    
    // Validate date is reasonable (between 2000 and 2100)
    const year = date.getFullYear();
    if (isNaN(year) || year < 2000 || year > 2100) {
      console.warn(`⚠️ Invalid session date detected (${date.toISOString()}), using today instead`);
      date = new Date();
    }
    
    date.setUTCHours(0, 0, 0, 0);
    
    console.log(`📊 Tracking session: ${deltaMinutes} minutes for game ${gameId} on ${date.toISOString().split('T')[0]}`);
    
    // Create or update session for the date
    await prisma.gameSession.upsert({
      where: {
        userId_gameId_date: {
          userId,
          gameId,
          date
        }
      },
      create: {
        userId,
        gameId,
        platform,
        date,
        minutes: deltaMinutes
      },
      update: {
        minutes: {
          increment: deltaMinutes
        }
      }
    });
    
    // Update lastPlayedAt on the game (use validated date)
    await prisma.libraryGame.update({
      where: { id: gameId },
      data: {
        lastPlayedAt: date
      }
    });
    
    console.log(`✅ Session tracked: ${deltaMinutes} minutes added for ${date.toISOString().split('T')[0]}`);
  }
  
  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string, options?: {
    startDate?: Date;
    endDate?: Date;
    gameId?: string;
    platform?: string;
  }) {
    const where: any = { userId };
    
    if (options?.startDate || options?.endDate) {
      where.date = {};
      if (options.startDate) where.date.gte = options.startDate;
      if (options.endDate) where.date.lte = options.endDate;
    }
    
    if (options?.gameId) {
      where.gameId = options.gameId;
    }
    
    if (options?.platform) {
      where.platform = options.platform;
    }
    
    return await prisma.gameSession.findMany({
      where,
      include: {
        game: {
          select: {
            name: true,
            platform: true,
            headerImage: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
  }
  
  /**
   * Get daily activity for heatmap
   */
  async getDailyActivity(userId: string, days: number = 365) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setUTCHours(0, 0, 0, 0);
    
    const sessions = await prisma.gameSession.findMany({
      where: {
        userId,
        date: {
          gte: startDate
        }
      },
      include: {
        game: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    // Group by date
    const activityMap = new Map<string, {
      date: string;
      hours: number;
      games: string[];
      count: number;
    }>();
    
    sessions.forEach(session => {
      const dateStr = session.date.toISOString().split('T')[0];
      const existing = activityMap.get(dateStr);
      
      if (existing) {
        existing.hours += session.minutes / 60;
        existing.games.push(session.game.name);
        existing.count++;
      } else {
        activityMap.set(dateStr, {
          date: dateStr,
          hours: session.minutes / 60,
          games: [session.game.name],
          count: 1
        });
      }
    });
    
    return Array.from(activityMap.values());
  }
  
  /**
   * Get total playtime for a date range
   */
  async getTotalPlaytime(userId: string, startDate: Date, endDate: Date) {
    const result = await prisma.gameSession.aggregate({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        minutes: true
      }
    });
    
    return result._sum.minutes || 0;
  }
}

export const sessionTrackingService = new SessionTrackingService();