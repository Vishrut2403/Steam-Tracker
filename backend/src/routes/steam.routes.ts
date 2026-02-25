import { Router, Request, Response } from 'express';
import steamService from '../services/steam.service';
import prisma from '../prisma';

const router = Router();

// Helper: Auto-calculate tier from rating
const getTierFromRating = (rating: number | null): string | null => {
  if (!rating) return null;
  const tierMap: { [key: number]: string } = {
    5: 'S',
    4: 'A',
    3: 'B',
    2: 'C',
    1: 'D',
  };
  return tierMap[rating] || null;
};

// Fetch library from Steam API and save to DB 
router.get('/library/:steamId', async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId as string;

    if (!steamId) {
      res.status(400).json({ error: 'Steam ID is required' });
      return;
    }

    const library = await steamService.getUserLibrary(steamId);
    await steamService.saveLibrary(steamId, library);

    res.json({
      success: true,
      count: library.length,
      games: library
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch Steam library',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get enriched library from DB 
router.get('/library/:steamId/enriched', async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId as string;

    if (!steamId) {
      res.status(400).json({ error: 'Steam ID is required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { steamId },
      include: {
        libraryGames: {
          orderBy: [
            { status: 'asc' },
            { playtimeForever: 'desc' }
          ]
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found. Fetch library first.' });
      return;
    }

    res.json({
      success: true,
      count: user.libraryGames.length,
      games: user.libraryGames,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch enriched library',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update price paid 
router.patch('/library/:steamId/game/:appId/price', async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId as string;
    const appId = req.params.appId as string;
    const { pricePaid } = req.body;

    if (!steamId || !appId) {
      res.status(400).json({ error: 'Steam ID and App ID are required' });
      return;
    }

    if (typeof pricePaid !== 'number' || pricePaid < 0) {
      res.status(400).json({ error: 'Valid price is required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { steamId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const game = await prisma.libraryGame.findUnique({
      where: { userId_appId: { userId: user.id, appId: String(appId) } },
    });

    if (!game) {
      res.status(404).json({ error: 'Game not found in library' });
      return;
    }

    const hours = game.playtimeForever / 60;
    const pricePerHour = hours > 0 ? pricePaid / hours : 0;

    const updated = await prisma.libraryGame.update({
      where: { userId_appId: { userId: user.id, appId: String(appId) } },
      data: { pricePaid, pricePerHour },
    });

    res.json({ success: true, game: updated });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update price',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update game status 
router.patch('/library/:steamId/game/:appId/status', async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId as string;
    const appId = req.params.appId as string;
    const { status } = req.body;

    const validStatuses = ['playing', 'completed', 'backlog', 'unplayed'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { steamId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updateData: any = { status };
    
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    const updated = await prisma.libraryGame.update({
      where: { userId_appId: { userId: user.id, appId: String(appId) } },
      data: updateData,
    });

    res.json({ success: true, game: updated });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update game rating
router.patch('/library/:steamId/game/:appId/rating', async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId as string;
    const appId = req.params.appId as string;
    const { rating } = req.body;

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { steamId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const tier = getTierFromRating(rating);

    const updated = await prisma.libraryGame.update({
      where: { userId_appId: { userId: user.id, appId: String(appId) } },
      data: { rating, tier },
    });

    res.json({ success: true, game: updated });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update rating',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update user tags for a game 
router.patch('/library/:steamId/game/:appId/tags', async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId as string;
    const appId = req.params.appId as string;
    const { tags } = req.body;

    if (!Array.isArray(tags)) {
      res.status(400).json({ error: 'Tags must be an array' });
      return;
    }

    const validTags = tags.every(
      (tag: any) => 
        typeof tag === 'string' && 
        tag.length > 0 && 
        tag.length <= 20 &&
        /^[a-zA-Z0-9\s-]+$/.test(tag)
    );

    if (!validTags) {
      res.status(400).json({ error: 'Invalid tags format' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { steamId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updated = await prisma.libraryGame.update({
      where: { userId_appId: { userId: user.id, appId: String(appId) } },
      data: { userTags: tags },
    });

    res.json({ success: true, game: updated });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update tags',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update game review
router.patch('/library/:steamId/game/:appId/review', async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId as string;
    const appId = req.params.appId as string;
    const { review } = req.body;

    if (typeof review !== 'string') {
      res.status(400).json({ error: 'Review must be a string' });
      return;
    }

    if (review.length > 2000) {
      res.status(400).json({ error: 'Review too long (max 2000 characters)' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { steamId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updated = await prisma.libraryGame.update({
      where: { userId_appId: { userId: user.id, appId: String(appId) } },
      data: { review },
    });

    res.json({ success: true, game: updated });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update review',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Fetch wishlist 
router.get('/wishlist/:steamId', async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId as string;

    if (!steamId) {
      res.status(400).json({ error: 'Steam ID is required' });
      return;
    }

    const wishlist = await steamService.getEnrichedWishlist(steamId);
    await steamService.saveWishlist(steamId, wishlist);

    res.json({
      success: true,
      count: wishlist.length,
      games: wishlist
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch wishlist',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get player info
router.get('/player/:steamId', async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId as string;

    if (!steamId) {
      res.status(400).json({ error: 'Steam ID is required' });
      return;
    }

    const player = await steamService.getPlayerSummary(steamId);

    res.json({
      success: true,
      player
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch player information',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;