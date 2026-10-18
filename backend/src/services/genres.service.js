import Pool from "../config/database.js";

export class GenreService{
    static async create(data){
        const query = 'INSERT INTO genres (name_genre) VALUES (?)';
        const [ result ] = await Pool.execute(query, [data.genre]);

        return {
            id: result.insertId,
            genre: data.genre
        }
    }

    static async list(){
        const query = 'SELECT id_genre, name_genre FROM genres';
        const [ rows ] = await Pool.execute(query);

        return rows.map(row=>({
            id: row.id_genre,
            genre: row.name_genre
        }));
    }
    
    static async update(data, id){
        const query = 'UPDATE genres SET name_genre = IFNULL(?, name_genre) WHERE id_genre = ?';
        const [ result ] = await Pool.execute(query, [data.genre, id]);

        if(result.affectedRows === 0){
            return null;
        }

        return {
            id: id,
            genre: data.genre === null ? '[AVISO]: genero no modificado' : data.genre
        }
    }

    static async delete(id){
        const query = 'DELETE FROM genres WHERE id_genre = ?';
        const [ result ] = await Pool.execute(query, [id]);

        if(result.affectedRows === 0){
            return null
        }

        return result.affectedRows > 0;
    }
}