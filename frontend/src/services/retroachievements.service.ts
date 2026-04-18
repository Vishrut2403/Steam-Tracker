import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

export interface RAUserSummary {
	id: number;
	username: string;
	totalPoints: number;
	totalTruePoints: number;
	totalRanked: number;
	totalAwarded: number;
	memberSince: string;
	motto: string;
}

export interface RAGame {
	gameId: number;
	title: string;
	consoleId: number;
	consoleName: string;
	imageIcon: string;
	numPossibleAchievements: number;
	possibleScore: number;
	numAchieved: number;
	scoreAchieved: number;
	numAchievedHardcore: number;
	scoreAchievedHardcore: number;
	lastPlayed?: string;
}

export interface RAGameInfo {
	id: number;
	title: string;
	consoleId: number;
	consoleName: string;
	imageIcon: string;
	imageTitle: string;
	imageIngame: string;
	imageBoxArt: string;
	publisher: string;
	developer: string;
	genre: string;
	released: string;
	numAchievements: number;
	achievements: Record<string, any>;
}

export interface RASyncResponse {
	success: boolean;
	summary: {
		totalGames: number;
		added: number;
		updated: number;
		skipped: number;
		totalPoints: number;
		totalTruePoints: number;
		totalAwarded: number;
	};
}

class RetroAchievementsService {
	async getUserSummary(username: string): Promise<RAUserSummary> {
		const response = await axios.get(`${API_BASE}/retroachievements/user/${username}`);
		return response.data.data;
	}

	async getUserGames(username: string): Promise<RAGame[]> {
		const response = await axios.get(`${API_BASE}/retroachievements/games/${username}`);
		return response.data.data;
	}

	async getGameInfo(gameId: number): Promise<RAGameInfo> {
		const response = await axios.get(`${API_BASE}/retroachievements/game/${gameId}`);
		return response.data.data;
	}

	async syncLibrary(userId: string, username: string): Promise<RASyncResponse> {
		const response = await axios.post(`${API_BASE}/retroachievements/sync`, {
			userId,
			username
		});
		return response.data;
	}

	async addGame(userId: string, gameId: number, username?: string): Promise<any> {
		const response = await axios.post(`${API_BASE}/retroachievements/game`, {
			userId,
			gameId,
			username
		});
		return response.data.data;
	}

	async deleteGame(platformGameId: string, userId: string): Promise<void> {
		await axios.delete(`${API_BASE}/retroachievements/game/${platformGameId}?userId=${userId}`);
	}

	async getConsoles(): Promise<any[]> {
		const response = await axios.get(`${API_BASE}/retroachievements/consoles`);
		return response.data.data;
	}

	getAchievementIconUrl(badgeName: string, locked: boolean = false): string {
		return `https://media.retroachievements.org/Badge/${badgeName}${locked ? '_lock' : ''}.png`;
	}

	getGameIconUrl(iconPath: string): string {
		return `https://media.retroachievements.org${iconPath}`;
	}

	getGameBoxArtUrl(boxArtPath: string): string {
		return `https://media.retroachievements.org${boxArtPath}`;
	}
}

export const retroAchievementsService = new RetroAchievementsService();