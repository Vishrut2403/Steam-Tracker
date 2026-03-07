import api from './api';

class SteamService {

  async getLibrary(steamId: string) {
    const response = await api.get(`/steam/library/${steamId}`);
    return response.data;
  }

  async getEnrichedLibrary(steamId: string, platform?: string) {
    const timestamp = Date.now(); 
    const url = platform 
      ? `/steam/library/${steamId}/enriched?platform=${platform}&_t=${timestamp}`
      : `/steam/library/${steamId}/enriched?_t=${timestamp}`;
    const response = await api.get(url);
    return response.data;
  }

  async getPlatforms(steamId: string) {
    const response = await api.get(`/steam/library/${steamId}/platforms`);
    return response.data;
  }

  async updateGamePrice(steamId: string, appId: string, pricePaid: number) {
    const response = await api.patch(`/steam/library/${steamId}/game/${appId}/price`, {
      pricePaid,
    });
    return response.data;
  }

  async updateGameStatus(steamId: string, appId: string, status: string) {
    const response = await api.patch(`/steam/library/${steamId}/game/${appId}/status`, {
      status,
    });
    return response.data;
  }

  async updateGameRating(steamId: string, appId: string, rating: number) {
    const response = await api.patch(`/steam/library/${steamId}/game/${appId}/rating`, {
      rating,
    });
    return response.data;
  }

  async updateGameTags(steamId: string, appId: string, tags: string[]) {
    const response = await api.patch(`/steam/library/${steamId}/game/${appId}/tags`, {
      tags,
    });
    return response.data;
  }

  async updateGameReview(steamId: string, appId: string, review: string) {
    const response = await api.patch(`/steam/library/${steamId}/game/${appId}/review`, {
      review,
    });
    return response.data;
  }

  async updateGameImage(steamId: string, appId: string, headerImage: string) {
    const response = await api.patch(`/steam/library/${steamId}/game/${appId}/image`, {
      headerImage,
    });
    return response.data;
  }

  async getRecommendations(steamId: string) {
    const response = await api.get(`/recommendations/${steamId}`);
    return response.data;
  }

  async optimizeBudget(steamId: string, budget: number) {
    const response = await api.post(`/recommendations/${steamId}/optimize`, {
      budget,
    });
    return response.data;
  }

  async getWishlist(steamId: string) {
    const response = await api.get(`/steam/wishlist/${steamId}`);
    return response.data;
  }

  async getPlayer(steamId: string) {
    const response = await api.get(`/steam/player/${steamId}`);
    return response.data;
  }

  async addManualGame(gameData: {
    userId: string;
    platform: string;
    platformGameId: string;
    name: string;
    playtimeForever?: number;
    pricePaid?: number;
    status?: string;
    rating?: number;
    review?: string;
    userTags?: string[];
    platformData?: any;
  }) {
    const response = await api.post('/multiplatform/games/manual', gameData);
    return response.data;
  }

  async updatePlatformGame(
    platform: string,
    platformGameId: string,
    userId: string,
    updateData: any
  ) {
    const response = await api.patch(
      `/multiplatform/games/${platform}/${platformGameId}`,
      { userId, ...updateData }
    );
    return response.data;
  }

  async deletePlatformGame(platform: string, platformGameId: string, userId: string) {
    const response = await api.delete(
      `/multiplatform/games/${platform}/${platformGameId}`,
      { data: { userId } }
    );
    return response.data;
  }

  async getMinecraftInstances() {
    const response = await api.get('/multiplatform/minecraft/instances');
    return response.data;
  }

  async syncMinecraftWorld(data: {
    userId: string;
    worldPath: string;
    worldName: string;
    instanceName?: string;
  }) {
    const response = await api.post('/multiplatform/minecraft/sync', data);
    return response.data;
  }

  async searchRetroAchievements(gameName: string, consoleId: number) {
    const response = await api.get('/multiplatform/retroachievements/search', {
      params: { gameName, consoleId },
    });
    return response.data;
  }

  async getRetroAchievementsGame(gameId: string) {
    const response = await api.get(`/multiplatform/retroachievements/game/${gameId}`);
    return response.data;
  }

  async syncEmulatorGame(data: {
    userId: string;
    platform: string;
    gameName: string;
    retroAchievementsId?: string;
    playtimeForever?: number;
    emulatorType?: string;
    romFile?: string;
  }) {
    const response = await api.post('/multiplatform/emulator/sync', data);
    return response.data;
  }
}

export default new SteamService();