const { registerTaxiRoutes } = require('../modules/taxi/taxi.routes');

function registerRoutes(app) {
  // Keep the base path aligned with the master project style (/api/v1/...)
  app.get('/api/v1', (req, res) => res.json({ ok: true, service: 'taxi' }));

  registerTaxiRoutes(app);
}

module.exports = { registerRoutes };

