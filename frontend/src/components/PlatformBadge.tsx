interface PlatformBadgeProps {
	platform: string;
	className?: string;
	showLabel?: boolean;
}

export function PlatformBadge({ platform, className = '', showLabel = true }: PlatformBadgeProps) {
	const badges: Record<string, { icon: string; label: string; bgColor: string; textColor: string; borderColor: string }> = {
		steam: { 
			icon: '🎮', 
			label: 'Steam', 
			bgColor: 'bg-[#1a1a1a]',
			textColor: 'text-[#7a9fc3]',
			borderColor: 'border-[#5a7fa3]'
		},
		apple_gc: { 
			icon: '🍎', 
			label: 'iOS', 
			bgColor: 'bg-[#1a1a1a]',
			textColor: 'text-[#a0a0a0]',
			borderColor: 'border-[#5a5a5a]'
		},
		minecraft: { 
			icon: '⛏️', 
			label: 'Minecraft', 
			bgColor: 'bg-[#1a1a1a]',
			textColor: 'text-[#7a9fc3]',
			borderColor: 'border-[#5a7fa3]'
		},
		ps2: { 
			icon: '🎮', 
			label: 'PS2', 
			bgColor: 'bg-[#1a1a1a]',
			textColor: 'text-[#7a9fc3]',
			borderColor: 'border-[#5a7fa3]'
		},
		ps3: { 
			icon: '🎮', 
			label: 'PS3', 
			bgColor: 'bg-[#1a1a1a]',
			textColor: 'text-[#7a9fc3]',
			borderColor: 'border-[#5a7fa3]'
		},
		retroachievements: {
			icon: '🏆',
			label: 'RetroArch',
			bgColor: 'bg-[#1a1a1a]',
			textColor: 'text-[#7a9fc3]',
			borderColor: 'border-[#5a7fa3]'
		},
		retroarch: {
			icon: '🎮',
			label: 'RetroArch',
			bgColor: 'bg-[#1a1a1a]',
			textColor: 'text-[#7a9fc3]',
			borderColor: 'border-[#5a7fa3]'
		},
		ppsspp: {
			icon: '🎮',
			label: 'PPSSPP',
			bgColor: 'bg-[#1a1a1a]',
			textColor: 'text-[#7a9fc3]',
			borderColor: 'border-[#5a7fa3]'
		},
		pcsx2: {
			icon: '🎮',
			label: 'PCSX2',
			bgColor: 'bg-[#1a1a1a]',
			textColor: 'text-[#7a9fc3]',
			borderColor: 'border-[#5a7fa3]'
		},
		rpcs3: {
			icon: '🎮',
			label: 'RPCS3',
			bgColor: 'bg-[#1a1a1a]',
			textColor: 'text-[#7a9fc3]',
			borderColor: 'border-[#5a7fa3]'
		},
	};

	const badge = badges[platform] || { 
		icon: '📝', 
		label: 'Other', 
		bgColor: 'bg-[#1a1a1a]',
		textColor: 'text-[#a0a0a0]',
		borderColor: 'border-[#5a5a5a]'
	};

	if (!showLabel) {
		return (
			<span className={`text-lg ${className}`} title={badge.label}>
				{badge.icon}
			</span>
		);
	}

	return (
		<span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-medium ${badge.bgColor} ${badge.textColor} ${badge.borderColor} ${className}`}>
			<span>{badge.icon}</span>
			<span>{badge.label}</span>
		</span>
	);
}