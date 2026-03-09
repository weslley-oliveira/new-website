import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');
const dashboardDataPath = path.join(workspaceRoot, 'data', 'dashboard.json');
const envFilePaths = [path.join(workspaceRoot, '.env.local'), path.join(workspaceRoot, '.env')];
const UPSERT_BATCH_SIZE = 500;

function parseEnvLine(line) {
  const separatorIndex = line.indexOf('=');

  if (separatorIndex === -1) {
    return null;
  }

  const key = line.slice(0, separatorIndex).trim();
  const rawValue = line.slice(separatorIndex + 1).trim();

  if (!key || key.startsWith('#')) {
    return null;
  }

  return {
    key,
    value: rawValue.replace(/^['"]|['"]$/g, ''),
  };
}

async function loadEnvironmentFiles() {
  for (const envFilePath of envFilePaths) {
    try {
      const fileContent = await readFile(envFilePath, 'utf8');

      for (const line of fileContent.split(/\r?\n/)) {
        const parsedLine = parseEnvLine(line);

        if (!parsedLine || process.env[parsedLine.key]) {
          continue;
        }

        process.env[parsedLine.key] = parsedLine.value;
      }
    } catch (error) {
      if (error?.code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim() ?? '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '';

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your environment.'
    );
  }

  return { url, serviceRoleKey };
}

async function readDashboardData() {
  const fileContent = await readFile(dashboardDataPath, 'utf8');
  const parsedData = JSON.parse(fileContent);

  return {
    visits: Array.isArray(parsedData.visits) ? parsedData.visits : [],
    contactAttempts: Array.isArray(parsedData.contactAttempts) ? parsedData.contactAttempts : [],
  };
}

function chunkItems(items, chunkSize) {
  const chunks = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
}

function mapVisit(visit) {
  return {
    id: visit.id,
    visitor_id: visit.visitorId,
    path: visit.path,
    visited_at: visit.visitedAt,
    ip: visit.ip ?? null,
    user_agent: visit.userAgent ?? null,
  };
}

function mapContactAttempt(contactAttempt) {
  return {
    id: contactAttempt.id,
    name: contactAttempt.name,
    email: contactAttempt.email,
    message: contactAttempt.message,
    submitted_at: contactAttempt.submittedAt,
    status: contactAttempt.status,
    ip: contactAttempt.ip ?? null,
    user_agent: contactAttempt.userAgent ?? null,
    error_message: contactAttempt.errorMessage ?? null,
  };
}

async function upsertInChunks(client, tableName, rows) {
  for (const chunk of chunkItems(rows, UPSERT_BATCH_SIZE)) {
    if (!chunk.length) {
      continue;
    }

    const { error } = await client
      .from(tableName)
      .upsert(chunk, { onConflict: 'id', ignoreDuplicates: true });

    if (error) {
      throw new Error(`Could not backfill ${tableName}: ${error.message}`);
    }
  }
}

async function main() {
  await loadEnvironmentFiles();

  const { url, serviceRoleKey } = getSupabaseConfig();
  const supabase = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const dashboardData = await readDashboardData();
  const visitRows = dashboardData.visits.map(mapVisit);
  const contactAttemptRows = dashboardData.contactAttempts.map(mapContactAttempt);

  await upsertInChunks(supabase, 'visits', visitRows);
  await upsertInChunks(supabase, 'contact_attempts', contactAttemptRows);

  console.log(
    `Backfill completed: ${visitRows.length} visits and ${contactAttemptRows.length} contact attempts.`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Dashboard backfill failed.');
  process.exitCode = 1;
});
