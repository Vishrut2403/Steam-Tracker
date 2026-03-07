import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { MinecraftService } from '../services/minecraft.service';

const router = Router();
const minecraftService = new MinecraftService();

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

router.post('/games/manual', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      platform,
      platformGameId,
      name,
      playtimeForever,
      pricePaid,
      status,
      rating,
      review,
      userTags,
      platformData,
    } = req.body;

    if (!userId || !platform || !platformGameId || !name) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const validPlatforms = ['apple_gc', 'minecraft', 'retroachievements', 'ps2', 'ps3', 'steam', 'manual'];
    if (!validPlatforms.includes(platform)) {
      res.status(400).json({ error: 'Invalid platform' });
      return;
    }

    const tier = rating ? getTierFromRating(rating) : null;
    const hours = playtimeForever / 60;
    const pricePerHour = pricePaid && hours > 0 ? pricePaid / hours : null;

    const game = await prisma.libraryGame.create({
      data: {
        userId,
        platform,
        platformGameId,
        name,
        playtimeForever: playtimeForever || 0,
        pricePaid: pricePaid || null,
        pricePerHour,
        status: status || 'unplayed',
        rating: rating || null,
        tier,
        review: review || null,
        userTags: userTags || [],
        platformData: platformData || null,
      },
    });

    res.json({ success: true, game });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to add game',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update game by platform
router.patch('/games/:platform/:platformGameId', async (req: Request, res: Response) => {
  try {
    const platform = Array.isArray(req.params.platform) ? req.params.platform[0] : req.params.platform;
    const platformGameId = Array.isArray(req.params.platformGameId) ? req.params.platformGameId[0] : req.params.platformGameId;
    const { userId, ...updateData } = req.body;

    if (!platform || !platformGameId) {
      res.status(400).json({ error: 'platform and platformGameId are required' });
      return;
    }

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ error: 'userId is required' });
      return;
    }

    if (updateData.rating) {
      updateData.tier = getTierFromRating(updateData.rating);
    }

    if (updateData.pricePaid !== undefined || updateData.playtimeForever !== undefined) {
      const game = await prisma.libraryGame.findUnique({
        where: {
          userId_platform_platformGameId: {
            userId: userId,
            platform: platform,
            platformGameId: platformGameId,
          },
        },
      });

      if (game) {
        const newPlaytime = updateData.playtimeForever ?? game.playtimeForever;
        const newPrice = updateData.pricePaid ?? game.pricePaid;
        const hours = newPlaytime / 60;
        updateData.pricePerHour = newPrice && hours > 0 ? newPrice / hours : null;
      }
    }

    const updated = await prisma.libraryGame.update({
      where: {
        userId_platform_platformGameId: {
          userId: userId,
          platform: platform,
          platformGameId: platformGameId,
        },
      },
      data: updateData,
    });

    res.json({ success: true, game: updated });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update game',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.delete('/games/:platform/:platformGameId', async (req: Request, res: Response) => {
  try {
    const platform = Array.isArray(req.params.platform) ? req.params.platform[0] : req.params.platform;
    const platformGameId = Array.isArray(req.params.platformGameId) ? req.params.platformGameId[0] : req.params.platformGameId;
    const { userId } = req.body;

    if (!platform || !platformGameId) {
      res.status(400).json({ error: 'platform and platformGameId are required' });
      return;
    }

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ error: 'userId is required' });
      return;
    }

    await prisma.libraryGame.delete({
      where: {
        userId_platform_platformGameId: {
          userId: userId,
          platform: platform,
          platformGameId: platformGameId,
        },
      },
    });

    res.json({ success: true, message: 'Game deleted' });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete game',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.patch('/games/:platform/:platformGameId/image', async (req: Request, res: Response) => {
  try {
    const platform = Array.isArray(req.params.platform) ? req.params.platform[0] : req.params.platform;
    const platformGameId = Array.isArray(req.params.platformGameId) ? req.params.platformGameId[0] : req.params.platformGameId;
    const { userId, headerImage } = req.body;

    if (!platform || !platformGameId) {
      res.status(400).json({ error: 'platform and platformGameId are required' });
      return;
    }

    if (!userId || typeof userId !== 'string' || !headerImage || typeof headerImage !== 'string') {
      res.status(400).json({ error: 'userId and headerImage are required' });
      return;
    }

    if (!headerImage.startsWith('http://') && !headerImage.startsWith('https://')) {
      res.status(400).json({ error: 'Image URL must be a valid HTTP/HTTPS URL' });
      return;
    }

    const updated = await prisma.libraryGame.update({
      where: {
        userId_platform_platformGameId: {
          userId: userId,
          platform: platform,
          platformGameId: platformGameId,
        },
      },
      data: { headerImage },
    });

    res.json({ success: true, game: updated });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update image',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get Minecraft instances from Prism Launcher
router.get('/minecraft/instances', async (req: Request, res: Response) => {
  try {
    const instances = await minecraftService.getInstances();
    res.json({ success: true, instances });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to load Minecraft instances',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/minecraft/sync', async (req: Request, res: Response) => {
  try {
    const { userId, worldPath, worldName, instanceName } = req.body;

    if (!userId || !worldPath || !worldName) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const gameData = await minecraftService.syncMinecraftData(
      userId,
      worldPath,
      worldName,
      instanceName
    );

    const game = await prisma.libraryGame.upsert({
      where: {
        userId_platform_platformGameId: {
          userId,
          platform: 'minecraft',
          platformGameId: gameData.platformGameId,
        },
      },
      create: gameData,
      update: {
        playtimeForever: gameData.playtimeForever,
        totalAchievements: gameData.totalAchievements,
        completedAchievements: gameData.completedAchievements,
        achievementPercentage: gameData.achievementPercentage,
        minecraftStats: gameData.minecraftStats,
        platformData: gameData.platformData,
      },
    });

    res.json({ success: true, game });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to sync Minecraft world',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;