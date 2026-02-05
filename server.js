import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

console.log('Starting Yellow Card Dashboard server...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', PORT);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


// Admin auth — protects all POST /api/* except /api/verify-admin
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
if (ADMIN_TOKEN) {
  console.log('Admin auth: enabled');
} else {
  console.log('Admin auth: DISABLED (set ADMIN_TOKEN in .env)');
}

app.use((req, res, next) => {
  if (req.method !== 'POST' || !req.path.startsWith('/api/')) return next();
  if (req.path === '/api/verify-admin') return next();
  if (!ADMIN_TOKEN) return next();
  const auth = req.headers['authorization'];
  if (auth === `Bearer ${ADMIN_TOKEN}`) return next();
  return res.status(403).json({ error: 'Forbidden' });
});

// Динамічне завантаження всіх API endpoints з папки api/
const apiDir = path.join(__dirname, 'api');

if (!fs.existsSync(apiDir)) {
  console.error('ERROR: api/ directory not found!');
  process.exit(1);
}

const apiFiles = fs.readdirSync(apiDir).filter(f => f.endsWith('.js'));

console.log(`\nFound ${apiFiles.length} API endpoints:`);

// Асинхронне завантаження endpoints
for (const file of apiFiles) {
  const routeName = file.replace('.js', '');
  const apiPath = `/api/${routeName}`;

  try {
    // Динамічний import для ES modules
    const apiFilePath = path.join(apiDir, file);
    const handlerModule = await import(`file://${apiFilePath}`);
    const handler = handlerModule.default || handlerModule;

    if (typeof handler !== 'function') {
      console.warn(`⚠ Warning: ${file} does not export a handler function`);
      continue;
    }

    // Adapter для Vercel-style handler → Express middleware
    app.all(apiPath, async (req, res) => {
      try {
        await handler(req, res);
      } catch (error) {
        console.error(`Error in ${apiPath}:`, error);
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Internal server error',
            message: error.message
          });
        }
      }
    });

    console.log(`  ✓ Registered: ${apiPath}`);
  } catch (error) {
    console.error(`  ✗ Failed to load ${file}:`, error.message);
  }
}

// Обслуговування статичних файлів з dist/
const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(distDir)) {
  console.error('\nERROR: dist/ directory not found!');
  console.error('Please run "npm run build" first to create the production build.');
  process.exit(1);
}

console.log('\nServing static files from: dist/');
app.use(express.static(distDir));

// SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(distDir, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (!res.headersSent) {
    res.status(500).json({
      error: 'Internal server error',
      message: err.message
    });
  }
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✓ Server running on http://0.0.0.0:${PORT}`);
  console.log('Ready to accept connections!\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
