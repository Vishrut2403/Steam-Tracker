import type { LibraryGame } from '../types/games.types';
import { PlatformBadge } from './PlatformBadge';

interface GameCardProps {
  game: LibraryGame;
  onClick: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onClick }) => {
  const getGameImage = (game: LibraryGame) => {
    if (game.imageUrl) return game.imageUrl;
    
    // For Steam games, extract appId from platformGameId
    if (game.platform === 'steam') {
      return `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.platformGameId}/library_600x900.jpg`;
    }
    
    return 'https://via.placeholder.com/300x400/1a1a1a/666?text=No+Image';
  };

  const is100Percent = () => {
    return game.achievementsTotal && game.achievementsTotal > 0 && 
           game.achievementsEarned === game.achievementsTotal;
  };

  const getAchievementPercentage = () => {
    if (!game.achievementsTotal || game.achievementsTotal === 0) return 0;
    return Math.round(((game.achievementsEarned || 0) / game.achievementsTotal) * 100);
  };

  const getConsoleDisplay = () => {
    if (game.platform !== 'retroachievements') return null;
    return (game as any).platformData?.consoleDisplayName || (game as any).platformData?.consoleName || null;
  };

  const consoleDisplay = getConsoleDisplay();

  return (
    <div onClick={onClick} className="group relative cursor-pointer">
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900/50 border border-slate-800/50 shadow-md transition-all duration-500 hover:border-blue-500/40">
        <img
          src={getGameImage(game)}
          alt={game.name}
          className="w-full h-full object-cover transition-transform duration-700"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/300x400/1a1a1a/666?text=No+Image';
          }}
        />
        
        <div className="absolute inset-0 bg-black/40 opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

        {/* Platform Badge */}
        <div className="absolute top-3 left-3">
          <PlatformBadge platform={game.platform} />
        </div>

        {/* 100% Achievement Badge */}
        {is100Percent() && (
          <div className="absolute top-3 right-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl px-2 py-1 flex items-center gap-1 shadow-lg">
            <span className="text-white text-base">🏆</span>
            <span className="text-white text-[10px] font-bold">100%</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
          <h3 className="text-sm font-bold text-white line-clamp-2 drop-shadow-2xl mb-2">
            {game.name}
          </h3>
          
          {/* Console badge for RA games */}
          {consoleDisplay && (
            <div className="mb-2">
              <span className="text-xs px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-300 font-medium">
                {consoleDisplay}
              </span>
            </div>
          )}
          
          {/* Achievement Progress Bar */}
          {game.achievementsTotal && game.achievementsTotal > 0 && (
            <div className="relative h-2 bg-slate-800/50 rounded-full overflow-hidden">
              <div
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${getAchievementPercentage()}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};