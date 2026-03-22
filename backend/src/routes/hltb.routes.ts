import { Router, Response } from 'express';
import axios from 'axios';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

const BASE = 'https://hltbapi.codepotatoes.de';

const cache = new Map<string, any | null>();

router.get('/steam/:appId', async (req: AuthRequest, res: Response) => {
  const appId = Array.isArray(req.params.appId) ? req.params.appId[0] : req.params.appId;
  const cacheKey = `steam:${appId}`;
  try {

    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (cached) return res.json({ success: true, data: normalise(cached) });
      return res.json({ success: false, error: 'No HLTB data found', data: null });
    }

    const { data } = await axios.get(`${BASE}/steam/${appId}`, { timeout: 8000 });
    cache.set(cacheKey, data);
    return res.json({ success: true, data: normalise(data) });
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404) {
      cache.set(`steam:${appId}`, null);
      return res.json({ success: false, error: 'No HLTB data found', data: null });
    }
    console.error('[HLTB] steam lookup error:', err.message);
    return res.status(500).json({ success: false, error: 'HLTB lookup failed', data: null });
  }
});

router.get('/name/:gameName', async (req: AuthRequest, res: Response) => {
  const gameName = Array.isArray(req.params.gameName) ? req.params.gameName[0] : req.params.gameName;
  const cacheKey = `name:${gameName.toLowerCase()}`;
  try {

    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (cached) return res.json({ success: true, data: normalise(cached) });
      return res.json({ success: false, error: 'No HLTB data found', data: null });
    }

    const { data } = await axios.get(`${BASE}/search/${encodeURIComponent(gameName)}`, { timeout: 8000 });

    const result = Array.isArray(data) ? data[0] : data;
    if (!result) {
      cache.set(cacheKey, null);
      return res.json({ success: false, error: 'No HLTB data found', data: null });
    }

    cache.set(cacheKey, result);
    return res.json({ success: true, data: normalise(result) });
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404) {
      cache.set(`name:${gameName.toLowerCase()}`, null);
      return res.json({ success: false, error: 'No HLTB data found', data: null });
    }
    console.error('[HLTB] name lookup error:', err.message);
    return res.status(500).json({ success: false, error: 'HLTB lookup failed', data: null });
  }
});

function normalise(raw: any) {
  return {
    name:                  raw.title          ?? raw.name          ?? '',
    gameplayMain:          raw.mainStory       ?? raw.gameplayMain  ?? 0,
    gameplayMainExtra:     raw.mainStoryWithExtras ?? raw.gameplayMainExtra ?? 0,
    gameplayCompletionist: raw.completionist   ?? raw.gameplayCompletionist ?? 0,
  };
}

export default router;