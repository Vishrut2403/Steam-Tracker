import { useMemo } from 'react';
import { ScatterChart, Scatter, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import type { LibraryGame } from '../../types/games.types';

interface AnalyticsValuePageProps {
  games: LibraryGame[];
}

export const AnalyticsValuePage: React.FC<AnalyticsValuePageProps> = ({ games }) => {
  
  const paidGames = useMemo(() => {
    return games.filter(g => (g.pricePaid || 0) > 0);
  }, [games]);
  
  const scatterData = useMemo(() => {
    return paidGames
      .filter(g => (g.playtimeForever || 0) > 0)
      .map(g => ({
        name: g.name,
        hours: (g.playtimeForever || 0) / 60,
        price: g.pricePaid || 0,
        pricePerHour: (g.pricePaid || 0) / ((g.playtimeForever || 0) / 60)
      }));
  }, [paidGames]);
  
  const bestValue = useMemo(() => {
    return [...paidGames]
      .filter(g => (g.playtimeForever || 0) >= 60) 
      .map(g => ({
        name: g.name.length > 30 ? g.name.substring(0, 30) + '...' : g.name,
        pricePerHour: (g.pricePaid || 0) / ((g.playtimeForever || 0) / 60),
        hours: (g.playtimeForever || 0) / 60,
        price: g.pricePaid || 0
      }))
      .sort((a, b) => a.pricePerHour - b.pricePerHour)
      .slice(0, 10);
  }, [paidGames]);
  
  const mostExpensive = useMemo(() => {
    return [...paidGames]
      .sort((a, b) => (b.pricePaid || 0) - (a.pricePaid || 0))
      .slice(0, 10)
      .map(g => ({
        name: g.name.length > 30 ? g.name.substring(0, 30) + '...' : g.name,
        price: g.pricePaid || 0
      }));
  }, [paidGames]);
  
  const pricePerHour = useMemo(() => {
    return [...paidGames]
      .filter(g => (g.playtimeForever || 0) >= 60) 
      .map(g => ({
        name: g.name.length > 30 ? g.name.substring(0, 30) + '...' : g.name,
        pricePerHour: (g.pricePaid || 0) / ((g.playtimeForever || 0) / 60)
      }))
      .sort((a, b) => a.pricePerHour - b.pricePerHour)
      .slice(0, 10);
  }, [paidGames]);
  
  const stats = useMemo(() => {
    const totalSpent = paidGames.reduce((sum, g) => sum + (g.pricePaid || 0), 0);
    const totalHours = paidGames.reduce((sum, g) => sum + (g.playtimeForever || 0), 0) / 60;
    const avgPrice = totalSpent / paidGames.length;
    const avgPricePerHour = totalHours > 0 ? totalSpent / totalHours : 0;
    
    return {
      totalSpent,
      totalHours,
      avgPrice,
      avgPricePerHour
    };
  }, [paidGames]);
  
  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="text-gray-400 text-sm mb-2">Total Spent</div>
          <div className="text-3xl font-bold text-white">{formatCurrency(stats.totalSpent)}</div>
          <div className="text-xs text-gray-500 mt-1">
            {paidGames.length} games purchased
          </div>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="text-gray-400 text-sm mb-2">Average Game Price</div>
          <div className="text-3xl font-bold text-white">{formatCurrency(stats.avgPrice)}</div>
          <div className="text-xs text-gray-500 mt-1">
            Per game
          </div>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="text-gray-400 text-sm mb-2">Total Hours</div>
          <div className="text-3xl font-bold text-white">{Math.round(stats.totalHours)}h</div>
          <div className="text-xs text-gray-500 mt-1">
            On paid games
          </div>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="text-gray-400 text-sm mb-2">Avg Price/Hour</div>
          <div className="text-3xl font-bold text-white">{formatCurrency(stats.avgPricePerHour)}</div>
          <div className="text-xs text-gray-500 mt-1">
            Cost per hour
          </div>
        </div>
      </div>
      
      {/* Price vs Playtime Scatter Plot */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-2">Price vs Playtime</h3>
        <p className="text-sm text-gray-400 mb-4">
          Bottom-right = best value (high hours, low price) • Top-left = worst value
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              type="number" 
              dataKey="hours" 
              name="Hours" 
              stroke="#9ca3af"
              label={{ value: 'Hours Played', position: 'insideBottom', offset: -10, fill: '#9ca3af' }}
            />
            <YAxis 
              type="number" 
              dataKey="price" 
              name="Price" 
              stroke="#9ca3af"
              label={{ value: 'Price (₹)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
            />
            <ZAxis type="number" dataKey="pricePerHour" range={[50, 400]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
              labelStyle={{ color: '#f1f5f9' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                      <div className="font-semibold text-white mb-2">{data.name}</div>
                      <div className="text-sm text-gray-300 space-y-1">
                        <div>Hours: {data.hours.toFixed(1)}h</div>
                        <div>Price: {formatCurrency(data.price)}</div>
                        <div>₹/hour: {formatCurrency(data.pricePerHour)}</div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter data={scatterData} fill="#3b82f6" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      
      {/* Best Value Games */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Best Value Games (Lowest $/Hour)</h3>
        <div className="space-y-3">
          {bestValue.map((game, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:border-green-500/50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center font-bold text-green-300">
                  {idx + 1}
                </div>
                <div>
                  <div className="font-semibold text-white">{game.name}</div>
                  <div className="text-sm text-gray-400">
                    {game.hours.toFixed(1)}h played • {formatCurrency(game.price)} paid
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">
                  {formatCurrency(game.pricePerHour)}
                </div>
                <div className="text-xs text-gray-500">per hour</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Most Expensive + Price Per Hour */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Most Expensive Games</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={mostExpensive} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="name" type="category" stroke="#9ca3af" width={150} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9' }}
                formatter={(value: any) => [formatCurrency(value), 'Price']}
              />
              <Bar dataKey="price" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Price per Hour Ranking</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={pricePerHour} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="name" type="category" stroke="#9ca3af" width={150} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9' }}
                formatter={(value: any) => [formatCurrency(value) + '/hour', 'Cost']}
              />
              <Bar dataKey="pricePerHour" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};