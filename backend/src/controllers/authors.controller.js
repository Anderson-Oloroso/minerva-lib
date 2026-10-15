import { AuthorService } from "../services/authors.services.js";
import createAuthorDTO from "../dtos/createAuthor.dto.js";

export async function createAuthor(req, res, next){
    try{
        const authorDTO = new createAuthorDTO(req.body);

        const newAuthor = await AuthorService.create({name_author: authorDTO.name});

        res.status(201).json({
            status: 'Success',
            message: 'Autor creado exitosamente',
            data: newAuthor
        });
    }catch(err){
        next(err)
    }
}

export async function getAuthors(req, res, next){
    try{
        const authors = await AuthorService.list();
        res.status(200).json({
            status: 'Success',
            total: authors.length,
            data:authors
        });
    }catch(err){
        next(err);
    }
}