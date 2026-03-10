import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { DashboardDatabase } from './supabaseAdmin';

type BrowserSupabaseClient = SupabaseClient<DashboardDatabase>;

declare global {
  var browserSupabaseClient: BrowserSupabaseClient | undefined;
}

function getSupabaseBrowserConfig() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? process.env.SUPABASE_URL?.trim() ?? '';
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
    '';

  if (!url || !publishableKey) {
    throw new Error(
      'Supabase browser auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and a public Supabase key.'
    );
  }

  return { url, publishableKey };
}

export function getSupabaseBrowserClient(): BrowserSupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error('Supabase browser client can only be used in the browser.');
  }

  if (globalThis.browserSupabaseClient) {
    return globalThis.browserSupabaseClient;
  }

  const { url, publishableKey } = getSupabaseBrowserConfig();

  const client = createClient<DashboardDatabase>(url, publishableKey, {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  globalThis.browserSupabaseClient = client;

  return client;
}
