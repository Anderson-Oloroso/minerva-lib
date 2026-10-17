import Pool from "../config/database";

export class PublisherService{
    static async create(data){
        const query = 'INSERT INTO publishers (name_publisher) VALUES (?)';
        const [ result ] = await Pool.execute(query, [data.publisher]);

        return {
            id: result.insertId,
            publisher: data.publisher
        }
    }
}