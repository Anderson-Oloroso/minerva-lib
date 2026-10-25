export default class AuthorModel{
    #db;

    constructor(db){
        this.#db = db;
    }

    async list(){
        const query = 'SELECT id_author AS id, name_author AS name FROM authors ORDER BY id_author ASC';
        const [ rows ] = await this.$db.execute(query);
        return rows;
    }

    async getById(id){
        const query = 'SELECT id_author AS id, name_author AS name FROM authors WHERE id_author = ?';
        const [ rows ] = await this.#db.execute(query, [id]);
        return rows[0] ?? null;
    }

    async create(author){
        const query = 'INSERT INTO authors (name_author) VALUES (?)';
        const [ result ] = await this.#db.execute(query, [author.name]);
        return {
            id: result.insertId,
            name: author.name
        }
    }

    async update(author, id){
        const query = 'UPDATE authors SET name_author = IFNULL(?, name_author) WHERE id = ?';
        const [ result] = await this.#db.execute(query, [author.name]);

        if(result.affectedRows === 0) return null;
        
    }

    async delete(id){
        const query = 'DELETE froms WHERE id_author = ?';
        const [ result ] = await this.#db.execute(query, [id]);

        return await result.affectedRows > 0;
    }
}