import { createHmac, timingSafeEqual } from 'crypto';

import type { NextApiRequest, NextApiResponse, NextPageContext } from 'next';

export const DASHBOARD_AUTH_COOKIE_NAME = 'dashboard_session';

function getDashboardPassword() {
  return process.env.DASHBOARD_PASSWORD?.trim() ?? '';
}

function getSessionSecret() {
  const dashboardPassword = getDashboardPassword();

  return process.env.DASHBOARD_SESSION_SECRET?.trim() || `dashboard-session:${dashboardPassword}`;
}

function createSessionToken() {
  const dashboardPassword = getDashboardPassword();
  const sessionSecret = getSessionSecret();

  if (!dashboardPassword || !sessionSecret) {
    return null;
  }

  return createHmac('sha256', sessionSecret).update(dashboardPassword).digest('hex');
}

function parseCookies(cookieHeader?: string) {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(';').reduce<Record<string, string>>((cookies, cookiePart) => {
    const [rawName, ...rawValue] = cookiePart.trim().split('=');

    if (!rawName) {
      return cookies;
    }

    cookies[rawName] = decodeURIComponent(rawValue.join('='));

    return cookies;
  }, {});
}

function getAuthCookieValue(cookieHeader?: string) {
  return parseCookies(cookieHeader)[DASHBOARD_AUTH_COOKIE_NAME] ?? '';
}

function isSafeEqual(leftValue: string, rightValue: string) {
  const leftBuffer = Buffer.from(leftValue);
  const rightBuffer = Buffer.from(rightValue);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(new Uint8Array(leftBuffer), new Uint8Array(rightBuffer));
}

function createCookieHeader(value: string, maxAge: number) {
  const attributes = [
    `${DASHBOARD_AUTH_COOKIE_NAME}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];

  if (process.env.NODE_ENV === 'production') {
    attributes.push('Secure');
  }

  return attributes.join('; ');
}

export function isDashboardAuthConfigured() {
  return Boolean(getDashboardPassword());
}

export function validateDashboardPassword(password: string) {
  const dashboardPassword = getDashboardPassword();

  if (!dashboardPassword) {
    return false;
  }

  return isSafeEqual(password, dashboardPassword);
}

export function isDashboardRequestAuthenticated(
  context: Pick<NextPageContext, 'req'> | { req: NextApiRequest }
) {
  if (!context.req) {
    return false;
  }

  const sessionToken = createSessionToken();

  if (!sessionToken) {
    return false;
  }

  const cookieValue = getAuthCookieValue(context.req.headers.cookie);

  if (!cookieValue) {
    return false;
  }

  return isSafeEqual(cookieValue, sessionToken);
}

export function setDashboardAuthCookie(res: NextApiResponse) {
  const sessionToken = createSessionToken();

  if (!sessionToken) {
    throw new Error('Dashboard authentication is not configured.');
  }

  res.setHeader('Set-Cookie', createCookieHeader(sessionToken, 60 * 60 * 8));
}

export function clearDashboardAuthCookie(res: NextApiResponse) {
  res.setHeader('Set-Cookie', createCookieHeader('', 0));
}
