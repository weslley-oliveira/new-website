import '../styles/globals.scss'
import Modal from 'react-modal'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

import "animate.css/animate.min.css";

const VISITOR_STORAGE_KEY = 'portfolio-visitor-id';
const SESSION_VISIT_PREFIX = 'portfolio-visit';

function createVisitorId() {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `visitor-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getVisitorId() {
  try {
    const storedVisitorId = window.localStorage.getItem(VISITOR_STORAGE_KEY);

    if (storedVisitorId) {
      return storedVisitorId;
    }

    const nextVisitorId = createVisitorId();

    window.localStorage.setItem(VISITOR_STORAGE_KEY, nextVisitorId);

    return nextVisitorId;
  } catch {
    return null;
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    Modal.setAppElement('#__next');
  }, []);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const visitorId = getVisitorId();

    if (!visitorId) {
      return;
    }

    const currentPath = window.location.pathname;
    const sessionKey = `${SESSION_VISIT_PREFIX}:${currentPath}`;

    try {
      if (window.sessionStorage.getItem(sessionKey)) {
        return;
      }

      window.sessionStorage.setItem(sessionKey, 'tracked');
    } catch {
      return;
    }

    void fetch('/api/track-visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visitorId,
        path: currentPath,
      }),
    }).catch(() => {
      window.sessionStorage.removeItem(sessionKey);
    });
  }, [router.asPath, router.isReady]);

  return (
     <Component {...pageProps} />
  )
}

export default MyApp
