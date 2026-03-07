import fs from 'fs';
import path from 'path';
import os from 'os';

interface PCSX2PlaytimeEntry {
  serial: string;
  playtimeSeconds: number;
  lastPlayed: Date;
}

export class PCSX2Service {
  private playtimeFilePath: string;

  constructor(customPath?: string) {
    const homeDir = os.homedir();
    this.playtimeFilePath = customPath || path.join(
      homeDir,
      '.config',
      'PCSX2',
      'inis',
      'playtime.dat'
    );
  }

  fileExists(): boolean {
    return fs.existsSync(this.playtimeFilePath);
  }

  parsePlaytimeFile(): PCSX2PlaytimeEntry[] {
    if (!this.fileExists()) {
      throw new Error(`PCSX2 playtime file not found at: ${this.playtimeFilePath}`);
    }

    const buffer = fs.readFileSync(this.playtimeFilePath);
    const entries: PCSX2PlaytimeEntry[] = [];

    try {
      const content = buffer.toString('utf8');
      
      const serialRegex = /([A-Z]{4}-\d{5})/g;
      const matches = content.matchAll(serialRegex);
      
      for (const match of matches) {
        const serial = match[1];
        const serialIndex = match.index!;
        
        const afterSerial = content.substring(serialIndex + serial.length, serialIndex + serial.length + 100);
        const numbers = afterSerial.match(/\d+/g);
        
        if (numbers && numbers.length >= 2) {
          const playtimeSeconds = parseInt(numbers[0], 10);
          const lastPlayedTimestamp = parseInt(numbers[1], 10);
          
          if (lastPlayedTimestamp > 1577836800 && lastPlayedTimestamp < 1893456000) {
            entries.push({
              serial,
              playtimeSeconds,
              lastPlayed: new Date(lastPlayedTimestamp * 1000)
            });
            
          }
        }
      }
    } catch (err) {
      console.error('Error parsing playtime file:', err);
    }
    return entries;
  }

  getPlaytimeForSerial(serial: string): number | null {
    const entries = this.parsePlaytimeFile();
    const entry = entries.find(e => e.serial === serial);
    return entry ? entry.playtimeSeconds : null;
  }

  getAllPlaytimes(): PCSX2PlaytimeEntry[] {
    return this.parsePlaytimeFile();
  }

  setPlaytimeFilePath(filePath: string) {
    this.playtimeFilePath = filePath;
  }
}