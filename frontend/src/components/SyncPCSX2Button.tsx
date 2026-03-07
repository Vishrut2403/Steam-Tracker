import { useState } from 'react';
import axios from 'axios';

interface SyncPCSX2ButtonProps {
  userId: string;
  onSync: () => void;
}

export const SyncPCSX2Button: React.FC<SyncPCSX2ButtonProps> = ({ userId, onSync }) => {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);

    try {
      const response = await axios.post('http://localhost:3001/api/pcsx2/sync', { userId });
      
      const { summary } = response.data;
      setResult(`✅ Synced ${summary.updated} games! (${summary.notFound} not matched)`);
      
      setTimeout(() => {
        onSync();
      }, 1500);
    } catch (err: any) {
      console.error('PCSX2 sync failed:', err);
      setResult(err.response?.data?.error || 'Failed to sync PCSX2 playtimes');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleSync}
        disabled={syncing}
        className="w-full px-4 py-3 bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-xl font-semibold hover:bg-purple-600/30 transition-all duration-300 disabled:opacity-50"
      >
        {syncing ? '⏳ Syncing PCSX2...' : '🎮 Sync PCSX2 Playtime'}
      </button>
      
      {result && (
        <p className={`mt-2 text-sm ${result.startsWith('✅') ? 'text-green-300' : 'text-red-300'}`}>
          {result}
        </p>
      )}
    </div>
  );
};