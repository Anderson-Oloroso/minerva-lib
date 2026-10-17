// Aquí importo  createPoll a fin de crear un pool de conexiones para la aplicación
import { createPool } from 'mysql2/promise';
import path from 'path'; 
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url)); // Se obtiene la ruta de el archivo actual

// Carga el .env centralizado desde la raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const Pool = createPool({
    host: process.env.DB_HOST || 'db',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'secretpassword',
    database: process.env.DB_NAME || 'minerva_lib_db',
    waitForConnections: true,
    connectionLimit: 10
});

export default Pool;