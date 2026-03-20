import fs from 'fs';
import path from 'path';
import os from 'os';
import { parse as parseIni } from 'ini';
import AdmZip from 'adm-zip';

interface MinecraftInstance {
  name: string;
  path: string;
  lastPlayed: Date | null;
  worlds: MinecraftWorld[];
}

interface MinecraftWorld {
  name: string;
  path: string;
  playtime: number;
  instanceName: string;
}

interface MinecraftStats {
  playtime: number;
  achievements: any;
  rawStats: any;
}

export class MinecraftService {
  private prismLauncherPath: string;

  constructor() {
    const homeDir = os.homedir();
    
    this.prismLauncherPath = path.join(homeDir, '.local', 'share', 'PrismLauncher', 'instances');
    
    if (process.env.PRISM_LAUNCHER_PATH) {
      const customPath = process.env.PRISM_LAUNCHER_PATH.trim();
      if (customPath && customPath.length > 0 && !customPath.includes('=')) {
        this.prismLauncherPath = customPath;
      }
    }
  }

  async getInstances(): Promise<MinecraftInstance[]> {
    try {

      if (!fs.existsSync(this.prismLauncherPath)) {
        return [];
      }

      const items = fs.readdirSync(this.prismLauncherPath);
      
      if (items.length === 0) {
        console.warn('Directory is empty - no instances created yet');
        return [];
      }

      const instances: MinecraftInstance[] = [];

      for (const item of items) {
        const itemPath = path.join(this.prismLauncherPath, item);
        
        const stats = fs.statSync(itemPath);
        if (!stats.isDirectory()) {
          continue;
        }

        const dotMinecraftPath = path.join(itemPath, '.minecraft');
        const minecraftPath = path.join(itemPath, 'minecraft');
        
        const hasDotMinecraft = fs.existsSync(dotMinecraftPath);
        const hasMinecraft = fs.existsSync(minecraftPath);
        
        if (!hasDotMinecraft && !hasMinecraft) {
          continue;
        }

        const configPath = path.join(itemPath, 'instance.cfg');
        let instanceName = item;
        let lastPlayedTime: Date | null = null;

        if (fs.existsSync(configPath)) {
          try {
            const configContent = fs.readFileSync(configPath, 'utf-8');
            const config = parseIni(configContent);
            
            if (config.General?.name) {
              instanceName = config.General.name;
            }
            
            if (config.General?.lastLaunchTime) {
              lastPlayedTime = new Date(parseInt(config.General.lastLaunchTime));
            }
          } catch (err) {
            console.warn('Could not parse config:', err);
          }
        }

        const worlds = await this.getWorldsForInstance(itemPath, instanceName);

        instances.push({
          name: instanceName,
          path: itemPath,
          lastPlayed: lastPlayedTime,
          worlds,
        });
      }

      return instances;
      
    } catch (err) {
      console.error('❌ Error reading instances:', err);
      return [];
    }
  }

  private async getWorldsForInstance(instancePath: string, instanceName: string): Promise<MinecraftWorld[]> {
    const possiblePaths = [
      path.join(instancePath, '.minecraft', 'saves'),
      path.join(instancePath, 'minecraft', 'saves'),  
    ];

    let savesPath: string | null = null;
    
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        savesPath = testPath;
        break;
      }
    }
    
    if (!savesPath) {
      return [];
    }

    try {
      const items = fs.readdirSync(savesPath);
      const worlds: MinecraftWorld[] = [];

      for (const item of items) {
        const worldPath = path.join(savesPath, item);
        
        if (!fs.statSync(worldPath).isDirectory()) {
          continue;
        }

        // Validate it's a Minecraft world
        const levelDatPath = path.join(worldPath, 'level.dat');
        if (!fs.existsSync(levelDatPath)) {
          continue;
        }

        try {
          const stats = await this.getWorldStats(worldPath);

          worlds.push({
            name: item,
            path: worldPath,
            playtime: stats.playtime,
            instanceName,
          });
      
        } catch (err) {
          console.error(`${item}: Error reading stats:`, err);
        }
      }

      return worlds;
    } catch (err) {
      console.error('Error reading saves folder:', err);
      return [];
    }
  }

  private getTotalAdvancementsFromDatapacks(worldPath: string): number {
    try {
      const datapacksPath = path.join(worldPath, 'datapacks');
      
      if (!fs.existsSync(datapacksPath)) {
        return 0;
      }

      let totalCount = 0;
      const datapacks = fs.readdirSync(datapacksPath);
      
      for (const datapack of datapacks) {
        const datapackPath = path.join(datapacksPath, datapack);
        
        if (datapack.endsWith('.zip')) {
          try {
            const zip = new AdmZip(datapackPath);
            const zipEntries = zip.getEntries();
            
            for (const entry of zipEntries) {
              const entryPath = entry.entryName;
              
              if (entry.isDirectory || !entryPath.endsWith('.json')) continue;
              if (entryPath.includes('/recipes/')) continue;
              
              if (entryPath.includes('/advancements/') || entryPath.includes('/advancement/')) {
                totalCount++;
              }
            }
            continue;
          } catch (zipErr) {
            console.error(`Failed to read ZIP ${datapack}:`, zipErr);
            continue;
          }
        }
        
        if (!fs.statSync(datapackPath).isDirectory()) continue;

        const dataPath = path.join(datapackPath, 'data');
        if (!fs.existsSync(dataPath)) continue;

        const namespaces = fs.readdirSync(dataPath);
        
        for (const namespace of namespaces) {
          let advancementsPath = path.join(dataPath, namespace, 'advancements');
          
          if (!fs.existsSync(advancementsPath)) {
            advancementsPath = path.join(dataPath, namespace, 'advancement');
          }
          
          if (!fs.existsSync(advancementsPath)) continue;

          totalCount += this.countAdvancementFiles(advancementsPath);
        }
      }

      return totalCount;
    } catch (err) {
      return 0;
    }
  }

  private countAdvancementFiles(dir: string): number {
    let count = 0;

    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (item === 'recipes') continue;
          count += this.countAdvancementFiles(fullPath);
        } else if (item.endsWith('.json')) {
          count++;
        }
      }
    } catch (err) {

    }

    return count;
  }

  private async getWorldStats(worldPath: string): Promise<MinecraftStats> {
    try {
      const statsPath = path.join(worldPath, 'stats');
      
      if (!fs.existsSync(statsPath)) {
        return { 
          playtime: 0, 
          achievements: { 
            stats: {}, 
            achievements: { totalAdvancements: 0, completedAdvancements: 0 } 
          }, 
          rawStats: {} 
        };
      }

      const statsFiles = fs.readdirSync(statsPath).filter(f => f.endsWith('.json'));
      
      if (statsFiles.length === 0) {
        return { 
          playtime: 0, 
          achievements: { 
            stats: {}, 
            achievements: { totalAdvancements: 0, completedAdvancements: 0 } 
          }, 
          rawStats: {} 
        };
      }

      const statsFile = path.join(statsPath, statsFiles[0]);
      const statsData = JSON.parse(fs.readFileSync(statsFile, 'utf-8'));

      const playTimeTicks = statsData.stats?.['minecraft:custom']?.['minecraft:play_time'] || 0;
      const playtimeMinutes = Math.floor((playTimeTicks / 20) / 60);

      const playerUUID = statsFiles[0].replace('.json', '');
      const advancementsPath = path.join(worldPath, 'advancements', `${playerUUID}.json`);
      
      let totalAdvancements = 0;
      let completedAdvancements = 0;

      if (fs.existsSync(advancementsPath)) {
        try {
          const advancementsData = JSON.parse(fs.readFileSync(advancementsPath, 'utf-8'));
          const allKeys = Object.keys(advancementsData);

          const realAdvancements = allKeys.filter(key => {
            if (key === 'DataVersion') return false;
            if (key.includes('/recipes/') || key.startsWith('minecraft:recipes/')) return false;
            
            const entry = advancementsData[key];
            if (typeof entry !== 'object' || !entry.criteria) return false;
            
            const criteriaKeys = Object.keys(entry.criteria || {});
            const isRecipeUnlock = criteriaKeys.some(k => 
              k === 'has_the_recipe' ||
              k === 'unlock_right_away' ||
              k.startsWith('has_') 
            ) && criteriaKeys.length === 1;
            
            if (isRecipeUnlock) return false;
            if (key.toLowerCase().includes('recipe')) return false;
            
            return true;
          });
          
          totalAdvancements = realAdvancements.length;
          completedAdvancements = realAdvancements.filter(key => 
            advancementsData[key].done === true
          ).length;
          
        } catch (err) {

        }
      }

      const datapackTotal = this.getTotalAdvancementsFromDatapacks(worldPath);
      const vanillaAdvancementCount = 122; 
      
      if (datapackTotal > 0) {
        totalAdvancements = datapackTotal + vanillaAdvancementCount;
      }

      const achievements = this.parseAchievements(statsData);

      return {
        playtime: playtimeMinutes,
        achievements: {
          stats: achievements.stats,
          achievements: {
            totalAdvancements,
            completedAdvancements,
          },
        },
        rawStats: statsData.stats?.['minecraft:custom'] || {},
      };
    } catch (err) {
      return { 
        playtime: 0, 
        achievements: { 
          stats: {}, 
          achievements: { totalAdvancements: 0, completedAdvancements: 0 } 
        }, 
        rawStats: {} 
      };
    }
  }

  private parseAchievements(statsData: any): any {
    const customStats = statsData.stats?.['minecraft:custom'] || {};
    
    return {
      stats: {
        diamondsMined: customStats['minecraft:mine_diamond'] || 0,
        deaths: customStats['minecraft:deaths'] || 0,
        mobKills: customStats['minecraft:mob_kills'] || 0,
        distanceWalked: customStats['minecraft:walk_one_cm'] || 0,
        jumps: customStats['minecraft:jump'] || 0,
        timeSinceDeath: customStats['minecraft:time_since_death'] || 0,
      },
      achievements: {},
    };
  }

  async syncMinecraftData(
    userId: string,
    worldPath: string,
    worldName: string,
    instanceName?: string
  ) {
    const stats = await this.getWorldStats(worldPath);

    const totalAchievements = stats.achievements.achievements.totalAdvancements || 0;
    const completedAchievements = stats.achievements.achievements.completedAdvancements || 0;
    
    const platformGameId = `minecraft_${Buffer.from(worldPath).toString('base64').substring(0, 32)}`;

    const iconPath = path.join(worldPath, 'icon.png');
    let imageUrl = null;

    if (fs.existsSync(iconPath)) {
      try {
        const iconBuffer = fs.readFileSync(iconPath);
        imageUrl = `data:image/png;base64,${iconBuffer.toString('base64')}`;
      } catch (err) {

      }
    }

    return {
      userId,
      platform: 'minecraft',
      platformGameId,
      name: `Minecraft - ${worldName}`,
      playtimeForever: stats.playtime,
      imageUrl,
      achievementsTotal: totalAchievements,
      achievementsEarned: completedAchievements,
      platformData: {
        worldName,
        worldPath,
        instanceName: instanceName || null,
        stats: stats.rawStats,
        advancements: stats.achievements.achievements,
      },
    };
  }
}