import { createServer } from 'node:http';
import { createApp } from './src/app.js';
import { connectDatabase } from './src/config/database.js';
import { env } from './src/config/env.js';
import { configureTaxiSocketServer } from './src/modules/taxi/socket/index.js';
import { ensureDefaultUserSeeded } from './src/modules/taxi/user/services/userSeedService.js';

const bootstrap = async () => {
  await connectDatabase();
  await ensureDefaultUserSeeded();

  const app = createApp();
  const httpServer = createServer(app);

  configureTaxiSocketServer(httpServer);

  httpServer.listen(env.port, () => {
    console.log(`Taxi backend listening on port ${env.port}`);
  });
};

bootstrap().catch((error) => {
  console.error('Failed to start taxi backend', error);
  process.exit(1);
});
