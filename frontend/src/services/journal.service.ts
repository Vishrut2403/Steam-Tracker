const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface JournalEntry {
	id: string;
	userId: string;
	gameId: string;
	heading: string;
	content: string;
	createdAt: string;
	updatedAt: string;
}

class JournalService {
	// Get all entries for a game
	async getEntries(gameId: string, userId: string): Promise<JournalEntry[]> {
		const response = await fetch(`${API_URL}/api/journal/${gameId}?userId=${userId}`);
		const data = await response.json();
		
		if (!data.success) {
			throw new Error(data.error || 'Failed to fetch journal entries');
		}
		
		return data.data;
	}

	// Create a new entry
	async createEntry(userId: string, gameId: string, heading: string, content: string): Promise<JournalEntry> {
		const response = await fetch(`${API_URL}/api/journal`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ userId, gameId, heading, content }),
		});
		
		const data = await response.json();
		
		if (!data.success) {
			throw new Error(data.error || 'Failed to create journal entry');
		}
		
		return data.data;
	}

	// Update an entry
	async updateEntry(entryId: string, userId: string, heading: string, content: string): Promise<JournalEntry> {
		const response = await fetch(`${API_URL}/api/journal/${entryId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ userId, heading, content }),
		});
		
		const data = await response.json();
		
		if (!data.success) {
			throw new Error(data.error || 'Failed to update journal entry');
		}
		
		return data.data;
	}

	// Delete an entry
	async deleteEntry(entryId: string, userId: string): Promise<void> {
		const response = await fetch(`${API_URL}/api/journal/${entryId}?userId=${userId}`, {
			method: 'DELETE',
		});
		
		const data = await response.json();
		
		if (!data.success) {
			throw new Error(data.error || 'Failed to delete journal entry');
		}
	}
}

export default new JournalService();