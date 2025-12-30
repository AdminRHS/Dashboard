const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

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

// Динамічне завантаження всіх API endpoints з папки api/
const apiDir = path.join(__dirname, 'api');

if (!fs.existsSync(apiDir)) {
  console.error('ERROR: api/ directory not found!');
  process.exit(1);
}

const apiFiles = fs.readdirSync(apiDir).filter(f => f.endsWith('.js'));

console.log(`\nFound ${apiFiles.length} API endpoints:`);

apiFiles.forEach(file => {
  const routeName = file.replace('.js', ''); // delete-violation.js → delete-violation
  const apiPath = `/api/${routeName}`;

  try {
    // Динамічний import Vercel handler
    // Vercel Functions експортують: export default async function handler(req, res)
    const handlerModule = require(path.join(apiDir, file));
    const handler = handlerModule.default || handlerModule;

    if (typeof handler !== 'function') {
      console.warn(`⚠ Warning: ${file} does not export a handler function`);
      return;
    }

    // Adapter для Vercel-style handler → Express middleware
    // Vercel handler сумісний з Express req/res, тому просто передаємо їх
    app.all(apiPath, async (req, res) => {
      try {
        await handler(req, res);
      } catch (error) {
        console.error(`Error in ${apiPath}:`, error);
        // Перевіряємо чи response вже відправлено
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
});

// Обслуговування статичних файлів з dist/
const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(distDir)) {
  console.error('\nERROR: dist/ directory not found!');
  console.error('Please run "npm run build" first to create the production build.');
  process.exit(1);
}

console.log('\nServing static files from: dist/');
app.use(express.static(distDir));

// SPA fallback: всі невідомі роути → index.html
// Це потрібно для HTML5 History API (client-side routing)
app.get('*', (req, res) => {
  // Ігноруємо API роути
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
