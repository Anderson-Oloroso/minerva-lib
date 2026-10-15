import Pool from "../config/database.js";

export class AuthorService{
    static async create(data){
        const query = 'INSERT INTO authors (name_author) VALUES (?)';
        const [ result ] = await Pool.execute(query, [data.name_author]);

        return{
            id_author: result.insertId,
            name_author: data.name_author
        }
    }

    static async list(){
        const query = 'SELECT * FROM authors ORDER BY id_author ASC';
        const [ rows ] = await Pool.execute(query);
        return rows;
    }
}