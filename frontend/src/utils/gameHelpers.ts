import type { LibraryGame } from '../types/games.types';

export const getGameImage = (game: LibraryGame): string => {
  if (game.headerImage) return game.headerImage;
  
  if (game.platform === 'steam' && game.appId) {
    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appId}/library_600x900.jpg`;
  }
  
  return 'https://via.placeholder.com/300x400/1a1a1a/666?text=No+Image';
};

export const is100Percent = (game: LibraryGame): boolean => {
  return !!(game.totalAchievements && game.totalAchievements > 0 && 
           game.completedAchievements === game.totalAchievements);
};

export const getTierColor = (tier: string | null): string => {
  const colors: Record<string, string> = {
    S: 'from-red-500 to-orange-500',
    A: 'from-orange-500 to-yellow-500',
    B: 'from-yellow-500 to-green-500',
    C: 'from-green-500 to-cyan-500',
    D: 'from-cyan-500 to-blue-500',
  };
  return colors[tier || ''] || 'from-gray-500 to-gray-600';
};

export const getRatingColor = (rating: number | null): string => {
  if (!rating) return 'text-gray-500';
  if (rating >= 90) return 'text-blue-400';
  if (rating >= 80) return 'text-green-400';
  if (rating >= 70) return 'text-yellow-400';
  return 'text-orange-400';
};

export const formatRating = (game: LibraryGame): string => {
  if (!game.rating) return '-';
  const percentage = (game.rating / 5) * 100;
  return `${percentage.toFixed(2)}%`;
};

export const getConsoleDisplay = (game: LibraryGame): string | null => {
  if (game.platform !== 'retroachievements') return null;
  return (game as any).platformData?.consoleDisplayName || (game as any).platformData?.consoleName || null;
};