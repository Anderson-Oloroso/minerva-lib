export default class ClientModel {
    #db;

    constructor(db) {
        this.#db = db;
    }

    async findByEmail(email) {
        const query = 'SELECT id_client, name_client, last_name, email, password, role FROM clients WHERE email = ?';
        const [ rows ] = await this.#db.execute(query, [email]);
        return rows[0] ?? null;
    }

    async create(data) {
        const query = 'INSERT INTO clients (dpi, name_client, last_name, phone, email, password, role) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [ result ] = await this.#db.execute(query, [
            data.dpi,
            data.name,
            data.last_name,
            data.phone,
            data.email,
            data.password,
            data.role
        ]);
        return result.insertId;
    }
}