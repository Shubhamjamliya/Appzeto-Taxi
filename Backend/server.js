import { createServer } from 'node:http';
import { createApp } from './src/app.js';
import { connectDatabase } from './src/config/database.js';
import { env } from './src/config/env.js';
import { configureSocketServer } from './src/socket/index.js';

const bootstrap = async () => {
  await connectDatabase();

  const app = createApp();
  const httpServer = createServer(app);

  configureSocketServer(httpServer);

  httpServer.listen(env.port, () => {
    console.log(`Taxi backend listening on port ${env.port}`);
  });
};

bootstrap().catch((error) => {
  console.error('Failed to start taxi backend', error);
  process.exit(1);
});
