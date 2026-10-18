import { AuthorService } from "../services/authors.service.js";
import createAuthorDTO from "../dtos/authors.dto.js";

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
            message: 'Autores en la base de datos',
            data:authors
        });
    }catch(err){
        next(err);
    }
}

export async function updateAuthor(req, res, next){
    try{
        const { id } = req.params;
        const newData = new createAuthorDTO(req.body);
        const updatedAuthor = await AuthorService.update({name_author: newData.name.trim() === "" ? null: newData.name}, id);
        
        if(!updatedAuthor){
            return res.status(404).json({
                status: 'Fail',
                message: 'Autor no encontrado'
            });
        }

        res.status(200).json({
            status: 'Success',
            message: 'Editorial modificada correctamente',
            data: updatedAuthor
        });

    }catch(err){
        next(err);
    }
}

export async function deleteAuthor(req, res, next){
    try{
        const { id } = req.params;
        const deletedAuthor = await AuthorService.delete(id);       
        if(!deletedAuthor){
            return res.status(404).json({
                status: 'Fail',
                message: 'Autor no encontrado'
            });
        }

        res.status(200).json({
            status: 'Success',
            message: 'Autor eliminado exitosamente'
        });

    }catch(err){
        next(err);
    }
}