import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { MinecraftService } from '../services/minecraft.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();
const minecraftService = new MinecraftService();

router.use(authMiddleware);

router.get('/instances', async (req: AuthRequest, res: Response) => {
  try {
    
    const instances = await minecraftService.getInstances();
    
    res.json({ instances });
  } catch (error) {
    console.error('Error in /instances:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Minecraft instances',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/add', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { worldPath, worldName, instanceName } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!worldPath || !worldName) {
      return res.status(400).json({ error: 'Missing worldPath or worldName' });
    }

    const gameData = await minecraftService.syncMinecraftData(
      userId,
      worldPath,
      worldName,
      instanceName
    );

    const existing = await prisma.libraryGame.findUnique({
      where: {
        userId_platformGameId_platform: {
          userId,
          platformGameId: gameData.platformGameId,
          platform: 'minecraft'
        }
      }
    });

    if (existing) {
      
      const updated = await prisma.libraryGame.update({
        where: {
          userId_platformGameId_platform: {
            userId,
            platformGameId: gameData.platformGameId,
            platform: 'minecraft'
          }
        },
        data: {
          name: gameData.name,
          playtimeForever: gameData.playtimeForever,
          imageUrl: gameData.imageUrl,
          achievementsTotal: gameData.achievementsTotal,
          achievementsEarned: gameData.achievementsEarned,
          platformData: gameData.platformData,
        }
      });

      return res.json({ game: updated, updated: true });
    }

    const game = await prisma.libraryGame.create({
      data: {
        userId,
        platform: 'minecraft',
        platformGameId: gameData.platformGameId,
        name: gameData.name,
        playtimeForever: gameData.playtimeForever,
        imageUrl: gameData.imageUrl,
        achievementsTotal: gameData.achievementsTotal,
        achievementsEarned: gameData.achievementsEarned,
        status: 'playing',
        platformData: gameData.platformData,
      }
    });

    res.json({ game });
  } catch (error) {
    console.error('Error in /add:', error);
    res.status(500).json({ 
      error: 'Failed to add Minecraft world',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/sync/:platformGameId', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const platformGameIdParam = req.params.platformGameId;
    const platformGameId = Array.isArray(platformGameIdParam) 
      ? platformGameIdParam[0] 
      : platformGameIdParam;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!platformGameId) {
      return res.status(400).json({ error: 'Missing platformGameId' });
    }

    const game = await prisma.libraryGame.findUnique({
      where: {
        userId_platformGameId_platform: {
          userId,
          platformGameId,
          platform: 'minecraft'
        }
      }
    });

    if (!game) {
      return res.status(404).json({ error: 'Minecraft world not found in library' });
    }

    const worldPath = (game.platformData as any)?.worldPath;
    const worldName = (game.platformData as any)?.worldName;
    const instanceName = (game.platformData as any)?.instanceName;

    if (!worldPath) {
      return res.status(400).json({ error: 'World path not found in game data' });
    }

    const gameData = await minecraftService.syncMinecraftData(
      userId,
      worldPath,
      worldName || game.name.replace('Minecraft - ', ''),
      instanceName
    );

    const updated = await prisma.libraryGame.update({
      where: {
        userId_platformGameId_platform: {
          userId,
          platformGameId,
          platform: 'minecraft'
        }
      },
      data: {
        playtimeForever: gameData.playtimeForever,
        achievementsTotal: gameData.achievementsTotal,
        achievementsEarned: gameData.achievementsEarned,
        platformData: gameData.platformData,
      }
    });

    res.json({ game: updated });
  } catch (error) {
    console.error('Error in /sync:', error);
    res.status(500).json({ 
      error: 'Failed to sync Minecraft world',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;  