interface PlatformBadgeProps {
  platform: string;
  className?: string;
  showLabel?: boolean;
}

export function PlatformBadge({ platform, className = '', showLabel = true }: PlatformBadgeProps) {
  const badges: Record<string, { icon: string; label: string; color: string }> = {
    steam: { 
      icon: '🎮', 
      label: 'Steam', 
      color: 'bg-blue-900/30 border-blue-500/30 text-blue-300' 
    },
    apple_gc: { 
      icon: '🍎', 
      label: 'iOS', 
      color: 'bg-gray-900/30 border-gray-500/30 text-gray-300' 
    },
    minecraft: { 
      icon: '⛏️', 
      label: 'Minecraft', 
      color: 'bg-green-900/30 border-green-500/30 text-green-300' 
    },
    ps2: { 
      icon: '🎮', 
      label: 'PS2', 
      color: 'bg-purple-900/30 border-purple-500/30 text-purple-300' 
    },
    ps3: { 
      icon: '🎮', 
      label: 'PS3', 
      color: 'bg-indigo-900/30 border-indigo-500/30 text-indigo-300' 
    },
  };

  const badge = badges[platform] || { 
    icon: '📝', 
    label: 'Other', 
    color: 'bg-slate-900/30 border-slate-500/30 text-slate-300' 
  };

  if (!showLabel) {
    return (
      <span className={`text-lg ${className}`} title={badge.label}>
        {badge.icon}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium backdrop-blur-sm ${badge.color} ${className}`}>
      <span>{badge.icon}</span>
      <span>{badge.label}</span>
    </span>
  );
}