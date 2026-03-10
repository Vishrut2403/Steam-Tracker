import { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import type { LibraryGame } from '../../types/games.types';
import { GameActivityHeatmap } from '../GameActivityHeatmap';

interface AnalyticsDashboardPageProps {
  games: LibraryGame[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f97316'];

export const AnalyticsDashboardPage: React.FC<AnalyticsDashboardPageProps> = ({ games }) => {
  
  const stats = useMemo(() => {
    const totalGames = games.length;
    const totalPlaytime = games.reduce((sum, g) => sum + (g.playtimeForever || 0), 0);
    const totalAchievements = games.reduce((sum, g) => sum + (g.completedAchievements || 0), 0);
    const possibleAchievements = games.reduce((sum, g) => sum + (g.totalAchievements || 0), 0);
    
    const gamesWithAchievements = games.filter(g => (g.totalAchievements || 0) > 0);
    const avgCompletion = gamesWithAchievements.length > 0
      ? gamesWithAchievements.reduce((sum, g) => {
          const rate = (g.completedAchievements || 0) / (g.totalAchievements || 1);
          return sum + rate;
        }, 0) / gamesWithAchievements.length
      : 0;
    
    const perfectGames = games.filter(g => 
      g.totalAchievements && 
      g.totalAchievements > 0 && 
      g.completedAchievements === g.totalAchievements
    ).length;
    
    return {
      totalGames,
      totalPlaytime,
      totalAchievements,
      possibleAchievements,
      avgCompletion,
      perfectGames
    };
  }, [games]);
  
  const platformData = useMemo(() => {
    const platformMap = games.reduce((acc, game) => {
      acc[game.platform] = (acc[game.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(platformMap).map(([name, value]) => ({ name, value }));
  }, [games]);
  
  const platformRadarData = useMemo(() => {
    const platformStats = games.reduce((acc, game) => {
      const platform = game.platform;
      if (!acc[platform]) {
        acc[platform] = {
          games: 0,
          hours: 0,
          achievements: 0,
          totalAchievements: 0
        };
      }
      acc[platform].games += 1;
      acc[platform].hours += Math.round((game.playtimeForever || 0) / 60);
      acc[platform].achievements += (game.completedAchievements || 0);
      acc[platform].totalAchievements += (game.totalAchievements || 0);
      return acc;
    }, {} as Record<string, any>);

    const maxGames = Math.max(...Object.values(platformStats).map((p: any) => p.games));
    const maxHours = Math.max(...Object.values(platformStats).map((p: any) => p.hours));
    const maxAchievements = Math.max(...Object.values(platformStats).map((p: any) => p.achievements));

    const metrics = ['Games', 'Hours', 'Achievements', 'Completion %'];
    
    return metrics.map(metric => {
      const dataPoint: any = { metric };
      
      Object.keys(platformStats).forEach(platform => {
        const stats = platformStats[platform];
        
        switch(metric) {
          case 'Games':
            dataPoint[platform] = maxGames > 0 ? (stats.games / maxGames) * 100 : 0;
            break;
          case 'Hours':
            dataPoint[platform] = maxHours > 0 ? (stats.hours / maxHours) * 100 : 0;
            break;
          case 'Achievements':
            dataPoint[platform] = maxAchievements > 0 ? (stats.achievements / maxAchievements) * 100 : 0;
            break;
          case 'Completion %':
            dataPoint[platform] = stats.totalAchievements > 0 
              ? (stats.achievements / stats.totalAchievements) * 100 
              : 0;
            break;
        }
      });
      
      return dataPoint;
    });
  }, [games]);

  const platformNames = useMemo(() => {
    return Array.from(new Set(games.map(g => g.platform)));
  }, [games]);
  
  const statusData = useMemo(() => {
    const statusMap = games.reduce((acc, game) => {
      const status = game.status || 'unplayed';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(statusMap).map(([name, value]) => ({ 
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value 
    }));
  }, [games]);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🎮</span>
            <span className="text-sm text-gray-400">Total Games</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalGames}</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">⏱️</span>
            <span className="text-sm text-gray-400">Total Playtime</span>
          </div>
          <div className="text-3xl font-bold text-white">{formatTime(stats.totalPlaytime)}</div>
          <div className="text-xs text-gray-500 mt-1">{Math.round(stats.totalPlaytime / 60)}h total</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🏆</span>
            <span className="text-sm text-gray-400">Achievements</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalAchievements}/{stats.possibleAchievements}</div>
          <div className="text-xs text-gray-500 mt-1">{stats.possibleAchievements > 0 ? Math.round((stats.totalAchievements / stats.possibleAchievements) * 100) : 0}% unlocked</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📊</span>
            <span className="text-sm text-gray-400">Avg Completion</span>
          </div>
          <div className="text-3xl font-bold text-white">{Math.round(stats.avgCompletion * 100)}%</div>
          <div className="text-xs text-gray-500 mt-1">across all games</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">💯</span>
            <span className="text-sm text-gray-400">Perfect Games</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.perfectGames}</div>
          <div className="text-xs text-gray-500 mt-1">100% completion</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Comparison - Radar Chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Platform Comparison</h3>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={platformRadarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="metric" stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis stroke="#9ca3af" domain={[0, 100]} />
              {platformNames.map((platform, idx) => (
                <Radar
                  key={platform}
                  name={platform}
                  dataKey={platform}
                  stroke={COLORS[idx % COLORS.length]}
                  fill={COLORS[idx % COLORS.length]}
                  fillOpacity={0.4}
                />
              ))}
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9' }}
                formatter={(value: any) => `${Math.round(value)}%`}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Distribution Pie */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Games per Platform</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={platformData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {platformData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Heatmap */}
      <GameActivityHeatmap games={games} userId={games[0]?.userId || ''} />

      {/* Game Status Pie */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Game Status</h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={statusData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={140}
              label={({ name, value, percent }) => `${name}: ${value} (${percent ? (percent * 100).toFixed(0) : 0}%)`}
            >
              {statusData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
              labelStyle={{ color: '#f1f5f9' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};