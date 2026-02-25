import prisma from '../prisma';

class WishlistService {
  // Get all wishlist items for user 
  async getUserWishlist(userId: string) {
    const items = await prisma.steamWishlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return items;
  }

  // Create new wishlist item 
  async createWishlistItem(userId: string, data: {
    name: string;
    tags: string[];
    listPrice: number;
    currentPrice: number;
  }) {
    const discountPercent = data.listPrice > 0 
      ? Math.round(((data.listPrice - data.currentPrice) / data.listPrice) * 100)
      : 0;

    const item = await prisma.steamWishlist.create({
      data: {
        userId,
        name: data.name,
        tags: data.tags,
        listPrice: data.listPrice,
        currentPrice: data.currentPrice,
        discountPercent,
      },
    });

    return item;
  }

  // Update wishlist item 
  async updateWishlistItem(id: string, userId: string, data: {
    name?: string;
    tags?: string[];
    listPrice?: number;
    currentPrice?: number;
  }) {
    const existing = await prisma.steamWishlist.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Wishlist item not found');
    }

    const listPrice = data.listPrice ?? existing.listPrice;
    const currentPrice = data.currentPrice ?? existing.currentPrice;
    const discountPercent = listPrice > 0 
      ? Math.round(((listPrice - currentPrice) / listPrice) * 100)
      : 0;

    const updated = await prisma.steamWishlist.update({
      where: { id },
      data: {
        ...data,
        discountPercent,
        updatedAt: new Date(),
      },
    });

    return updated;
  }

  // Delete wishlist item 
  async deleteWishlistItem(id: string, userId: string) {
    const existing = await prisma.steamWishlist.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Wishlist item not found');
    }

    await prisma.steamWishlist.delete({
      where: { id },
    });

    return { success: true, id };
  }

  // Get single wishlist item 
  async getWishlistItem(id: string, userId: string) {
    const item = await prisma.steamWishlist.findFirst({
      where: { id, userId },
    });

    if (!item) {
      throw new Error('Wishlist item not found');
    }

    return item;
  }
}

export default new WishlistService();