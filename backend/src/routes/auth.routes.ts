import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login';
const RETURN_URL = process.env.STEAM_RETURN_URL || 'http://localhost:3001/api/auth/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Initiates Steam OpenID authentication flow
router.get('/steam', (req: Request, res: Response) => {
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': RETURN_URL,
    'openid.realm': RETURN_URL.split('/api')[0],
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  });

  const redirectUrl = `${STEAM_OPENID_URL}?${params.toString()}`;

  res.redirect(redirectUrl);
});

// Handles Steam OpenID verification callback
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const params = req.query;

    const verifyParams = new URLSearchParams({
      'openid.assoc_handle': params['openid.assoc_handle'] as string,
      'openid.signed': params['openid.signed'] as string,
      'openid.sig': params['openid.sig'] as string,
      'openid.ns': params['openid.ns'] as string,
      'openid.mode': 'check_authentication',
    });

    const signedFields = (params['openid.signed'] as string).split(',');
    signedFields.forEach((field) => {
      const key = `openid.${field}`;
      verifyParams.append(key, params[key] as string);
    });

    const verifyResponse = await axios.post(
      STEAM_OPENID_URL,
      verifyParams.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const isValid = verifyResponse.data.includes('is_valid:true');

    if (!isValid) {
      return res.redirect(`${FRONTEND_URL}?error=auth_failed`);
    }

    // Extract 64-bit SteamID from claimed_id URL
    const claimedId = params['openid.claimed_id'] as string;
    const steamId = claimedId.split('/').pop();

    if (!steamId) {
      return res.redirect(`${FRONTEND_URL}?error=invalid_steam_id`);
    }

    res.redirect(`${FRONTEND_URL}?steamId=${steamId}`);
  } catch (error) {
    res.redirect(`${FRONTEND_URL}?error=auth_failed`);
  }
});

export default router;