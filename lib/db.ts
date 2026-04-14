import { Pool } from 'pg';

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Supabase session pooler requires short-lived connections.
// We use a pool with conservative settings to avoid dropped connections.
declare global {
  var _pgPool: Pool | undefined;
}

function createPool(): Pool {
  return new Pool({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
    // Reconnect on connection errors
    allowExitOnIdle: false,
  });
}

export const pool: Pool =
  process.env.NODE_ENV === 'production'
    ? createPool()
    : (global._pgPool ??= createPool());

const RETRY_DELAY_MS = 500;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  // Retry once on transient connection errors (e.g. Supabase pooler drops
  // during high-concurrency static generation with 100+ pages).
  for (let attempt = 1; attempt <= 2; attempt++) {
    let client;
    try {
      client = await pool.connect();
      const result = await client.query(text, params);
      return result.rows as T[];
    } catch (err) {
      const msg = (err as Error).message ?? '';
      const isTransient =
        msg.includes('Connection terminated unexpectedly') ||
        msg.includes('connection timeout') ||
        msg.includes('ECONNRESET') ||
        msg.includes('EPIPE') ||
        msg.includes('read ECONNRESET');

      if (attempt === 1 && isTransient) {
        console.warn(
          `[db] transient error on attempt ${attempt}, retrying in ${RETRY_DELAY_MS}ms:`,
          msg
        );
        await sleep(RETRY_DELAY_MS);
        continue; // retry
      }

      // Non-transient or second failure — log and rethrow
      console.error('[db] query error:', msg);
      console.error('[db] failed query:', text.slice(0, 100));
      throw err;
    } finally {
      if (client) {
        client.release(true); // true = disconnect, don't keep in pool
      }
    }
  }
  // TypeScript: unreachable but required
  throw new Error('[db] query failed after retries');
}

export async function queryOne<T = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
