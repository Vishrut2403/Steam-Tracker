import { Router, Request, Response } from 'express';
import prisma from '../prisma';

const router = Router();

router.get('/:gameId', async (req: Request, res: Response) => {
	try {
		const gameId = req.params.gameId as string;
		const userId = req.query.userId as string;

		if (!userId) {
			res.status(400).json({
				success: false,
				error: 'userId is required'
			});
			return;
		}

		const entries = await prisma.gameJournalEntry.findMany({
			where: {
				gameId,
				userId
			},
			orderBy: {
				createdAt: 'desc'
			}
		});

		res.json({
			success: true,
			data: entries
		});
	} catch (error: any) {
		console.error('Error fetching journal entries:', error);
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to fetch journal entries'
		});
	}
});

router.post('/', async (req: Request, res: Response) => {
	try {
		const { userId, gameId, heading, content } = req.body;

		if (!userId || !gameId || !heading || !content) {
			res.status(400).json({
				success: false,
				error: 'userId, gameId, heading, and content are required'
			});
			return;
		}

		const game = await prisma.libraryGame.findFirst({
			where: {
				id: gameId,
				userId
			}
		});

		if (!game) {
			res.status(404).json({
				success: false,
				error: 'Game not found'
			});
			return;
		}

		const entry = await prisma.gameJournalEntry.create({
			data: {
				userId,
				gameId,
				heading,
				content
			}
		});

		res.json({
			success: true,
			data: entry
		});
	} catch (error: any) {
		console.error('Error creating journal entry:', error);
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to create journal entry'
		});
	}
});

router.put('/:id', async (req: Request, res: Response) => {
	try {
		const entryId = req.params.id as string;
		const { userId, heading, content } = req.body;

		if (!userId || !heading || !content) {
			res.status(400).json({
				success: false,
				error: 'userId, heading, and content are required'
			});
			return;
		}

		const existingEntry = await prisma.gameJournalEntry.findFirst({
			where: {
				id: entryId,
				userId
			}
		});

		if (!existingEntry) {
			res.status(404).json({
				success: false,
				error: 'Journal entry not found'
			});
			return;
		}

		const entry = await prisma.gameJournalEntry.update({
			where: { id: entryId },
			data: { heading, content }
		});

		res.json({
			success: true,
			data: entry
		});
	} catch (error: any) {
		console.error('Error updating journal entry:', error);
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to update journal entry'
		});
	}
});

router.delete('/:id', async (req: Request, res: Response) => {
	try {
		const entryId = req.params.id as string;
		const userId = req.query.userId as string;

		if (!userId) {
			res.status(400).json({
				success: false,
				error: 'userId is required'
			});
			return;
		}

		const existingEntry = await prisma.gameJournalEntry.findFirst({
			where: {
				id: entryId,
				userId
			}
		});

		if (!existingEntry) {
			res.status(404).json({
				success: false,
				error: 'Journal entry not found'
			});
			return;
		}

		await prisma.gameJournalEntry.delete({
			where: { id: entryId }
		});

		res.json({
			success: true,
			message: 'Journal entry deleted'
		});
	} catch (error: any) {
		console.error('Error deleting journal entry:', error);
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to delete journal entry'
		});
	}
});

export default router;