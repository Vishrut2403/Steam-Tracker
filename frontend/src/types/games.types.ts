// Frontend types that match the Prisma schema exactly

export type Platform = 
  | 'steam' 
  | 'retroachievements' 
  | 'pcsx2' 
  | 'rpcs3' 
  | 'ppsspp' 
  | 'apple_gc' 
  | 'minecraft';

export type GameStatus = 'playing' | 'completed' | 'backlog' | 'unplayed';

export type TabType = 'profile' | 'library' | 'journal' | 'dashboard' | 'wishlist' | 'recommendations' | 'smart-recommendations' | 'analytics' | 'tierlist';

export type SortField = 'name' | 'playtime' | 'rating' | 'status' | 'pricePerHour' | 'pricePaid';
export type SortDirection = 'asc' | 'desc';

export interface LibraryGame {
  id: string;
  userId: string;
  platform: Platform;
  platformGameId: string;  // This is the appId for Steam games
  name: string;
  imageUrl: string | null;
  playtimeForever: number;  // minutes
  lastPlayedAt: Date | null;
  
  // User data
  status: GameStatus | null;
  rating: number | null;  // 1-5 stars
  review: string | null;
  userTags: string[];
  
  // Steam-specific
  pricePaid: number | null;
  pricePerHour: number | null;
  
  // Achievement data
  achievementsTotal: number | null;
  achievementsEarned: number | null;
  
  // Platform-specific metadata (JSON)
  platformData?: {
    // RetroAchievements
    consoleId?: number;
    consoleName?: string;
    consoleDisplayName?: string;
    
    // PCSX2/RPCS3/PPSSPP
    gameId?: string;
    region?: string;
    
    // Minecraft
    version?: string;
    
    // Any other platform-specific data
    [key: string]: any;
  } | null;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface GameSession {
  id: string;
  userId: string;
  gameId: string;
  platform: Platform;
  date: Date;  // Start of day (UTC)
  minutes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameJournalEntry {
  id: string;
  userId: string;
  gameId: string;
  heading: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SteamWishlistItem {
  id: string;
  userId: string;
  appId: string;
  name: string;
  tags: string[];
  listPrice: number;
  currentPrice: number;
  discountPercent: number;
  recommendationScore: number | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  
  xp: number;
  level: number;
  
  steamId: string | null;
  steamUsername: string | null;
  steamAvatar: string | null;
  steamLinkedAt: Date | null;
  
  raUsername: string | null;
  raApiKey: string | null;
  raLinkedAt: Date | null;
  
  enablePCSX2: boolean;
  enableRPCS3: boolean;
  enablePPSSPP: boolean;
  
  autoSyncSteam: boolean;
  autoSyncRA: boolean;
  autoSyncEmulators: boolean;
  
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}