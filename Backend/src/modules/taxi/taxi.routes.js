const express = require('express');

function registerTaxiRoutes(app) {
  const router = express.Router();

  // Placeholder endpoints. As you copy real controllers/models from master,
  // keep paths identical to avoid merge pain later.
  router.get('/health', (req, res) => res.json({ ok: true, module: 'taxi' }));

  app.use('/api/v1/taxi', router);
}

module.exports = { registerTaxiRoutes };

