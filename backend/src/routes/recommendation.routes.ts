import { Router, Request, Response } from 'express';
import recommendationService from '../services/recommendation.service';
import knapsackService from '../services/knapsack.service';

const router = Router();

router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;

    if (!userId) {
      res.status(400).json({ error: 'User ID required' });
      return;
    }

    const recommendations = await recommendationService.getRecommendations(userId);

    res.json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate recommendations',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post('/:userId/optimize', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const { budget } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'User ID required' });
      return;
    }

    if (typeof budget !== 'number' || budget <= 0) {
      res.status(400).json({ error: 'Valid budget required' });
      return;
    }

    const recommendations = await recommendationService.getRecommendations(userId);

    if (recommendations.length === 0) {
      res.json({
        success: true,
        budget,
        selectedGames: [],
        totalCost: 0,
        totalScore: 0,
        remaining: budget,
        message: 'No wishlist items available',
      });
      return;
    }

    const items = recommendations.map((rec) => ({
      id: rec.id,
      name: rec.name,
      price: rec.currentPrice,
      score: rec.finalScore,
      tags: rec.tags,
      listPrice: rec.listPrice,
      discountPercent: rec.discountPercent,
    }));

    const result = knapsackService.optimizeBudget(items, budget);

    const selectedGames = result.selectedGames.map((item) => {
      const fullData = recommendations.find((r) => r.id === item.id);
      return fullData;
    }).filter(Boolean);

    res.json({
      success: true,
      budget,
      selectedGames,
      totalCost: result.totalCost,
      totalScore: result.totalScore,
      remaining: result.remaining,
      count: selectedGames.length,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to optimize budget',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;