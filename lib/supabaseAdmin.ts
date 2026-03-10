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
      pomodoros: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          focus_minutes: number;
          short_break_minutes: number;
          long_break_minutes: number;
          cycles_until_long_break: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          focus_minutes: number;
          short_break_minutes: number;
          long_break_minutes: number;
          cycles_until_long_break: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          focus_minutes?: number;
          short_break_minutes?: number;
          long_break_minutes?: number;
          cycles_until_long_break?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pomodoro_sessions: {
        Row: {
          id: string;
          pomodoro_id: string;
          user_id: string;
          phase_type: 'focus' | 'short_break' | 'long_break';
          started_at: string;
          completed_at: string;
          duration_seconds: number;
          cycle_index: number;
          status: 'completed';
        };
        Insert: {
          id?: string;
          pomodoro_id: string;
          user_id: string;
          phase_type: 'focus' | 'short_break' | 'long_break';
          started_at: string;
          completed_at: string;
          duration_seconds: number;
          cycle_index: number;
          status: 'completed';
        };
        Update: {
          id?: string;
          pomodoro_id?: string;
          user_id?: string;
          phase_type?: 'focus' | 'short_break' | 'long_break';
          started_at?: string;
          completed_at?: string;
          duration_seconds?: number;
          cycle_index?: number;
          status?: 'completed';
        };
        Relationships: [];
      };
      pomodoro_runs: {
        Row: {
          id: string;
          pomodoro_id: string;
          user_id: string;
          status: 'active' | 'paused' | 'completed' | 'incomplete';
          current_phase: 'focus' | 'short_break' | 'long_break';
          remaining_seconds: number;
          completed_focus_sessions: number;
          current_cycle: number;
          started_at: string;
          paused_at: string | null;
          completed_at: string | null;
          last_synced_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pomodoro_id: string;
          user_id: string;
          status: 'active' | 'paused' | 'completed' | 'incomplete';
          current_phase: 'focus' | 'short_break' | 'long_break';
          remaining_seconds: number;
          completed_focus_sessions?: number;
          current_cycle?: number;
          started_at: string;
          paused_at?: string | null;
          completed_at?: string | null;
          last_synced_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pomodoro_id?: string;
          user_id?: string;
          status?: 'active' | 'paused' | 'completed' | 'incomplete';
          current_phase?: 'focus' | 'short_break' | 'long_break';
          remaining_seconds?: number;
          completed_focus_sessions?: number;
          current_cycle?: number;
          started_at?: string;
          paused_at?: string | null;
          completed_at?: string | null;
          last_synced_at?: string;
          created_at?: string;
          updated_at?: string;
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
