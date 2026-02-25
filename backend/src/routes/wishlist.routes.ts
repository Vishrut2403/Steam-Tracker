import { Router, Request, Response } from 'express';
import wishlistService from '../services/wishlist.service';

const router = Router();

// Get all wishlist items 
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;

    const items = await wishlistService.getUserWishlist(userId);

    res.json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch wishlist',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Create wishlist item 
router.post('/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const { name, tags, listPrice, currentPrice } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    if (!Array.isArray(tags)) {
      res.status(400).json({ error: 'Tags must be an array' });
      return;
    }

    if (typeof listPrice !== 'number' || listPrice < 0) {
      res.status(400).json({ error: 'Valid list price is required' });
      return;
    }

    if (typeof currentPrice !== 'number' || currentPrice < 0) {
      res.status(400).json({ error: 'Valid current price is required' });
      return;
    }

    const item = await wishlistService.createWishlistItem(userId, {
      name: name.trim(),
      tags,
      listPrice,
      currentPrice,
    });

    res.status(201).json({
      success: true,
      item,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create wishlist item',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update wishlist item 
router.patch('/:userId/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const id = req.params.id as string;
    const { name, tags, listPrice, currentPrice } = req.body;

    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({ error: 'Invalid name' });
        return;
      }
      updateData.name = name.trim();
    }

    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        res.status(400).json({ error: 'Tags must be an array' });
        return;
      }
      updateData.tags = tags;
    }

    if (listPrice !== undefined) {
      if (typeof listPrice !== 'number' || listPrice < 0) {
        res.status(400).json({ error: 'Invalid list price' });
        return;
      }
      updateData.listPrice = listPrice;
    }

    if (currentPrice !== undefined) {
      if (typeof currentPrice !== 'number' || currentPrice < 0) {
        res.status(400).json({ error: 'Invalid current price' });
        return;
      }
      updateData.currentPrice = currentPrice;
    }

    const item = await wishlistService.updateWishlistItem(id, userId, updateData);

    res.json({
      success: true,
      item,
    });
  } catch (error) {
    
    if (error instanceof Error && error.message === 'Wishlist item not found') {
      res.status(404).json({ error: error.message });
      return;
    }

    res.status(500).json({
      error: 'Failed to update wishlist item',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Delete wishlist item 
router.delete('/:userId/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const id = req.params.id as string;

    const result = await wishlistService.deleteWishlistItem(id, userId);

    res.json(result);
  } catch (error) {
    
    if (error instanceof Error && error.message === 'Wishlist item not found') {
      res.status(404).json({ error: error.message });
      return;
    }

    res.status(500).json({
      error: 'Failed to delete wishlist item',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get single wishlist item
router.get('/:userId/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const id = req.params.id as string;

    const item = await wishlistService.getWishlistItem(id, userId);

    res.json({
      success: true,
      item,
    });
  } catch (error) {
    
    if (error instanceof Error && error.message === 'Wishlist item not found') {
      res.status(404).json({ error: error.message });
      return;
    }

    res.status(500).json({
      error: 'Failed to fetch wishlist item',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;