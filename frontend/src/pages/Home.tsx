import { useState, useEffect } from 'react';
import steamService from '../services/steam.service';
import SteamWishlist from '../components/SteamWishlist';
import RecommendationSystem from '../components/RecommendationSystem';

interface LibraryGame {
  id: string;
  appId: string;
  name: string;
  playtimeForever: number;
  pricePaid: number | null;
  pricePerHour: number | null;
  status: string | null;
  rating: number | null;
  tier: string | null;
  review: string | null;
  imgIconUrl: string | null;
  headerImage: string | null;
  totalAchievements: number | null;
  completedAchievements: number | null;
  achievementPercentage: number | null;
  userTags: string[];
  genres: string[];
}

type TabType = 'journal' | 'dashboard' | 'wishlist' | 'recommendations';
type SortField = 'name' | 'playtime' | 'pricePaid' | 'pricePerHour' | 'rating' | 'status';
type SortDirection = 'asc' | 'desc';

function Home() {
  const [steamId, setSteamId] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [library, setLibrary] = useState<any>(null);
  const [error, setError] = useState('');
  const [selectedGame, setSelectedGame] = useState<LibraryGame | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<TabType>('journal');
  
  const [editingPrice, setEditingPrice] = useState<{ [appId: string]: string }>({});
  const [savingPrice, setSavingPrice] = useState<string | null>(null);
  const [editingTags, setEditingTags] = useState<{ [appId: string]: string }>({});
  const [savingTags, setSavingTags] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState('');
  const [savingReview, setSavingReview] = useState(false);
  
  const [sortField, setSortField] = useState<SortField>('playtime');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const steamIdFromUrl = params.get('steamId');

    if (steamIdFromUrl) {
      setSteamId(steamIdFromUrl);
      window.history.replaceState({}, '', window.location.pathname);
      loadFromDB(steamIdFromUrl);
    }
  }, []);

  const handleSteamLogin = () => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    window.location.href = `${backendUrl}/api/auth/steam`;
  };

  const loadFromDB = async (idOverride?: string) => {
    const idToUse = idOverride || steamId;
    if (!idToUse.trim()) return;

    setLoading(true);
    setError('');

    try {
      const data = await steamService.getEnrichedLibrary(idToUse);
      setLibrary(data);
    } catch (err) {
      setError('Failed to load library');
    } finally {
      setLoading(false);
    }
  };

  const syncFromSteam = async () => {
    if (!steamId.trim()) return;

    setSyncing(true);
    setError('');

    try {
      await steamService.getLibrary(steamId);
      const data = await steamService.getEnrichedLibrary(steamId);
      setLibrary(data);
    } catch (err) {
      setError('Failed to sync from Steam');
    } finally {
      setSyncing(false);
    }
  };

  const refreshFromDB = async () => {
    try {
      const data = await steamService.getEnrichedLibrary(steamId);
      setLibrary(data);
    } catch (err) {
      console.error('Failed to refresh');
    }
  };

  const updateStatus = async (game: LibraryGame, status: string) => {
    try {
      await steamService.updateGameStatus(steamId, game.appId, status);
      await refreshFromDB();
      if (selectedGame?.appId === game.appId) {
        setSelectedGame({ ...game, status });
      }
    } catch (err) {
      console.error('Failed to update status');
    }
  };

  const updateRating = async (game: LibraryGame, rating: number) => {
    try {
      await steamService.updateGameRating(steamId, game.appId, rating);
      await refreshFromDB();
      if (selectedGame?.appId === game.appId) {
        const tier = { 5: 'S', 4: 'A', 3: 'B', 2: 'C', 1: 'D' }[rating] || null;
        setSelectedGame({ ...game, rating, tier });
      }
    } catch (err) {
      console.error('Failed to update rating');
    }
  };

  const handlePriceChange = (appId: string, value: string) => {
    setEditingPrice((prev) => ({ ...prev, [appId]: value }));
  };

  const handleSavePrice = async (appId: string) => {
    const priceStr = editingPrice[appId];
    const price = parseFloat(priceStr);

    if (isNaN(price) || price < 0) {
      alert('Please enter a valid price');
      return;
    }

    setSavingPrice(appId);

    try {
      await steamService.updateGamePrice(steamId, appId, price);
      await refreshFromDB();
      setEditingPrice((prev) => {
        const newState = { ...prev };
        delete newState[appId];
        return newState;
      });
    } catch (err) {
      alert('Failed to save price');
    } finally {
      setSavingPrice(null);
    }
  };

  const handleTagChange = (appId: string, value: string) => {
    setEditingTags((prev) => ({ ...prev, [appId]: value }));
  };

  const handleSaveTags = async (appId: string) => {
    const tagsStr = editingTags[appId] || '';
    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    setSavingTags(appId);

    try {
      await steamService.updateGameTags(steamId, appId, tags);
      await refreshFromDB();
      setEditingTags((prev) => {
        const newState = { ...prev };
        delete newState[appId];
        return newState;
      });
    } catch (err) {
      alert('Failed to save tags');
    } finally {
      setSavingTags(null);
    }
  };

  const handleSaveReview = async () => {
    if (!selectedGame) return;

    setSavingReview(true);

    try {
      await steamService.updateGameReview(steamId, selectedGame.appId, editingReview);
      await refreshFromDB();
      setSelectedGame({ ...selectedGame, review: editingReview });
    } catch (err) {
      alert('Failed to save review');
    } finally {
      setSavingReview(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortedGames = (games: LibraryGame[]): LibraryGame[] => {
    const sorted = [...games];

    if (sortField === 'playtime') {
      const withPlaytime = sorted.filter((g) => g.playtimeForever > 0);
      const withoutPlaytime = sorted.filter((g) => g.playtimeForever === 0);

      withPlaytime.sort((a, b) => {
        const diff = a.playtimeForever - b.playtimeForever;
        return sortDirection === 'asc' ? diff : -diff;
      });

      return [...withPlaytime, ...withoutPlaytime];
    }

    if (sortField === 'pricePerHour') {
      const withPrice = sorted.filter((g) => 
        g.pricePerHour !== null && 
        g.pricePerHour !== undefined && 
        g.playtimeForever > 0
      );
      const withoutPrice = sorted.filter((g) => 
        g.pricePerHour === null || 
        g.pricePerHour === undefined || 
        g.playtimeForever === 0
      );

      withPrice.sort((a, b) => {
        const aPrice = a.pricePerHour || 0;
        const bPrice = b.pricePerHour || 0;
        return sortDirection === 'asc' ? aPrice - bPrice : bPrice - aPrice;
      });

      return [...withPrice, ...withoutPrice];
    }

    if (sortField === 'pricePaid') {
      const withPrice = sorted.filter((g) => g.pricePaid !== null && g.pricePaid !== undefined);
      const withoutPrice = sorted.filter((g) => g.pricePaid === null || g.pricePaid === undefined);

      withPrice.sort((a, b) => {
        const aPrice = a.pricePaid || 0;
        const bPrice = b.pricePaid || 0;
        return sortDirection === 'asc' ? aPrice - bPrice : bPrice - aPrice;
      });

      return [...withPrice, ...withoutPrice];
    }

    sorted.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);

        case 'rating':
          aVal = a.rating ?? -1;
          bVal = b.rating ?? -1;
          break;

        case 'status':
          const statusOrder = { completed: 0, playing: 1, backlog: 2, unplayed: 3 };
          aVal = statusOrder[a.status as keyof typeof statusOrder] ?? 4;
          bVal = statusOrder[b.status as keyof typeof statusOrder] ?? 4;
          break;

        default:
          return 0;
      }

      const diff = aVal - bVal;
      return sortDirection === 'asc' ? diff : -diff;
    });

    return sorted;
  };

  const getFilteredGames = () => {
    if (!library?.games) return [];
    let filtered = library.games;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter((g: LibraryGame) => g.status === filterStatus);
    }

    return getSortedGames(filtered);
  };

  const filteredGames = getFilteredGames();
  const statusCounts = {
    all: library?.count || 0,
    playing: library?.games.filter((g: LibraryGame) => g.status === 'playing').length || 0,
    completed: library?.games.filter((g: LibraryGame) => g.status === 'completed').length || 0,
    backlog: library?.games.filter((g: LibraryGame) => g.status === 'backlog').length || 0,
  };

  const getGameImage = (game: LibraryGame) => {
    if (game.headerImage) return game.headerImage;
    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appId}/header.jpg`;
  };

  const is100Percent = (game: LibraryGame) => {
    return game.totalAchievements && game.totalAchievements > 0 && 
           game.completedAchievements === game.totalAchievements;
  };

  const getTierColor = (tier: string | null) => {
    const colors: { [key: string]: string } = {
      S: 'from-red-500 to-orange-500',
      A: 'from-orange-500 to-yellow-500',
      B: 'from-yellow-500 to-green-500',
      C: 'from-green-500 to-cyan-500',
      D: 'from-cyan-500 to-blue-500',
    };
    return colors[tier || ''] || 'from-gray-500 to-gray-600';
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
        sortField === field
          ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
          : 'bg-slate-800/50 border border-slate-700/50 text-gray-400 hover:bg-slate-700/50 hover:text-white hover:border-slate-600/50'
      }`}
    >
      <span>{label}</span>
      {sortField === field && (
        <span className="text-blue-400 font-bold text-xs">
          {sortDirection === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </button>
  );

  const getRatingColor = (rating: number | null) => {
    if (!rating) return 'text-gray-500';
    if (rating >= 90) return 'text-blue-400';
    if (rating >= 80) return 'text-green-400';
    if (rating >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const formatRating = (game: LibraryGame) => {
    if (!game.rating) return '-';
    const percentage = (game.rating / 5) * 100;
    return `${percentage.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950 text-gray-100">
        <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-2xl border-b border-slate-800/50 shadow-lg">
          <div className="max-w-[1800px] mx-auto px-8 py-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 shadow-xl shadow-blue-500/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Steam Tracker</h1>
                <p className="text-xs text-gray-400 font-medium">Pro Edition</p>
              </div>
            </div>
          </div>
        </div>

      <div className="max-w-[1800px] mx-auto px-8 py-10">
        {!steamId ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="text-center space-y-8 max-w-md mx-auto px-6">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-slate-800/50 backdrop-blur-2xl border border-slate-700/50 shadow-2xl flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                </svg>
              </div>
              <div className="space-y-3">
                <h2 className="text-4xl font-bold text-white">Welcome</h2>
                <p className="text-gray-400">Connect your Steam account to begin tracking your gaming journey</p>
              </div>
              <button
                onClick={handleSteamLogin}
                className="px-8 py-4 bg-slate-800/50 backdrop-blur-2xl border border-slate-700/50 text-white font-semibold rounded-2xl shadow-2xl hover:bg-slate-700/50 hover:scale-[1.02] transition-all duration-300"
              >
                Sign in with Steam
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-1 p-1.5 bg-slate-900/50 backdrop-blur-2xl rounded-2xl border border-slate-800/50 mb-8 w-fit shadow-xl">
              {[
                { key: 'journal', label: 'Journal' },
                { key: 'dashboard', label: 'Dashboard' },
                { key: 'wishlist', label: 'Wishlist' },
                { key: 'recommendations', label: 'Recommendations' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as TabType)}
                  className={`group relative px-7 py-3 rounded-xl font-semibold text-base transition-all duration-300 ${
                    activeTab === key
                      ? 'bg-blue-600/20 text-white shadow-lg border border-blue-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {label}
                  {activeTab === key && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/20 to-transparent pointer-events-none" />
                  )}
                </button>
              ))}
            </div>

            {/* Toolbar */}
            {activeTab !== 'wishlist' && activeTab !== 'recommendations' && (
              <div className="mb-8">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {[
                      { key: 'all', label: 'All', count: statusCounts.all },
                      { key: 'playing', label: 'Playing', count: statusCounts.playing },
                      { key: 'completed', label: 'Completed', count: statusCounts.completed },
                      { key: 'backlog', label: 'Backlog', count: statusCounts.backlog },
                    ].map(({ key, label, count }) => (
                      <button
                        key={key}
                        onClick={() => setFilterStatus(key)}
                        className={`group px-5 py-2.5 rounded-xl backdrop-blur-2xl transition-all duration-300 ${
                          filterStatus === key
                            ? 'bg-blue-600/20 border border-blue-500/30 text-white shadow-xl'
                            : 'bg-slate-800/50 border border-slate-700/50 text-gray-400 hover:bg-slate-700/50 hover:text-white hover:border-slate-600/50'
                        }`}
                      >
                        <span className="font-semibold">{label}</span>
                        <span className={`ml-2 text-xs ${
                          filterStatus === key ? 'text-blue-300' : 'text-gray-500 group-hover:text-gray-400'
                        }`}>
                          {count}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold mr-2">Sort:</span>
                    <SortButton field="name" label="Name" />
                    <SortButton field="playtime" label="Playtime" />
                    <SortButton field="pricePaid" label="Price" />
                    <SortButton field="pricePerHour" label="Price/Hour" />
                    <SortButton field="rating" label="Rating" />
                  </div>

                  <button
                    onClick={syncFromSteam}
                    disabled={syncing}
                    className="px-6 py-2.5 bg-slate-800/50 backdrop-blur-2xl rounded-xl border border-slate-700/50 font-semibold hover:bg-slate-700/50 hover:scale-[1.02] transition-all duration-300 shadow-xl disabled:opacity-50 text-white"
                  >
                    {syncing ? '⟳ Syncing...' : '⟳ Sync'}
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 backdrop-blur-2xl border border-red-500/20 rounded-2xl text-red-300 shadow-xl">
                {error}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-40">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-slate-800/50 border-t-blue-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin" style={{ animationDelay: '150ms' }} />
                </div>
              </div>
            )}

            {/* Journal View */}
            {activeTab === 'journal' && !loading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-5">
                {filteredGames.map((game: LibraryGame) => (
                  <div
                    key={game.appId}
                    onClick={() => {
                      setSelectedGame(game);
                      setEditingReview(game.review || '');
                    }}
                    className="group relative cursor-pointer"
                  >
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.5)] hover:border-blue-500/30">
                      <img
                        src={getGameImage(game)}
                        alt={game.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/300x400/1a1a1a/666?text=No+Image';
                        }}
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

                      {is100Percent(game) && (
                        <div className="absolute top-3 left-3 w-11 h-11 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-2xl shadow-yellow-500/50 backdrop-blur-sm">
                          <span className="text-white text-xl font-bold">★</span>
                        </div>
                      )}

                      {game.tier && (
                        <div className={`absolute top-3 right-3 w-11 h-11 bg-gradient-to-br ${getTierColor(game.tier)} rounded-xl flex items-center justify-center shadow-2xl backdrop-blur-sm font-bold text-white text-lg`}>
                          {game.tier}
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent backdrop-blur-sm">
                        <h3 className="text-sm font-bold text-white line-clamp-2 drop-shadow-2xl mb-2">
                          {game.name}
                        </h3>
                        
                        {game.totalAchievements && game.totalAchievements > 0 && (
                          <div className="relative h-2 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm">
                            <div
                              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                              style={{ width: `${game.achievementPercentage || 0}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Dashboard - Steam-Style Table */}
            {activeTab === 'dashboard' && !loading && (
              <div className="bg-slate-900/50 backdrop-blur-2xl rounded-2xl border border-slate-800/50 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800/50 backdrop-blur-2xl border-b border-slate-700/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Price/Hour</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Price</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Time</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Rating</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Tags</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGames.map((game: LibraryGame, index: number) => {
                        const hours = (game.playtimeForever / 60).toFixed(1);
                        const isEditingTag = editingTags[game.appId] !== undefined;
                        const isSavingTag = savingTags === game.appId;
                        
                        return (
                          <tr
                            key={game.appId}
                            className={`border-b border-slate-800/50 transition-all duration-300 ${
                              index % 2 === 0 ? 'bg-slate-900/30 hover:bg-slate-800/50' : 'bg-slate-900/20 hover:bg-slate-800/50'
                            }`}
                          >
                            {/* Name Column */}
                            <td className="px-6 py-4">
                              <div 
                                className="flex items-center gap-4 cursor-pointer"
                                onClick={() => {
                                  setSelectedGame(game);
                                  setEditingReview(game.review || '');
                                }}
                              >
                                <div className="relative w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-slate-700/50">
                                  <img
                                    src={getGameImage(game)}
                                    alt={game.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src = 'https://via.placeholder.com/300x400/1a1a1a/666?text=No+Image';
                                    }}
                                  />
                                  {game.tier && (
                                    <div className={`absolute top-1 right-1 w-6 h-6 bg-gradient-to-br ${getTierColor(game.tier)} rounded-md flex items-center justify-center text-white text-xs font-bold`}>
                                      {game.tier}
                                    </div>
                                  )}
                                </div>
                                <span className="text-white font-medium">{game.name}</span>
                              </div>
                            </td>

                            {/* Price/Hour */}
                            <td className="px-6 py-4 text-right">
                              {game.pricePerHour ? (
                                <span className={`font-semibold ${
                                  game.pricePerHour < 10 ? 'text-emerald-400' :
                                  game.pricePerHour < 50 ? 'text-yellow-400' : 
                                  game.pricePerHour < 100 ? 'text-orange-400' : 'text-red-400'
                                }`}>
                                  {game.pricePerHour.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-gray-600">-</span>
                              )}
                            </td>

                            {/* Price */}
                            <td
                              className="px-6 py-4 text-right"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {editingPrice[game.appId] !== undefined ? (
                                <div className="flex items-center justify-end gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={editingPrice[game.appId]}
                                    onChange={(e) =>
                                      handlePriceChange(game.appId, e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSavePrice(game.appId);
                                      if (e.key === 'Escape') {
                                        setEditingPrice((prev) => {
                                          const newState = { ...prev };
                                          delete newState[game.appId];
                                          return newState;
                                        });
                                      }
                                    }}
                                    className="w-24 px-3 py-1.5 bg-slate-800/50 backdrop-blur-sm border border-blue-500/50 rounded-lg text-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleSavePrice(game.appId)}
                                    disabled={savingPrice === game.appId}
                                    className="px-3 py-1.5 bg-green-600/20 border border-green-500/30 text-green-300 text-xs font-semibold rounded-lg hover:bg-green-600/30 transition-all duration-300 disabled:opacity-50"
                                  >
                                    {savingPrice === game.appId ? '...' : 'Save'}
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-2">
                                  <span className="text-gray-300 font-medium">
                                    {game.pricePaid !== null && game.pricePaid !== undefined
                                      ? `₹ ${game.pricePaid.toFixed(0)}`
                                      : 'Free'}
                                  </span>
                                  <button
                                    onClick={() =>
                                      setEditingPrice((prev) => ({
                                        ...prev,
                                        [game.appId]: game.pricePaid?.toString() || '',
                                      }))
                                    }
                                    className="text-gray-500 hover:text-blue-400 text-xs transition-colors"
                                  >
                                    ✎
                                  </button>
                                </div>
                              )}
                            </td>

                            {/* Time */}
                            <td className="px-6 py-4 text-right">
                              <span className="text-white font-medium">{hours}h</span>
                            </td>

                            {/* Rating */}
                            <td className="px-6 py-4 text-center">
                              <span className={`font-semibold ${getRatingColor(game.rating)}`}>
                                {formatRating(game)}
                              </span>
                            </td>

                            {/* Tags - EDITABLE */}
                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                              {isEditingTag ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={editingTags[game.appId]}  
                                    onChange={(e) => handleTagChange(game.appId, e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveTags(game.appId);
                                      if (e.key === 'Escape') setEditingTags((prev) => {
                                        const newState = { ...prev };
                                        delete newState[game.appId];
                                        return newState;
                                      });
                                    }}
                                    placeholder="tag1, tag2, tag3"
                                    className="flex-1 px-3 py-1.5 bg-slate-800/50 backdrop-blur-sm border border-blue-500/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleSaveTags(game.appId)}
                                    disabled={isSavingTag}
                                    className="px-3 py-1.5 bg-green-600/20 backdrop-blur-sm border border-green-500/30 text-green-300 text-xs font-semibold rounded-lg hover:bg-green-600/30 transition-all duration-300"
                                  >
                                    {isSavingTag ? '...' : 'Save'}
                                  </button>
                                </div>
                              ) : (
                                <div className="flex gap-2 flex-wrap items-center">
                                  {game.userTags?.map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-3 py-1 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700/50 text-xs font-medium text-gray-300"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  <button
                                    onClick={() => setEditingTags((prev) => ({
                                      ...prev,
                                      [game.appId]: game.userTags?.join(', ') || '',
                                    }))}
                                    className="px-3 py-1 text-gray-500 hover:text-blue-400 text-xs transition-colors"
                                  >
                                    {game.userTags?.length ? '✎' : '+ Tag'}
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Wishlist */}
            {activeTab === 'wishlist' && (
              <SteamWishlist userId={library?.games[0]?.userId || ''} />
            )}

            {/* Recommendations */}
            {activeTab === 'recommendations' && (
              <RecommendationSystem userId={library?.games[0]?.userId || ''} />
            )}

            {/* Empty */}
            {filteredGames.length === 0 && !loading && activeTab !== 'wishlist' && activeTab !== 'recommendations' && (
              <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center mx-auto px-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-slate-800/50 backdrop-blur-2xl border border-slate-700/50 flex items-center justify-center shadow-xl">
                    <span className="text-4xl">🎮</span>
                  </div>
                  <p className="text-gray-400 text-lg font-medium">No games found</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {selectedGame && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-2xl"
          onClick={() => setSelectedGame(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900/90 backdrop-blur-3xl rounded-3xl shadow-2xl border border-slate-800/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-80 overflow-hidden rounded-t-3xl">
              <img
                src={getGameImage(selectedGame)}
                alt={selectedGame.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
              
              <button
                onClick={() => setSelectedGame(null)}
                className="absolute top-6 right-6 w-12 h-12 bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-slate-700/50 flex items-center justify-center text-white text-2xl hover:bg-slate-800/60 hover:scale-110 transition-all duration-300"
              >
                ×
              </button>

              {selectedGame.tier && (
                <div className={`absolute top-6 left-6 w-16 h-16 bg-gradient-to-br ${getTierColor(selectedGame.tier)} rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-2xl backdrop-blur-sm`}>
                  {selectedGame.tier}
                </div>
              )}
            </div>

            <div className="p-8 space-y-8">
              <h2 className="text-3xl font-bold text-white">{selectedGame.name}</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-slate-800/50 backdrop-blur-2xl rounded-2xl border border-slate-700/50 shadow-xl">
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-semibold">Playtime</p>
                  <p className="text-3xl font-bold text-white">{Math.round(selectedGame.playtimeForever / 60)}h</p>
                </div>

                {selectedGame.pricePerHour && (
                  <div className="p-6 bg-slate-800/50 backdrop-blur-2xl rounded-2xl border border-slate-700/50 shadow-xl">
                    <p className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-semibold">Value</p>
                    <p className="text-3xl font-bold text-emerald-400">₹{selectedGame.pricePerHour.toFixed(2)}/h</p>
                  </div>
                )}
              </div>

              {selectedGame.totalAchievements && selectedGame.totalAchievements > 0 && (
                <div className="p-6 bg-slate-800/50 backdrop-blur-2xl rounded-2xl border border-slate-700/50 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-300">Achievements</p>
                    <p className="text-sm font-semibold text-white">
                      {selectedGame.completedAchievements} / {selectedGame.totalAchievements}
                      <span className="text-gray-400 ml-2">({selectedGame.achievementPercentage}%)</span>
                    </p>
                  </div>
                  <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                      style={{ width: `${selectedGame.achievementPercentage || 0}%` }}
                    />
                  </div>
                </div>
              )}

              {selectedGame.userTags && selectedGame.userTags.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-300 mb-3">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedGame.userTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-4 py-2 bg-slate-800/50 backdrop-blur-2xl rounded-full border border-slate-700/50 text-sm font-medium text-gray-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-6 bg-slate-800/50 backdrop-blur-2xl rounded-2xl border border-slate-700/50 shadow-xl">
                <label className="block text-sm font-semibold text-gray-300 mb-3">Personal Review</label>
                <textarea
                  value={editingReview}
                  onChange={(e) => setEditingReview(e.target.value)}
                  className="w-full h-32 px-4 py-3 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 text-white placeholder-gray-500 resize-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300"
                  placeholder="Share your thoughts..."
                  maxLength={2000}
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400">{editingReview.length}/2000</span>
                  <button
                    onClick={handleSaveReview}
                    disabled={savingReview}
                    className="px-6 py-2 bg-slate-700/50 backdrop-blur-2xl border border-slate-600/50 rounded-xl font-semibold hover:bg-slate-600/50 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 text-white"
                  >
                    {savingReview ? 'Saving...' : 'Save Review'}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-300 mb-3">Status</p>
                <div className="grid grid-cols-4 gap-3">
                  {(['playing', 'completed', 'backlog', 'unplayed'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(selectedGame, status)}
                      className={`px-4 py-3 rounded-xl font-semibold capitalize transition-all duration-300 ${
                        selectedGame.status === status
                          ? 'bg-blue-600/20 backdrop-blur-2xl border border-blue-500/30 text-white shadow-xl'
                          : 'bg-slate-800/50 backdrop-blur-2xl border border-slate-700/50 text-gray-400 hover:bg-slate-700/50 hover:text-white hover:border-slate-600/50'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-300 mb-3">Rating</p>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => updateRating(selectedGame, star)}
                      className={`flex-1 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300 ${
                        selectedGame.rating && selectedGame.rating >= star
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-2xl'
                          : 'bg-slate-800/50 backdrop-blur-2xl border border-slate-700/50 text-gray-700 hover:bg-slate-700/50 hover:scale-[1.05]'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;