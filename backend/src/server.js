import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import app from './app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Carga el .env centralizado desde la raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor Minerva Lib corriendo en http://localhost:${PORT}`);
  console.log(`📡 Health Check disponible en http://localhost:${PORT}/api/health`);
});
