import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { RPCS3Service } from '../services/rpcs3.service';
import { RPCS3TrophyService } from '../services/rpcs3-trophy.service';

const router = Router();
const rpcs3Service = new RPCS3Service();
const trophyService = new RPCS3TrophyService();

// GET /api/rpcs3/playtimes - Get all RPCS3 playtimes
router.get('/playtimes', async (req: Request, res: Response) => {
  try {
    if (!rpcs3Service.fileExists()) {
      res.status(404).json({
        success: false,
        error: `RPCS3 games.yml not found at: ${rpcs3Service.getConfigPath()}. Make sure RPCS3 is installed and has been run at least once.`
      });
      return;
    }

    const playtimes = rpcs3Service.getAllPlaytimes();

    res.json({
      success: true,
      data: playtimes
    });
  } catch (error: any) {
    console.error('Error reading RPCS3 playtimes:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to read RPCS3 playtimes'
    });
  }
});

// GET /api/rpcs3/trophies - Get all RPCS3 trophy sets
router.get('/trophies', async (req: Request, res: Response) => {
  try {
    if (!trophyService.trophyDirExists()) {
      res.status(404).json({
        success: false,
        error: `RPCS3 trophy directory not found at: ${trophyService.getTrophyPath()}. Make sure RPCS3 has been run and trophies have been earned.`
      });
      return;
    }

    console.log('📁 Reading RPCS3 trophies...');
    const trophySets = await trophyService.getAllTrophySets();
    console.log(`✅ Found ${trophySets.length} trophy sets`);

    res.json({
      success: true,
      data: trophySets
    });
  } catch (error: any) {
    console.error('Error reading RPCS3 trophies:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to read RPCS3 trophies'
    });
  }
});

// POST /api/rpcs3/sync - Sync RPCS3 playtimes to database
router.post('/sync', async (req: Request, res: Response) => {
  try {
    const { userId, configPath } = req.body;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'userId is required'
      });
      return;
    }

    // Allow custom path if provided
    if (configPath) {
      rpcs3Service.setConfigPath(configPath);
    }

    console.log(`🎮 Checking RPCS3 games file...`);
    console.log(`📁 Looking at: ${rpcs3Service.getConfigPath()}/games.yml`);

    if (!rpcs3Service.fileExists()) {
      console.error(`❌ File not found at: ${rpcs3Service.getConfigPath()}/games.yml`);
      res.status(404).json({
        success: false,
        error: `RPCS3 games.yml not found at: ${rpcs3Service.getConfigPath()}/games.yml. Make sure RPCS3 has been run at least once.`
      });
      return;
    }

    console.log(`✅ File exists!`);
    console.log(`🎮 Syncing RPCS3 playtimes for user ${userId}...`);

    const rpcs3Playtimes = rpcs3Service.getAllPlaytimes();
    console.log(`📊 Found ${rpcs3Playtimes.length} PS3 games in RPCS3`);

    if (rpcs3Playtimes.length === 0) {
      res.json({
        success: true,
        summary: {
          total: 0,
          updated: 0,
          notFound: 0
        }
      });
      return;
    }

    let updated = 0;
    let notFound = 0;

    for (const entry of rpcs3Playtimes) {
      // Try to find matching game by serial or name
      const game = await prisma.libraryGame.findFirst({
        where: {
          userId,
          platform: 'ps3',
          OR: [
            {
              platformData: {
                path: ['serial'],
                equals: entry.serial
              }
            },
            {
              platformData: {
                path: ['titleId'],
                equals: entry.titleId
              }
            },
            {
              name: {
                contains: entry.gameName
              }
            }
          ]
        }
      });

      if (game) {
        // Update playtime (convert seconds to minutes for consistency)
        const playtimeMinutes = Math.round(entry.playtimeSeconds / 60);
        
        await prisma.libraryGame.update({
          where: { id: game.id },
          data: {
            playtimeForever: playtimeMinutes,
            platformData: {
              ...(game.platformData as any),
              serial: entry.serial,
              titleId: entry.titleId,
              lastPlayedRPCS3: entry.lastPlayed
            }
          }
        });

        console.log(`✅ Updated ${game.name}: ${playtimeMinutes} minutes`);
        updated++;
      } else {
        console.log(`⚠️ No matching game found for: ${entry.gameName} (${entry.serial})`);
        notFound++;
      }
    }

    console.log(`✅ Playtime sync complete: ${updated} updated, ${notFound} not found`);

    res.json({
      success: true,
      summary: {
        total: rpcs3Playtimes.length,
        updated,
        notFound
      }
    });
  } catch (error: any) {
    console.error('❌ Error syncing RPCS3 playtimes:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to sync RPCS3 playtimes'
    });
  }
});

// POST /api/rpcs3/sync-trophies - Sync RPCS3 trophies to database
router.post('/sync-trophies', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'userId is required'
      });
      return;
    }

    console.log(`🏆 Syncing RPCS3 trophies for user ${userId}...`);

    if (!trophyService.trophyDirExists()) {
      console.log('⚠️ Trophy directory not found - no trophies to sync');
      res.json({
        success: true,
        summary: {
          total: 0,
          updated: 0,
          notFound: 0
        }
      });
      return;
    }

    const trophySets = await trophyService.getAllTrophySets();
    console.log(`📊 Found ${trophySets.length} trophy sets`);

    let updated = 0;
    let notFound = 0;

    for (const trophySet of trophySets) {
      // Find matching game by NP Comm ID or game name
      const game = await prisma.libraryGame.findFirst({
        where: {
          userId,
          platform: 'ps3',
          OR: [
            {
              platformData: {
                path: ['npCommId'],
                equals: trophySet.npCommId
              }
            },
            {
              name: {
                contains: trophySet.gameName
              }
            }
          ]
        }
      });

      if (game) {
        // Update with trophy data
        await prisma.libraryGame.update({
          where: { id: game.id },
          data: {
            totalAchievements: trophySet.totalTrophies,
            completedAchievements: trophySet.unlockedTrophies,
            achievementPercentage: trophySet.completionPercent,
            platformData: {
              ...(game.platformData as any),
              npCommId: trophySet.npCommId,
              trophies: {
                bronze: trophySet.bronze,
                silver: trophySet.silver,
                gold: trophySet.gold,
                platinum: trophySet.platinum
              },
              trophyList: trophySet.trophies
            }
          }
        });

        console.log(`✅ Updated ${game.name}: ${trophySet.unlockedTrophies}/${trophySet.totalTrophies} trophies (${trophySet.completionPercent}%)`);
        updated++;
      } else {
        console.log(`⚠️ No matching game found for: ${trophySet.gameName} (${trophySet.npCommId})`);
        notFound++;
      }
    }

    console.log(`✅ Trophy sync complete: ${updated} updated, ${notFound} not found`);

    res.json({
      success: true,
      summary: {
        total: trophySets.length,
        updated,
        notFound
      }
    });
  } catch (error: any) {
    console.error('❌ Error syncing RPCS3 trophies:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to sync RPCS3 trophies'
    });
  }
});

export default router;