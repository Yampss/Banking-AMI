const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'accounts_db',
  user:     process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl:      { rejectUnauthorized: false },
  max:                    10,
  min:                     2,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis:      30000,
  allowExitOnIdle:        false,
});

pool.on('error', (err) => {
  console.error(JSON.stringify({ event: 'pg_pool_error', service: 'account-service', message: err.message, ts: new Date().toISOString() }));
});

pool.on('connect', () => {
  console.log(JSON.stringify({ event: 'pg_connect', service: 'account-service', ts: new Date().toISOString() }));
});

module.exports = pool;
