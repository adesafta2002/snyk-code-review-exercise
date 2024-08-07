import * as express from 'express';
import { getPackage } from './package';
import { errorHandler } from './error-handler';

/**
 * Bootstrap the application framework
 */
export function createApp(): express.Express {
  const app = express();

  app.use(express.json());

  app.get('/package/*', getPackage);

  // moved handling to getPackage function
  // app.use(errorHandler);

  return app;
}
