import { randomUUID } from 'crypto';

import { getSupabaseAdminClient, type DashboardDatabase } from './supabaseAdmin';

export type ContactAttemptStatus = 'sent' | 'failed';

export interface VisitEntry {
  id: string;
  visitorId: string;
  path: string;
  visitedAt: string;
  ip: string | null;
  userAgent: string | null;
}

export interface ContactAttempt {
  id: string;
  name: string;
  email: string;
  message: string;
  submittedAt: string;
  status: ContactAttemptStatus;
  ip: string | null;
  userAgent: string | null;
  errorMessage: string | null;
}

export interface VisitorSummary {
  visitorId: string;
  totalVisits: number;
  firstSeenAt: string;
  lastSeenAt: string;
  lastPath: string;
  ip: string | null;
  userAgent: string | null;
}

export interface DashboardSnapshot {
  metrics: {
    totalVisits: number;
    uniqueVisitors: number;
    totalContactAttempts: number;
    successfulContacts: number;
  };
  visitors: VisitorSummary[];
  contactAttempts: ContactAttempt[];
}

type VisitRow = DashboardDatabase['public']['Tables']['visits']['Row'];
type VisitInsert = DashboardDatabase['public']['Tables']['visits']['Insert'];
type ContactAttemptRow = DashboardDatabase['public']['Tables']['contact_attempts']['Row'];
type ContactAttemptInsert = DashboardDatabase['public']['Tables']['contact_attempts']['Insert'];

const DASHBOARD_QUERY_BATCH_SIZE = 1000;

function mapVisitRowToEntry(visit: VisitRow): VisitEntry {
  return {
    id: visit.id,
    visitorId: visit.visitor_id,
    path: visit.path,
    visitedAt: visit.visited_at,
    ip: visit.ip,
    userAgent: visit.user_agent,
  };
}

function mapVisitEntryToInsert(visit: VisitEntry): VisitInsert {
  return {
    id: visit.id,
    visitor_id: visit.visitorId,
    path: visit.path,
    visited_at: visit.visitedAt,
    ip: visit.ip,
    user_agent: visit.userAgent,
  };
}

function mapContactAttemptRowToEntry(contactAttempt: ContactAttemptRow): ContactAttempt {
  return {
    id: contactAttempt.id,
    name: contactAttempt.name,
    email: contactAttempt.email,
    message: contactAttempt.message,
    submittedAt: contactAttempt.submitted_at,
    status: contactAttempt.status,
    ip: contactAttempt.ip,
    userAgent: contactAttempt.user_agent,
    errorMessage: contactAttempt.error_message,
  };
}

function mapContactAttemptToInsert(contactAttempt: ContactAttempt): ContactAttemptInsert {
  return {
    id: contactAttempt.id,
    name: contactAttempt.name,
    email: contactAttempt.email,
    message: contactAttempt.message,
    submitted_at: contactAttempt.submittedAt,
    status: contactAttempt.status,
    ip: contactAttempt.ip,
    user_agent: contactAttempt.userAgent,
    error_message: contactAttempt.errorMessage,
  };
}

async function readAllVisits() {
  const supabase = getSupabaseAdminClient();
  const visits: VisitEntry[] = [];

  for (let offset = 0; ; offset += DASHBOARD_QUERY_BATCH_SIZE) {
    const { data, error } = await supabase
      .from('visits')
      .select('id, visitor_id, path, visited_at, ip, user_agent')
      .order('visited_at', { ascending: true })
      .range(offset, offset + DASHBOARD_QUERY_BATCH_SIZE - 1);

    if (error) {
      throw new Error(`Could not load visits: ${error.message}`);
    }

    if (!data?.length) {
      break;
    }

    visits.push(...data.map(mapVisitRowToEntry));

    if (data.length < DASHBOARD_QUERY_BATCH_SIZE) {
      break;
    }
  }

  return visits;
}

async function readAllContactAttempts() {
  const supabase = getSupabaseAdminClient();
  const contactAttempts: ContactAttempt[] = [];

  for (let offset = 0; ; offset += DASHBOARD_QUERY_BATCH_SIZE) {
    const { data, error } = await supabase
      .from('contact_attempts')
      .select('id, name, email, message, submitted_at, status, ip, user_agent, error_message')
      .order('submitted_at', { ascending: false })
      .range(offset, offset + DASHBOARD_QUERY_BATCH_SIZE - 1);

    if (error) {
      throw new Error(`Could not load contact attempts: ${error.message}`);
    }

    if (!data?.length) {
      break;
    }

    contactAttempts.push(...data.map(mapContactAttemptRowToEntry));

    if (data.length < DASHBOARD_QUERY_BATCH_SIZE) {
      break;
    }
  }

  return contactAttempts;
}

interface VisitInput {
  visitorId: string;
  path: string;
  ip: string | null;
  userAgent: string | null;
}

export async function recordVisit({ visitorId, path, ip, userAgent }: VisitInput) {
  const visitEntry: VisitEntry = {
    id: randomUUID(),
    visitorId,
    path,
    visitedAt: new Date().toISOString(),
    ip,
    userAgent,
  };

  const { error } = await getSupabaseAdminClient().from('visits').insert(mapVisitEntryToInsert(visitEntry));

  if (error) {
    throw new Error(`Could not record visit: ${error.message}`);
  }

  return visitEntry;
}

interface ContactAttemptInput {
  name: string;
  email: string;
  message: string;
  status: ContactAttemptStatus;
  ip: string | null;
  userAgent: string | null;
  errorMessage?: string | null;
}

export async function recordContactAttempt({
  name,
  email,
  message,
  status,
  ip,
  userAgent,
  errorMessage = null,
}: ContactAttemptInput) {
  const contactAttempt: ContactAttempt = {
    id: randomUUID(),
    name,
    email,
    message,
    submittedAt: new Date().toISOString(),
    status,
    ip,
    userAgent,
    errorMessage,
  };

  const { error } = await getSupabaseAdminClient()
    .from('contact_attempts')
    .insert(mapContactAttemptToInsert(contactAttempt));

  if (error) {
    throw new Error(`Could not record contact attempt: ${error.message}`);
  }

  return contactAttempt;
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const [visits, contactAttempts] = await Promise.all([readAllVisits(), readAllContactAttempts()]);
  const visitorsById = new Map<string, VisitorSummary>();

  visits.forEach((visit) => {
    const currentVisitor = visitorsById.get(visit.visitorId);

    if (!currentVisitor) {
      visitorsById.set(visit.visitorId, {
        visitorId: visit.visitorId,
        totalVisits: 1,
        firstSeenAt: visit.visitedAt,
        lastSeenAt: visit.visitedAt,
        lastPath: visit.path,
        ip: visit.ip,
        userAgent: visit.userAgent,
      });

      return;
    }

    currentVisitor.totalVisits += 1;

    if (visit.visitedAt < currentVisitor.firstSeenAt) {
      currentVisitor.firstSeenAt = visit.visitedAt;
    }

    if (visit.visitedAt >= currentVisitor.lastSeenAt) {
      currentVisitor.lastSeenAt = visit.visitedAt;
      currentVisitor.lastPath = visit.path;
      currentVisitor.ip = visit.ip;
      currentVisitor.userAgent = visit.userAgent;
    }
  });

  const visitors = Array.from(visitorsById.values()).sort((visitorA, visitorB) =>
    visitorB.lastSeenAt.localeCompare(visitorA.lastSeenAt)
  );

  const sortedContactAttempts = [...contactAttempts].sort((attemptA, attemptB) =>
    attemptB.submittedAt.localeCompare(attemptA.submittedAt)
  );

  return {
    metrics: {
      totalVisits: visits.length,
      uniqueVisitors: visitors.length,
      totalContactAttempts: sortedContactAttempts.length,
      successfulContacts: sortedContactAttempts.filter((attempt) => attempt.status === 'sent').length,
    },
    visitors,
    contactAttempts: sortedContactAttempts,
  };
}
