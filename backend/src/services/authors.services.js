import Pool from "../config/database.js";

export class AuthorService{
    static async create(data){
        const query = 'INSERT INTO authors (name_author) VALUES (?)';
        const [ result ] = await Pool.execute(query, [data.name_author]);

        return{
            id: result.insertId,
            name: data.name_author
        }
    }

    static async list(){
        const query = 'SELECT id_author AS id, name_author AS name FROM authors ORDER BY id_author ASC';
        const [ rows ] = await Pool.execute(query);
        return rows;
    }

    static async update(data, id){
        const query = 'UPDATE authors SET name_author = IFNULL(?, name_author) WHERE id_author = ?';
        const [ result ] = await Pool.execute(query, [data.name_author, id]);

        if(result.affectedRows === 0){
            return null;
        }

        return {
            id: id,
            name: data.name_author
        };
    }
}