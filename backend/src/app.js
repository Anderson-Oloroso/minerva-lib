import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/error.middleware.js';
import apiRouter from './routes/index.js';
import cookieSession from 'cookie-session';
import { logger } from './middlewares/logger.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const sessionSecret = process.env.SESSION_SECRET;
const isProduction = process.env.NODE_ENV === 'production';

// if (isProduction && (!sessionSecret || sessionSecret.length < 32)) {
//   throw new Error('SESSION_SECRET must be set to a secret of at least 32 characters');
// }

const sessionSigningKey = sessionSecret && sessionSecret.length >= 32
  ? sessionSecret
  : randomBytes(48).toString('base64url');

const app = express();

// Middlewares globales
app.use(logger);
app.use(cors());
app.use(express.json());

app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);

app.use(cookieSession({
  name: 'minerba-lib-session',
  keys: [sessionSigningKey],
  secure: isProduction,
  maxAge: 60 * 60 * 1000
}));
// Endpoint de verificación / Health Check
app.get('/api/minerva-lib/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Minerva Lib API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/minerva-lib', apiRouter); // Rutas que vienen desde index.js

app.use(errorHandler); // Capturador de errores

export default app;