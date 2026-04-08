const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { registerRoutes } = require('./routes');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan('dev'));

  app.get('/health', (req, res) => res.json({ ok: true }));

  registerRoutes(app);

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  });

  return app;
}

module.exports = { createApp };

