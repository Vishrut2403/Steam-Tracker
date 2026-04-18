import React, { useState } from 'react';
import { retroAchievementsService } from '../services/retroachievements.service';

interface AddRAGameModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAdd: () => void;
	userId: string;
}

const AddRAGameModal: React.FC<AddRAGameModalProps> = ({
	isOpen,
	onClose,
	onAdd,
	userId
}) => {
	const [gameId, setGameId] = useState('');
	const [username, setUsername] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	const handleAdd = async () => {
		if (!gameId.trim()) {
			setError('Please enter a game ID');
			return;
		}

		const gameIdNum = parseInt(gameId);
		if (isNaN(gameIdNum)) {
			setError('Game ID must be a number');
			return;
		}

		setIsLoading(true);
		setError('');

		try {
			console.log('➕ Adding RA game:', gameIdNum);
			await retroAchievementsService.addGame(userId, gameIdNum, username.trim() || undefined);
			
			console.log('Game added successfully');
			
			onAdd();
			handleClose();
			
		} catch (err: any) {
			console.error('Failed to add game:', err);
			setError(err.response?.data?.error || 'Failed to add game. Check the game ID.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		setGameId('');
		setUsername('');
		setError('');
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div 
			className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
			onClick={handleClose}
		>
			<div 
				className="bg-[#000000] rounded-lg p-6 max-w-md w-full mx-4 border border-[#333333]"
				onClick={(e) => e.stopPropagation()}
			>
				<h2 className="text-2xl font-bold mb-4 text-[#e5e5e5]">
					Add RetroAchievements Game
				</h2>

				<div className="mb-4">
					<label className="block text-[#a0a0a0] mb-2">
						Game ID <span className="text-[#a0a0a0]">*</span>
					</label>
					<input
						type="text"
						value={gameId}
						onChange={(e) => setGameId(e.target.value)}
						placeholder="e.g., 11240 for God of War"
						className="w-full px-3 py-2 bg-[#1a1a1a] text-[#e5e5e5] rounded border border-[#333333] focus:border-[#5a7fa3] focus:outline-none"
						disabled={isLoading}
					/>
					<p className="text-sm text-[#696969] mt-1">
						Find game IDs at{' '}
						<a
							href="https://retroachievements.org/gameList.php"
							target="_blank"
							rel="noopener noreferrer"
							className="text-[#5a7fa3] hover:text-[#7a9fc3]"
						>
							retroachievements.org
						</a>
					</p>
				</div>

				<div className="mb-4">
					<label className="block text-[#a0a0a0] mb-2">
						Your RA Username (optional)
					</label>
					<input
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						placeholder="To sync your progress"
						className="w-full px-3 py-2 bg-[#1a1a1a] text-[#e5e5e5] rounded border border-[#333333] focus:border-[#5a7fa3] focus:outline-none"
						disabled={isLoading}
					/>
					<p className="text-sm text-[#696969] mt-1">
						Leave blank to add game with 0% completion
					</p>
				</div>

				{error && (
					<div className="mb-4 p-3 bg-[#4a3a3a] border border-[#5a4a4a] rounded text-[#a0a0a0]">
						{error}
					</div>
				)}

				<div className="flex gap-3">
					<button
						onClick={handleAdd}
						disabled={isLoading}
						className={`flex-1 py-2 px-4 rounded font-semibold ${
							isLoading
								? 'bg-[#333333] cursor-not-allowed text-[#696969]'
								: 'bg-[#5a7fa3] hover:bg-[#7a9fc3] text-[#e5e5e5]'
						} transition-colors`}
					>
						{isLoading ? 'Adding...' : 'Add Game'}
					</button>
					<button
						onClick={handleClose}
						disabled={isLoading}
						className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#333333] text-[#a0a0a0] rounded font-semibold transition-colors disabled:opacity-50 border border-[#333333]"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
};

export default AddRAGameModal;