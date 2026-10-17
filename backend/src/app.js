import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/error.middleware.js';
import apiRouter from './routes/index.js';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

app.use(cookieParser('Alondra_|-|_871'));
app.use(cookieSession({
  name: 'minerba-lib-session', // Nobre de la cookiesession
  keys: ['Alondra_|-|_871'],  // Firma que valida la sesion
  maxAge: 60*60*1000 // Duracion 1h
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
