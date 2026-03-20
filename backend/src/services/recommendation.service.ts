import prisma from '../prisma';

/**
 * Weighted scoring model.
 * Total weight = 1.0
 * Discount prioritized intentionally.
 */
const SCORING_WEIGHTS = {
  discount: 0.50,
  playtime: 0.30,
  tagMatch: 0.15,
  rating: 0.05,
};

interface TagProfile {
  [tag: string]: {
    totalPlaytime: number;
    gameCount: number;
    avgRating: number;
  };
}

interface RecommendationResult {
  id: string;
  name: string;
  tags: string[];
  listPrice: number;
  currentPrice: number;
  discountPercent: number;
  finalScore: number;
  breakdown: {
    discountScore: number;
    playtimeScore: number;
    tagMatchScore: number;
    ratingScore: number;
  };
  estimatedPlaytime: number;
  reasoning: string[];
}

class RecommendationService {
  private async buildTagProfile(userId: string): Promise<TagProfile> {
    const games = await prisma.libraryGame.findMany({
      where: {
        userId,
        playtimeForever: { gt: 0 },
      },
      select: {
        platformData: true,
        userTags: true,
        playtimeForever: true,
        rating: true,
      },
    });

    const profile: TagProfile = {};

    games.forEach((game: any) => {
      const genres = game.platformData?.genres || [];
      const allTags = [...genres, ...(game.userTags || [])];
      const rating = game.rating || 3;

      allTags.forEach((tag: string) => {
        if (!profile[tag]) {
          profile[tag] = {
            totalPlaytime: 0,
            gameCount: 0,
            avgRating: 0,
          };
        }

        const current = profile[tag];
        current.totalPlaytime += game.playtimeForever || 0;
        current.gameCount += 1;
        current.avgRating = (current.avgRating * (current.gameCount - 1) + rating) / current.gameCount;
      });
    });

    return profile;
  }

  private calculateDiscountScore(discountPercent: number): number {
    return Math.min(discountPercent, 100);
  }

  private calculatePlaytimeScore(gameTags: string[], profile: TagProfile): number {
    if (Object.keys(profile).length === 0) return 50;

    let totalWeightedPlaytime = 0;
    let matchCount = 0;

    gameTags.forEach((tag) => {
      if (profile[tag]) {
        totalWeightedPlaytime += profile[tag].totalPlaytime;
        matchCount++;
      }
    });

    if (matchCount === 0) return 20;

    const avgPlaytime = totalWeightedPlaytime / matchCount;
    return Math.min((avgPlaytime / 6000) * 100, 100);
  }

  private calculateTagMatchScore(gameTags: string[], profile: TagProfile): number {
    if (Object.keys(profile).length === 0) return 50;

    let matchedTags = 0;
    gameTags.forEach((tag) => {
      if (profile[tag]) matchedTags++;
    });

    return gameTags.length > 0 ? (matchedTags / gameTags.length) * 100 : 0;
  }

  private calculateRatingScore(gameTags: string[], profile: TagProfile): number {
    if (Object.keys(profile).length === 0) return 50;

    let totalRating = 0;
    let matchCount = 0;

    gameTags.forEach((tag) => {
      if (profile[tag]) {
        totalRating += profile[tag].avgRating;
        matchCount++;
      }
    });

    if (matchCount === 0) return 40;

    const avgRating = totalRating / matchCount;
    return (avgRating / 5) * 100;
  }

  private estimatePlaytime(gameTags: string[], profile: TagProfile): number {
    if (Object.keys(profile).length === 0) return 600;

    let totalPlaytime = 0;
    let matchCount = 0;

    gameTags.forEach((tag) => {
      if (profile[tag]) {
        totalPlaytime += profile[tag].totalPlaytime / profile[tag].gameCount;
        matchCount++;
      }
    });

    return matchCount > 0 ? totalPlaytime / matchCount : 600;
  }

  private generateReasoning(
    discountScore: number,
    playtimeScore: number,
    tagMatchScore: number,
    discountPercent: number
  ): string[] {
    const reasons: string[] = [];

    if (discountScore >= 50) {
      reasons.push(`${discountPercent}% discount`);
    }

    if (playtimeScore > 70) {
      reasons.push('High playtime potential');
    } else if (playtimeScore > 40) {
      reasons.push('Moderate playtime expected');
    }

    if (tagMatchScore > 70) {
      reasons.push('Strong tag match');
    } else if (tagMatchScore > 40) {
      reasons.push('Decent tag match');
    }

    if (reasons.length === 0) {
      reasons.push('Consider based on price');
    }

    return reasons;
  }

  async getRecommendations(userId: string): Promise<RecommendationResult[]> {
    
    const wishlistGames = await prisma.steamWishlist.findMany({
      where: { userId },
    });

    if (wishlistGames.length === 0) {
      return [];
    }

    const profile = await this.buildTagProfile(userId);
    
    const recommendations: RecommendationResult[] = [];

    for (const game of wishlistGames) {
      const discountScore = this.calculateDiscountScore(game.discountPercent);
      const playtimeScore = this.calculatePlaytimeScore(game.tags, profile);
      const tagMatchScore = this.calculateTagMatchScore(game.tags, profile);
      const ratingScore = this.calculateRatingScore(game.tags, profile);

      const finalScore =
        discountScore * SCORING_WEIGHTS.discount +
        playtimeScore * SCORING_WEIGHTS.playtime +
        tagMatchScore * SCORING_WEIGHTS.tagMatch +
        ratingScore * SCORING_WEIGHTS.rating;

      const estimatedPlaytime = this.estimatePlaytime(game.tags, profile);
      const reasoning = this.generateReasoning(
        discountScore,
        playtimeScore,
        tagMatchScore,
        game.discountPercent
      );

      recommendations.push({
        id: game.id,
        name: game.name,
        tags: game.tags,
        listPrice: game.listPrice,
        currentPrice: game.currentPrice,
        discountPercent: game.discountPercent,
        finalScore: Math.round(finalScore),
        breakdown: {
          discountScore: Math.round(discountScore),
          playtimeScore: Math.round(playtimeScore),
          tagMatchScore: Math.round(tagMatchScore),
          ratingScore: Math.round(ratingScore),
        },
        estimatedPlaytime: Math.round(estimatedPlaytime / 60),
        reasoning,
      });
    }

    recommendations.sort((a, b) => b.finalScore - a.finalScore);

    for (const rec of recommendations) {
      await prisma.steamWishlist.update({
        where: { id: rec.id },
        data: { recommendationScore: rec.finalScore },
      });
    }

    return recommendations;
  }
}

export default new RecommendationService();