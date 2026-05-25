require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const { initDB } = require('./models/user.model');
const userRoutes = require('./routes/user.routes');

const log = (event, extra = {}) =>
  console.log(JSON.stringify({ event, service: 'user-service', ts: new Date().toISOString(), ...extra }));

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '16kb' }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'user-service', ts: new Date().toISOString() });
});

app.use('/api/users', userRoutes);

app.use((err, req, res, next) => {
  log('unhandled_error', { message: err.message, path: req.path });
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const start = async () => {
  // Retry DB init up to 5 times (handles brief RDS Proxy startup lag)
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await initDB();
      log('db_init_ok');
      break;
    } catch (err) {
      log('db_init_retry', { attempt, error: err.message });
      if (attempt === 5) { log('db_init_failed'); process.exit(1); }
      await new Promise(r => setTimeout(r, attempt * 3000));
    }
  }

  const server = app.listen(PORT, () => log('startup', { port: PORT }));

  // ── Graceful shutdown for ASG scale-in (SIGTERM) ──────────────────────────
  // ASG lifecycle hook gives 30s before hard kill — we finish in 25s max.
  const shutdown = (signal) => {
    log('shutdown_start', { signal });
    server.close(() => {
      pool.end(() => {
        log('shutdown_complete', { signal });
        process.exit(0);
      });
    });
    setTimeout(() => { log('shutdown_forced'); process.exit(1); }, 25000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
};

start();
