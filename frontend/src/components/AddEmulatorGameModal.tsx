import { useState } from 'react';
import steamService from '../services/steam.service';

interface AddEmulatorGameModalProps {
  userId: string;
  onAdd: () => Promise<void>;
  onClose: () => void;
}

export function AddEmulatorGameModal({ userId, onAdd, onClose }: AddEmulatorGameModalProps) {
  const [formData, setFormData] = useState({
    platform: 'ps2' as 'ps2' | 'ps3',
    gameName: '',
    retroAchievementsId: '',
    playtime: '',
    romFile: '',
  });
  const [searching, setSearching] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearchRetroAchievements = async () => {
    if (!formData.gameName) return;

    setSearching(true);
    try {
      const consoleId = formData.platform === 'ps2' ? 21 : 27;
      const response = await steamService.searchRetroAchievements(
        formData.gameName,
        consoleId
      );

      setSearchResults(response.results || []);
    } catch (err) {
      console.error('Search failed:', err);
      alert('Failed to search RetroAchievements. Make sure API key is configured.');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectGame = (raGame: any) => {
    setFormData({
      ...formData,
      retroAchievementsId: raGame.ID,
      gameName: raGame.Title,
    });
    setSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSyncing(true);

    try {
      await steamService.syncEmulatorGame({
        userId,
        platform: formData.platform,
        gameName: formData.gameName,
        retroAchievementsId: formData.retroAchievementsId || undefined,
        playtimeForever: formData.playtime ? parseFloat(formData.playtime) * 60 : undefined,
        romFile: formData.romFile || undefined,
      });

      await onAdd();
      onClose();
    } catch (err) {
      console.error('Failed to add game:', err);
      alert('Failed to add game');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-4">
          🎮 Add PS2/PS3 Game
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Platform Selector */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Platform</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, platform: 'ps2' });
                  setSearchResults([]);
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                  formData.platform === 'ps2'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }`}
              >
                PS2 (PCSX2)
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, platform: 'ps3' });
                  setSearchResults([]);
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                  formData.platform === 'ps3'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }`}
              >
                PS3 (RPCS3)
              </button>
            </div>
          </div>

          {/* Game Name with Search */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Game Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.gameName}
                onChange={(e) => setFormData({ ...formData, gameName: e.target.value })}
                className="flex-1 px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none"
                placeholder="God of War"
                required
              />
              <button
                type="button"
                onClick={handleSearchRetroAchievements}
                disabled={searching || !formData.gameName}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 whitespace-nowrap"
              >
                {searching ? 'Searching...' : 'Search RA'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Search RetroAchievements to auto-fetch achievements
            </p>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 max-h-48 overflow-y-auto">
              <p className="text-xs text-gray-400 mb-2">Select a game:</p>
              {searchResults.map(game => (
                <button
                  key={game.ID}
                  type="button"
                  onClick={() => handleSelectGame(game)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-700 rounded text-white text-sm transition-colors"
                >
                  {game.Title}
                </button>
              ))}
            </div>
          )}

          {/* Selected RA ID */}
          {formData.retroAchievementsId && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
              <p className="text-sm text-green-300">
                ✓ RetroAchievements linked (ID: {formData.retroAchievementsId})
              </p>
            </div>
          )}

          {/* Playtime */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Playtime (hours)</label>
            <input
              type="number"
              value={formData.playtime}
              onChange={(e) => setFormData({ ...formData, playtime: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none"
              min="0"
              step="0.1"
              placeholder="15.5"
            />
          </div>

          {/* ROM File */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">ROM File (optional)</label>
            <input
              type="text"
              value={formData.romFile}
              onChange={(e) => setFormData({ ...formData, romFile: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none"
              placeholder="God_of_War.iso"
            />
            <p className="text-xs text-gray-500 mt-1">
              File name for reference (not uploaded)
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
            <p className="text-sm text-blue-300">
            RetroAchievements integration requires API credentials in backend .env
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={syncing || !formData.gameName}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 font-semibold"
            >
              {syncing ? 'Adding...' : 'Add Game'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}