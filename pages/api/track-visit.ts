import type { NextApiRequest, NextApiResponse } from 'next';

import { recordVisit } from '../../lib/dashboardStore';

function getRequestIpAddress(req: NextApiRequest) {
  const forwardedForHeader = req.headers['x-forwarded-for'];

  if (typeof forwardedForHeader === 'string') {
    return forwardedForHeader.split(',')[0]?.trim() ?? null;
  }

  if (Array.isArray(forwardedForHeader)) {
    return forwardedForHeader[0]?.trim() ?? null;
  }

  return req.socket.remoteAddress ?? null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  const visitorId =
    typeof req.body?.visitorId === 'string' ? req.body.visitorId.trim() : '';
  const currentPath =
    typeof req.body?.path === 'string' && req.body.path.trim().length > 0 ? req.body.path.trim() : '/';

  if (!visitorId) {
    return res.status(400).json({ message: 'Visitor identifier is required.' });
  }

  await recordVisit({
    visitorId,
    path: currentPath,
    ip: getRequestIpAddress(req),
    userAgent: req.headers['user-agent'] ?? null,
  });

  return res.status(201).json({ message: 'Visit tracked.' });
}
