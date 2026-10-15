import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import app from './app.js';
import Pool from './config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Carga el .env centralizado desde la raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor Minerva Lib corriendo en http://localhost:${PORT}`);
  console.log(`Health Check disponible en http://localhost:${PORT}/api/minerva-lib/health`);
});

(
  async ()=>{
    try{
      const connection = await Pool.getConnection();
      console.log('Conexión con la base de datos exitosa! -> minerva_lib_db');
      connection.release();
    }catch(err){  
      console.log('Error al conectarse con la base de datos minerva_lib_db', err.message);
      process.exit(1);
    }
  }
)();