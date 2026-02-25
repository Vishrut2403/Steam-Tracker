import axios from 'axios';
import NodeCache from 'node-cache';
import dotenv from 'dotenv';
import prisma from '../prisma';

const CACHE_TTL = 3600;
const WISHLIST_TTL = 1800;
const API_TIMEOUT = 3000;
const WISHLIST_TIMEOUT = 15000;
const REQUEST_DELAY_MS = 1200;

dotenv.config();

const cache = new NodeCache({ stdTTL: CACHE_TTL });

const STEAM_API_BASE = 'https://api.steampowered.com';
const STEAM_STORE_API = 'https://store.steampowered.com/api';

interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  playtime_2weeks?: number;
  img_icon_url?: string;
  img_logo_url?: string;
}

interface SteamLibraryResponse {
  response: {
    game_count: number;
    games: SteamGame[];
  };
}

interface StoreAppDetails {
  success: boolean;
  data?: {
    name: string;
    is_free: boolean;
    genres?: Array<{ description: string }>;
    price_overview?: {
      currency: string;
      initial: number;
      final: number;
      discount_percent: number;
    };
  };
}

interface WishlistGameData {
  appId: string;
  name: string;
  currentPrice: number;
  originalPrice: number;
  discountPercent: number;
  genres: string[];
}

interface AchievementData {
  total: number;
  completed: number;
  percentage: number;
}

class SteamService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.STEAM_API_KEY || '';

     if (!this.apiKey) {
      throw new Error('STEAM_API_KEY is not configured');
    }
  }

  // Fetch achievements for a single game 
  private async getGameAchievements(steamId: string, appId: number): Promise<AchievementData | null> {
    const cacheKey = `achievements_${steamId}_${appId}`;
    const cached = cache.get<AchievementData>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const schemaUrl = `${STEAM_API_BASE}/ISteamUserStats/GetSchemaForGame/v2/`;
      const schemaResponse = await axios.get(schemaUrl, {
        params: { key: this.apiKey, appid: appId },
        timeout: API_TIMEOUT,
      });

      const totalAchievements = schemaResponse.data.game?.availableGameStats?.achievements?.length || 0;

      if (totalAchievements === 0) {
        return null;
      }

      const statsUrl = `${STEAM_API_BASE}/ISteamUserStats/GetPlayerAchievements/v1/`;
      const statsResponse = await axios.get(statsUrl, {
        params: { key: this.apiKey, steamid: steamId, appid: appId },
        timeout: API_TIMEOUT,
      });

      const achievements = statsResponse.data.playerstats?.achievements || [];
      const completedCount = achievements.filter((a: any) => a.achieved === 1).length;
      const percentage = totalAchievements > 0 ? (completedCount / totalAchievements) * 100 : 0;

      const result = {
        total: totalAchievements,
        completed: completedCount,
        percentage: Math.round(percentage),
      };

      cache.set(cacheKey, result, CACHE_TTL);
      return result;
    } catch (error) {
      return null;
    }
  }

  // Find or create user in DB
  private async findOrCreateUser(steamId: string, username?: string) {
    const user = await prisma.user.upsert({
      where: { steamId },
      update: {
        steamUsername: username || undefined,
        updatedAt: new Date(),
      },
      create: {
        steamId,
        steamUsername: username || null,
      },
    });
    return user;
  }

  // Save library games to DB
  async saveLibrary(steamId: string, games: SteamGame[]) {
    const user = await this.findOrCreateUser(steamId);

    for (const game of games) {
        await prisma.libraryGame.upsert({
          where: {
            userId_appId: {
              userId: user.id,
              appId: String(game.appid),
            },
          },
          update: {
            playtimeForever: game.playtime_forever,
            imgIconUrl: game.img_icon_url || null,
            imgLogoUrl: game.img_logo_url || null,
            headerImage: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
          },
          create: {
            userId: user.id,
            appId: String(game.appid),
            name: game.name,
            playtimeForever: game.playtime_forever,
            imgIconUrl: game.img_icon_url || null,
            imgLogoUrl: game.img_logo_url || null,
            headerImage: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
          },
        });
    }

    // Fetch achievements in background (async, don't await)
    this.fetchAchievementsInBackground(steamId, user.id, games).catch(() => {});
  }

  // Fetch achievements in background
  private async fetchAchievementsInBackground(steamId: string, userId: string, games: SteamGame[]) {

    for (const game of games) {

        const achievements = await this.getGameAchievements(steamId, game.appid);

        if (achievements) {
          await prisma.libraryGame.update({
            where: {
              userId_appId: {
                userId: userId,
                appId: String(game.appid),
              },
            },
            data: {
              totalAchievements: achievements.total,
              completedAchievements: achievements.completed,
              achievementPercentage: achievements.percentage,
            },
          });
        }
    }
  }

  // Fetch library from Steam API
  async getUserLibrary(steamId: string): Promise<SteamGame[]> {
    const cacheKey = `library_${steamId}`;
    const cached = cache.get<SteamGame[]>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const url = `${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v1/`;
      const response = await axios.get<SteamLibraryResponse>(url, {
        params: {
          key: this.apiKey,
          steamid: steamId,
          include_appinfo: 1,
          include_played_free_games: 1,
          format: 'json'
        }
      });

      const games = response.data.response.games || [];
      cache.set(cacheKey, games);

      return games;
    } catch (error) {
      throw new Error('Failed to fetch Steam library');
    }
  }

  // Fetch wishlist app IDs from Steam Store 
  async getUserWishlist(steamId: string): Promise<number[]> {
    const cacheKey = `wishlist_${steamId}`;
    const cached = cache.get<number[]>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const url = `https://store.steampowered.com/wishlist/profiles/${steamId}/wishlistdata/`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        },
        timeout: WISHLIST_TIMEOUT,
      });

      if (typeof response.data !== 'object' || response.data === null) {
        return [];
      }

      const keys = Object.keys(response.data);
      const appIds = keys
        .map(Number)
        .filter((id) => !isNaN(id) && id > 1000 && id < 9999999999);

      cache.set(cacheKey, appIds, WISHLIST_TTL);
      return appIds;
    } catch (error) {
      return [];
    }
  }

  // Fetch price 
  private async getAppDetails(appId: number): Promise<StoreAppDetails> {
    const cacheKey = `appdetails_${appId}`;
    const cached = cache.get<StoreAppDetails>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const url = `${STEAM_STORE_API}/appdetails`;
      const response = await axios.get<Record<string, StoreAppDetails>>(url, {
        params: { appids: appId, cc: 'in', l: 'english' }
      });

      const result = response.data[appId];
      cache.set(cacheKey, result, 3600);
      return result;
    } catch (error) {
      return { success: false };
    }
  }

  // Enrich wishlist: fetch details for each app ID 
  async getEnrichedWishlist(steamId: string): Promise<WishlistGameData[]> {
    const appIds = await this.getUserWishlist(steamId);

    if (appIds.length === 0) {
      return [];
    }

    const enriched: WishlistGameData[] = [];

    for (const appId of appIds) {
      const details = await this.getAppDetails(appId);

      if (!details.success || !details.data) {
        continue;
      }

      const game = details.data;
      const originalPrice = game.price_overview ? game.price_overview.initial / 100 : 0;
      const currentPrice = game.price_overview ? game.price_overview.final / 100 : 0;
      const discountPercent = game.price_overview ? game.price_overview.discount_percent : 0;
      const genres = game.genres ? game.genres.map((g) => g.description) : [];

      enriched.push({
        appId: String(appId),
        name: game.name,
        currentPrice,
        originalPrice,
        discountPercent,
        genres,
      });

      await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
    }

    return enriched;
  }

  // Save enriched wishlist to DB 
  async saveWishlist(steamId: string, games: WishlistGameData[]) {
    const user = await this.findOrCreateUser(steamId);

    for (const game of games) {
      await prisma.wishlistGame.upsert({
        where: { userId_appId: { userId: user.id, appId: game.appId } },
        update: {
          name: game.name,
          currentPrice: game.currentPrice,
          discountPercent: game.discountPercent,
          genres: game.genres,
        },
        create: {
          userId: user.id,
          appId: game.appId,
          name: game.name,
          currentPrice: game.currentPrice,
          discountPercent: game.discountPercent,
          genres: game.genres,
        },
      });
    }
  }

  // Fetch player info from Steam API 
  async getPlayerSummary(steamId: string) {
    const cacheKey = `player_${steamId}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const url = `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v2/`;
      const response = await axios.get(url, {
        params: { key: this.apiKey, steamids: steamId }
      });

      const player = response.data.response.players[0];
      cache.set(cacheKey, player);
      return player;
    } catch (error) {
      throw new Error('Failed to fetch player data');
    }
  }
}

export default new SteamService();