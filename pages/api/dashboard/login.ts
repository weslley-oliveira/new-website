import type { NextApiRequest, NextApiResponse } from 'next';

import {
  isDashboardAuthConfigured,
  setDashboardAuthCookie,
  validateDashboardPassword,
} from '../../../lib/dashboardAuth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  if (!isDashboardAuthConfigured()) {
    return res.status(500).json({ message: 'Dashboard password is not configured.' });
  }

  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!password) {
    return res.status(400).json({ message: 'Password is required.' });
  }

  if (!validateDashboardPassword(password)) {
    return res.status(401).json({ message: 'Invalid password.' });
  }

  setDashboardAuthCookie(res);

  return res.status(200).json({ message: 'Authenticated successfully.' });
}
