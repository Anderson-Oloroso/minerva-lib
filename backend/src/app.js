import express from 'express';
import cors from 'cors';

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Endpoint de verificación / Health Check
app.get('/api/minerva-lib/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Minerva Lib API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

export default app;
