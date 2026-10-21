import Pool from '../config/database.js';
import bycript from 'bcrypt';

export class AuthService{
    static async register(data){
        const salt = 10;
        const hashedPssw = await bycript.hash(data.password, salt);
        const query = 'INSERT INTO clients (dpi, name_client, last_name, phone, email, password, role) VALUES(?, ?, ?, ?, ?, ?, ?)';
        const defaultRole = 'client';

        const [ result ] = await Pool.execute(query, [data.doc, data.name, data.last_name, data.phone, data.email, hashedPssw, defaultRole]);

        return{
            id: result.insertId,
            name:`${data.name} ${data.last_name}`,
            email: data.email,
            role: defaultRole      
        };
    }

    static async login(email, password){
        const query = 'SELECT id_client, name_client, email, password, role FROM clients WHERE email = ?';
        const [ row ] = await Pool.execute(query, [email]);
        if(row.length === 0){
            return null;
        };

        const client = row[0];
        const isValid = await bycript.compare(password, client.password);

        if(!isValid){
            return null; // Contraseña incorrecta
        }

        return{
            id: client.id_client,
            name: client.name_client,
            email: client.email,
            role: client.role
        }
    }
}