import api from './api';

class SteamService {
  // Get basic library 
  async getLibrary(steamId: string) {
    const response = await api.get(`/steam/library/${steamId}`);
    return response.data;
  }

  // Get enriched library 
  async getEnrichedLibrary(steamId: string) {
    const response = await api.get(`/steam/library/${steamId}/enriched`);
    return response.data;
  }

  // Update price paid
  async updateGamePrice(steamId: string, appId: string, pricePaid: number) {
    const response = await api.patch(`/steam/library/${steamId}/game/${appId}/price`, {
      pricePaid,
    });
    return response.data;
  }

  // Update game status
  async updateGameStatus(steamId: string, appId: string, status: string) {
    const response = await api.patch(`/steam/library/${steamId}/game/${appId}/status`, {
      status,
    });
    return response.data;
  }

  // Update rating
  async updateGameRating(steamId: string, appId: string, rating: number) {
    const response = await api.patch(`/steam/library/${steamId}/game/${appId}/rating`, {
      rating,
    });
    return response.data;
  }

  // Update user tags
  async updateGameTags(steamId: string, appId: string, tags: string[]) {
    const response = await api.patch(`/steam/library/${steamId}/game/${appId}/tags`, {
      tags,
    });
    return response.data;
  }

  // Update review
  async updateGameReview(steamId: string, appId: string, review: string) {
    const response = await api.patch(`/steam/library/${steamId}/game/${appId}/review`, {
      review,
    });
    return response.data;
  }

  // Get recommendations
  async getRecommendations(steamId: string) {
    const response = await api.get(`/recommendations/${steamId}`);
    return response.data;
  }

  // Get budget-optimized recommendations
  async optimizeBudget(steamId: string, budget: number) {
    const response = await api.post(`/recommendations/${steamId}/optimize`, {
      budget,
    });
    return response.data;
  }

  // Get wishlist
  async getWishlist(steamId: string) {
    const response = await api.get(`/steam/wishlist/${steamId}`);
    return response.data;
  }

  // Get player info
  async getPlayer(steamId: string) {
    const response = await api.get(`/steam/player/${steamId}`);
    return response.data;
  }
}

export default new SteamService();