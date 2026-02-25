import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import recommendationRoutes from './routes/recommendation.routes';
import wishlistRoutes from './routes/wishlist.routes';
import steamRoutes from './routes/steam.routes';
import authRoutes from './routes/auth.routes';

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());



// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Steam Tracker API is running!',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/steam', steamRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/wishlist', wishlistRoutes);

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check on port ${PORT}`);
  console.log(`Steam API: http://localhost:${PORT}/api/steam`);
  console.log(`Auth: http://localhost:${PORT}/api/auth`);
});

export default app;