import Pool from "../config/database.js";

export class PublisherService{
    static async create(data){
        const query = 'INSERT INTO publishers (name_publisher) VALUES (?)';
        const [ result ] = await Pool.execute(query, [data.publisher]);

        return {
            id: result.insertId,
            publisher: data.publisher
        }
    }

    static async list(){
        const query = 'SELECT id_publisher, name_publisher FROM publishers';
        const [ rows ] = await Pool.execute(query);

        return rows.map(row=>({
            id: row.id_publisher,
            publisher: row.name_publisher
        }));
    }
    
    static async update(data, id){
        const query = 'UPDATE publishers SET name_publisher = IFNULL(?, name_publisher) WHERE id_publisher = ?';
        const [ result ] = await Pool.execute(query, [data.publisher, id]);

        if(result.affectedRows === 0){
            return null;
        }

        return {
            id: id,
            publisher: data.publisher
        }
    }
}