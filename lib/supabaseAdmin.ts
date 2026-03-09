import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface DashboardDatabase {
  public: {
    Tables: {
      visits: {
        Row: {
          id: string;
          visitor_id: string;
          path: string;
          visited_at: string;
          ip: string | null;
          user_agent: string | null;
        };
        Insert: {
          id: string;
          visitor_id: string;
          path: string;
          visited_at: string;
          ip?: string | null;
          user_agent?: string | null;
        };
        Update: {
          id?: string;
          visitor_id?: string;
          path?: string;
          visited_at?: string;
          ip?: string | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      contact_attempts: {
        Row: {
          id: string;
          name: string;
          email: string;
          message: string;
          submitted_at: string;
          status: 'sent' | 'failed';
          ip: string | null;
          user_agent: string | null;
          error_message: string | null;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          message: string;
          submitted_at: string;
          status: 'sent' | 'failed';
          ip?: string | null;
          user_agent?: string | null;
          error_message?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          message?: string;
          submitted_at?: string;
          status?: 'sent' | 'failed';
          ip?: string | null;
          user_agent?: string | null;
          error_message?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

type DashboardSupabaseClient = SupabaseClient<DashboardDatabase>;

declare global {
  var dashboardSupabaseAdminClient: DashboardSupabaseClient | undefined;
}

function getSupabaseAdminConfig() {
  const url = process.env.SUPABASE_URL?.trim() ?? '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '';

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  return { url, serviceRoleKey };
}

export function getSupabaseAdminClient(): DashboardSupabaseClient {
  if (globalThis.dashboardSupabaseAdminClient) {
    return globalThis.dashboardSupabaseAdminClient;
  }

  const { url, serviceRoleKey } = getSupabaseAdminConfig();

  const client = createClient<DashboardDatabase>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  globalThis.dashboardSupabaseAdminClient = client;

  return client;
}
