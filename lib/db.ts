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

export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  // Use a fresh client per query — required for Supabase session pooler
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows as T[];
  } catch (err) {
    // Log the query that failed for debugging
    console.error('[db] query error:', (err as Error).message);
    console.error('[db] failed query:', text.slice(0, 100));
    throw err;
  } finally {
    // Always release — this is what returns the connection to the pool
    client.release(true); // true = disconnect, don't keep in pool
  }
}

export async function queryOne<T = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
