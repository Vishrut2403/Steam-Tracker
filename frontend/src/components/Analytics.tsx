import { useState } from 'react';
import type { LibraryGame } from '../types/games.types';
import { AnalyticsDashboardPage } from './analytics/AnalyticsDashboardPage';
import { AnalyticsPlaytimePage } from './analytics/AnalyticsPlaytimePage';
import { AnalyticsAchievementsPage } from './analytics/AnalyticsAchievementsPage';
import { AnalyticsValuePage } from './analytics/AnalyticsValuePage';
import { AnalyticsLibraryPage } from './analytics/AnalyticsLibraryPage';

interface AnalyticsProps {
  games: LibraryGame[];
}

type AnalyticsTab = 'dashboard' | 'playtime' | 'achievements' | 'value' | 'library';

export const Analytics: React.FC<AnalyticsProps> = ({ games }) => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('dashboard');

  const tabs = [
    { key: 'dashboard' as const, label: 'Dashboard', icon: '📊' },
    { key: 'playtime' as const, label: 'Playtime', icon: '⏱️' },
    { key: 'achievements' as const, label: 'Achievements', icon: '🏆' },
    { key: 'value' as const, label: 'Value', icon: '💰' },
    { key: 'library' as const, label: 'Library', icon: '📚' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-gray-400">Deep insights into your gaming library</p>
      </div>

      {/* Sub-navigation */}
      <div className="flex gap-1 p-1.5 bg-slate-900/50 rounded-2xl border border-slate-800/50 w-fit shadow-md">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`group relative px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 flex items-center gap-2 ${
              activeTab === key
                ? 'bg-blue-600/20 text-white shadow-lg border border-blue-500/30'
                : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>{icon}</span>
            <span>{label}</span>
            {activeTab === key && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/20 to-transparent pointer-events-none" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'dashboard' && <AnalyticsDashboardPage games={games} />}
        {activeTab === 'playtime' && <AnalyticsPlaytimePage games={games} />}
        {activeTab === 'achievements' && <AnalyticsAchievementsPage games={games} />}
        {activeTab === 'value' && <AnalyticsValuePage games={games} />}
        {activeTab === 'library' && <AnalyticsLibraryPage games={games} />}
      </div>
    </div>
  );
};