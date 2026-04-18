import { useState, useEffect } from 'react';
import journalService from '../services/journal.service';
import type { JournalEntry } from '../services/journal.service';

interface GameJournalProps {
	gameId: string;
	gameName: string;
	userId: string;
}

export const GameJournal: React.FC<GameJournalProps> = ({ gameId, gameName, userId }) => {
	const [entries, setEntries] = useState<JournalEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
	
	const [newEntryHeading, setNewEntryHeading] = useState('');
	const [newEntryContent, setNewEntryContent] = useState('');
	const [editingEntry, setEditingEntry] = useState<string | null>(null);
	const [editHeading, setEditHeading] = useState('');
	const [editContent, setEditContent] = useState('');
	const [isAddingNew, setIsAddingNew] = useState(false);

	useEffect(() => {
		loadEntries();
	}, [gameId, userId]);

	const loadEntries = async () => {
		try {
			setLoading(true);
			setError('');
			const data = await journalService.getEntries(gameId, userId);
			setEntries(data);
		} catch (err: any) {
			setError(err.message || 'Failed to load journal entries');
		} finally {
			setLoading(false);
		}
	};

	const toggleEntry = (entryId: string) => {
		const newExpanded = new Set(expandedEntries);
		if (newExpanded.has(entryId)) {
			newExpanded.delete(entryId);
		} else {
			newExpanded.add(entryId);
		}
		setExpandedEntries(newExpanded);
	};

	const handleCreateEntry = async () => {
		if (!newEntryHeading.trim() || !newEntryContent.trim()) return;

		try {
			setError('');
			await journalService.createEntry(userId, gameId, newEntryHeading, newEntryContent);
			setNewEntryHeading('');
			setNewEntryContent('');
			setIsAddingNew(false);
			await loadEntries();
		} catch (err: any) {
			setError(err.message || 'Failed to create entry');
		}
	};

	const handleUpdateEntry = async (entryId: string) => {
		if (!editHeading.trim() || !editContent.trim()) return;

		try {
			setError('');
			await journalService.updateEntry(entryId, userId, editHeading, editContent);
			setEditingEntry(null);
			setEditHeading('');
			setEditContent('');
			await loadEntries();
		} catch (err: any) {
			setError(err.message || 'Failed to update entry');
		}
	};

	const handleDeleteEntry = async (entryId: string) => {
		if (!confirm('Delete this journal entry?')) return;

		try {
			setError('');
			await journalService.deleteEntry(entryId, userId);
			await loadEntries();
		} catch (err: any) {
			setError(err.message || 'Failed to delete entry');
		}
	};

	const startEditing = (entry: JournalEntry) => {
		setEditingEntry(entry.id);
		setEditHeading(entry.heading);
		setEditContent(entry.content);
		setIsAddingNew(false);
	};

	const cancelEditing = () => {
		setEditingEntry(null);
		setEditHeading('');
		setEditContent('');
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-gray-400">Loading journal entries...</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-semibold text-[#e5e5e5]">📝 Journal</h3>
					<p className="text-sm text-[#a0a0a0]">Personal notes for {gameName}</p>
				</div>
				{!isAddingNew && (
					<button
						onClick={() => setIsAddingNew(true)}
						className="px-4 py-2 bg-[#5a7fa3] hover:bg-[#7a9fc3] text-[#e5e5e5] rounded-lg transition-colors text-sm font-medium"
					>
						+ Add Entry
					</button>
				)}
			</div>

			{/* Error message */}
			{error && (
				<div className="p-3 bg-[#8b3a3a]/10 border border-[#a84a4a] rounded-lg text-[#ff9999] text-sm">
					{error}
				</div>
			)}

			{/* New entry form */}
			{isAddingNew && (
				<div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-4 space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-[#e5e5e5]">New Entry</span>
						<button
							onClick={() => {
								setIsAddingNew(false);
								setNewEntryHeading('');
								setNewEntryContent('');
							}}
							className="text-gray-400 hover:text-[#e5e5e5] text-sm"
						>
							Cancel
						</button>
					</div>
					
					<input
						type="text"
						value={newEntryHeading}
						onChange={(e) => setNewEntryHeading(e.target.value)}
						placeholder="Entry heading (e.g., 'End of Act 1')"
						className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-[#e5e5e5] placeholder-[#696969] focus:outline-none focus:border-[#5a7fa3]"
						autoFocus
					/>
					
					<textarea
						value={newEntryContent}
						onChange={(e) => setNewEntryContent(e.target.value)}
						placeholder="Write your thoughts..."
						className="w-full h-32 px-3 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-[#e5e5e5] placeholder-[#696969] resize-none focus:outline-none focus:border-[#5a7fa3]"
					/>
					
					<div className="flex items-center justify-end">
						<button
							onClick={handleCreateEntry}
							disabled={!newEntryHeading.trim() || !newEntryContent.trim()}
							className="px-4 py-2 bg-[#5a7fa3] hover:bg-[#7a9fc3] disabled:bg-[#2a2a2a] disabled:text-[#696969] text-[#e5e5e5] rounded-lg transition-colors text-sm font-medium"
						>
							Save Entry
						</button>
					</div>
				</div>
			)}

			{/* Entries list */}
			{entries.length === 0 && !isAddingNew ? (
				<div className="text-center py-12">
					<div className="text-4xl mb-3">📝</div>
					<p className="text-[#a0a0a0] mb-4">No journal entries yet</p>
					<button
						onClick={() => setIsAddingNew(true)}
						className="px-4 py-2 bg-[#5a7fa3] hover:bg-[#7a9fc3] text-[#e5e5e5] rounded-lg transition-colors text-sm font-medium"
					>
						Write Your First Entry
					</button>
				</div>
			) : (
				<div className="space-y-3">
					{entries.map((entry) => (
						<div
							key={entry.id}
							className="bg-[#1a1a1a] border border-[#333333] rounded-lg overflow-hidden"
						>
							{editingEntry === entry.id ? (
								// Edit mode
								<div className="p-4 space-y-3">
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm font-medium text-[#e5e5e5]">Edit Entry</span>
										<button
											onClick={cancelEditing}
											className="text-[#a0a0a0] hover:text-[#e5e5e5] text-sm"
										>
											Cancel
										</button>
									</div>
									
									<input
										type="text"
										value={editHeading}
										onChange={(e) => setEditHeading(e.target.value)}
										className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-[#e5e5e5] focus:outline-none focus:border-[#5a7fa3]"
									/>
									
									<textarea
										value={editContent}
										onChange={(e) => setEditContent(e.target.value)}
										className="w-full h-32 px-3 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-[#e5e5e5] resize-none focus:outline-none focus:border-[#5a7fa3]"
										autoFocus
									/>
									
									<div className="flex items-center justify-end">
										<button
											onClick={() => handleUpdateEntry(entry.id)}
											disabled={!editHeading.trim() || !editContent.trim()}
											className="px-4 py-2 bg-[#5a7fa3] hover:bg-[#7a9fc3] disabled:bg-[#2a2a2a] disabled:text-[#696969] text-[#e5e5e5] rounded-lg transition-colors text-sm font-medium"
										>
											Save Changes
										</button>
									</div>
								</div>
							) : (
								// View mode - collapsible
								<div>
									{/* Header - clickable to expand/collapse */}
									<button
										onClick={() => toggleEntry(entry.id)}
										className="w-full p-4 flex items-center justify-between hover:bg-[#2a2a2a]/50 transition-colors text-left"
									>
										<div className="flex items-center gap-3 flex-1 min-w-0">
											<svg 
												className={`w-5 h-5 text-[#a0a0a0] flex-shrink-0 transition-transform ${expandedEntries.has(entry.id) ? 'rotate-90' : ''}`}
												fill="none" 
												stroke="currentColor" 
												viewBox="0 0 24 24"
											>
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
											</svg>
											<div className="flex-1 min-w-0">
												<h4 className="text-[#e5e5e5] font-semibold truncate">{entry.heading}</h4>
												<p className="text-xs text-[#a0a0a0]">{formatDate(entry.createdAt)}</p>
											</div>
										</div>
										
										<div className="flex items-center gap-2 ml-3" onClick={(e) => e.stopPropagation()}>
											<button
												onClick={(e) => {
													e.stopPropagation();
													startEditing(entry);
												}}
												className="text-[#a0a0a0] hover:text-[#5a7fa3] text-sm transition-colors px-2 py-1"
											>
												Edit
											</button>
											<button
												onClick={(e) => {
													e.stopPropagation();
													handleDeleteEntry(entry.id);
												}}
												className="text-[#a0a0a0] hover:text-[#ff9999] text-sm transition-colors px-2 py-1"
											>
												Delete
											</button>
										</div>
									</button>

									{/* Expandable content */}
									{expandedEntries.has(entry.id) && (
										<div className="px-4 pb-4 pt-2 border-t border-[#333333]">
											<p className="text-[#e5e5e5] whitespace-pre-wrap leading-relaxed">
												{entry.content}
											</p>
										</div>
									)}
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
};