import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/error.middleware.js';
import apiRouter from './routes/index.js';
import { logger } from './middlewares/logger.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();

// Middlewares globales
app.use(logger);
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Health Check
app.get('/api/minerva-lib/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Minerva Lib API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/minerva-lib', apiRouter);

app.use(errorHandler);

export default app;