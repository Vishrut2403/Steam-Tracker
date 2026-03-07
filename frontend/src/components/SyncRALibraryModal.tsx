import React, { useState } from 'react';
import { retroAchievementsService } from '../services/retroachievements.service';

interface SyncRALibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: () => void;
  userId: string;
}

const SyncRALibraryModal: React.FC<SyncRALibraryModalProps> = ({
  isOpen,
  onClose,
  onSync,
  userId
}) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [syncResult, setSyncResult] = useState<any>(null);

  const handleSync = async () => {
    if (!username.trim()) {
      setError('Please enter your RetroAchievements username');
      return;
    }

    setIsLoading(true);
    setError('');
    setSyncResult(null);

    try {
      console.log('🔄 Starting RA sync for username:', username);
      const result = await retroAchievementsService.syncLibrary(userId, username.trim());
      
      console.log('✅ Sync complete:', result);
      setSyncResult(result.summary);

      setTimeout(() => {
        onSync();
        onClose();
      }, 2000);
      
    } catch (err: any) {
      console.error('❌ Sync failed:', err);
      setError(err.response?.data?.error || 'Failed to sync library. Check your username and API key.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUsername('');
    setError('');
    setSyncResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-white">
          Sync RetroAchievements Library
        </h2>

        {!syncResult ? (
          <>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">
                RetroAchievements Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your RA username"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                disabled={isLoading}
              />
              <p className="text-sm text-gray-400 mt-2">
                Make sure your API key is set in backend .env file
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900 bg-opacity-50 border border-red-500 rounded text-red-200">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSync}
                disabled={isLoading}
                className={`flex-1 py-2 px-4 rounded font-semibold ${
                  isLoading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white transition-colors`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Syncing...
                  </span>
                ) : (
                  'Sync Library'
                )}
              </button>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 p-4 bg-green-900 bg-opacity-50 border border-green-500 rounded">
              <h3 className="text-green-200 font-semibold mb-2">
                Sync Successful!
              </h3>
              <div className="text-sm text-gray-300 space-y-1">
                <p>Total Games Found: {syncResult.totalGames || 0}</p>
                <p>Added: {syncResult.added || 0}</p>
                <p>Updated: {syncResult.updated || 0}</p>
                <p>Skipped: {syncResult.skipped || 0}</p>
                <p className="mt-2 pt-2 border-t border-green-700">
                  Total Points: {syncResult.totalPoints?.toLocaleString() || 0}
                </p>
                <p>Weighted Points: {syncResult.totalTruePoints?.toLocaleString() || 0}</p>
              </div>
            </div>
            <p className="text-center text-gray-400 text-sm">
              Refreshing library...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default SyncRALibraryModal;