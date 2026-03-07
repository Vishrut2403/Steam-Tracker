import fs from 'fs';
import path from 'path';
import os from 'os';

interface RPCS3PlaytimeEntry {
  serial: string;
  titleId: string;
  gameName: string;
  playtimeSeconds: number;
  lastPlayed: Date;
}

export class RPCS3Service {
  private configPath: string;
  private gamesYmlPath: string;

  constructor(customConfigPath?: string) {
    const homeDir = os.homedir();
    
    // Default RPCS3 paths by OS
    if (customConfigPath) {
      this.configPath = customConfigPath;
    } else if (process.platform === 'linux') {
      this.configPath = path.join(homeDir, '.config', 'rpcs3');
    } else if (process.platform === 'win32') {
      this.configPath = path.join(homeDir, 'AppData', 'Roaming', 'rpcs3');
    } else if (process.platform === 'darwin') {
      this.configPath = path.join(homeDir, 'Library', 'Application Support', 'rpcs3');
    } else {
      this.configPath = path.join(homeDir, '.config', 'rpcs3');
    }

    this.gamesYmlPath = path.join(this.configPath, 'games.yml');
  }

  /**
   * Check if RPCS3 games.yml file exists
   */
  fileExists(): boolean {
    return fs.existsSync(this.gamesYmlPath);
  }

  /**
   * Parse RPCS3 games.yml file
   * Format is YAML with playtime stored in milliseconds
   * 
   * Example:
   * BLUS12345:
   *   Title: "Game Name"
   *   PlayTime: 123456789
   *   LastPlayed: 1234567890
   */
  parseGamesYml(): RPCS3PlaytimeEntry[] {
    if (!this.fileExists()) {
      throw new Error(`RPCS3 games.yml not found at: ${this.gamesYmlPath}`);
    }

    const content = fs.readFileSync(this.gamesYmlPath, 'utf8');
    const entries: RPCS3PlaytimeEntry[] = [];

    // Split by game entries (each starts with a serial like BLUS12345:)
    const lines = content.split('\n');
    
    let currentSerial: string | null = null;
    let currentTitle: string | null = null;
    let currentPlaytime: number | null = null;
    let currentLastPlayed: number | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect game serial (format: BLUS12345: or "BLUS12345":)
      const serialMatch = line.match(/^["']?([A-Z]{4}\d{5})["']?:\s*$/);
      if (serialMatch) {
        // Save previous entry if exists
        if (currentSerial && currentTitle && currentPlaytime !== null) {
          entries.push({
            serial: currentSerial,
            titleId: currentSerial,
            gameName: currentTitle,
            playtimeSeconds: Math.floor(currentPlaytime / 1000), // Convert ms to seconds
            lastPlayed: currentLastPlayed 
              ? new Date(currentLastPlayed * 1000) 
              : new Date()
          });
        }

        // Start new entry
        currentSerial = serialMatch[1];
        currentTitle = null;
        currentPlaytime = null;
        currentLastPlayed = null;
        continue;
      }

      // Parse title
      const titleMatch = line.match(/Title:\s*["']?(.+?)["']?\s*$/);
      if (titleMatch && currentSerial) {
        currentTitle = titleMatch[1];
      }

      // Parse playtime (in milliseconds)
      const playtimeMatch = line.match(/PlayTime:\s*(\d+)/);
      if (playtimeMatch && currentSerial) {
        currentPlaytime = parseInt(playtimeMatch[1], 10);
      }

      // Parse last played timestamp
      const lastPlayedMatch = line.match(/LastPlayed:\s*(\d+)/);
      if (lastPlayedMatch && currentSerial) {
        currentLastPlayed = parseInt(lastPlayedMatch[1], 10);
      }
    }

    // Save last entry
    if (currentSerial && currentTitle && currentPlaytime !== null) {
      entries.push({
        serial: currentSerial,
        titleId: currentSerial,
        gameName: currentTitle,
        playtimeSeconds: Math.floor(currentPlaytime / 1000),
        lastPlayed: currentLastPlayed 
          ? new Date(currentLastPlayed * 1000) 
          : new Date()
      });
    }

    console.log(`✅ Parsed ${entries.length} PS3 games from RPCS3`);
    entries.forEach(e => {
      console.log(`📀 ${e.serial}: ${e.gameName} - ${Math.floor(e.playtimeSeconds / 60)}m`);
    });

    return entries;
  }

  /**
   * Get playtime for a specific game serial
   */
  getPlaytimeForSerial(serial: string): number | null {
    try {
      const entries = this.parseGamesYml();
      const entry = entries.find(e => e.serial === serial);
      return entry ? entry.playtimeSeconds : null;
    } catch (err) {
      console.error('Error getting playtime:', err);
      return null;
    }
  }

  /**
   * Get all RPCS3 playtimes
   */
  getAllPlaytimes(): RPCS3PlaytimeEntry[] {
    return this.parseGamesYml();
  }

  /**
   * Set custom config path
   */
  setConfigPath(configPath: string) {
    this.configPath = configPath;
    this.gamesYmlPath = path.join(configPath, 'games.yml');
  }

  /**
   * Get current config path
   */
  getConfigPath(): string {
    return this.configPath;
  }
}