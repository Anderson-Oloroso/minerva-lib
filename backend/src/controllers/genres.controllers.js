import CreateGenreDto from '../dtos/genres.dto.js'
import { GenreService } from '../services/genres.service.js';

export async function createGenre(req, res, next){
    try{
        const genreDto = new CreateGenreDto(req.body);
        const newGenre = await GenreService.create({publisher: genreDto.publisher});

        res.status(201).json({
            status: 'Success',
            message: 'Genero creado correctamente',
            data: newGenre
        });
    }catch(err){
        next(err);
    }
}

export async function listGenres(req, res, next){
    try{
        const publishers = await GenreService.list();
        
        if(!publishers || publishers === 0){
            res.status(200).json({
            status: 'Success',
            total: 0,
            message: 'Aun no hay Generos en la base de datos',
        });
        }

        res.status(200).json({
            status: 'Success',
            total: publishers.length,
            message: 'Generos en la base de datos',
            data: publishers
        });
    }catch(err){
        next(err);
    }
}

export async function updateGenre(req, res, next){
    try{
        const { id } = req.params;
        const newGenre = new CreateGenreDto(req.body);
        const updatedPublisher = await GenreService.update({publisher: newGenre.publisher.trim() !== '' ? newGenre.publisher : null}, id);

        if(!updatedPublisher){
            res.status(404).json({
                status: 'Fail',
                message: 'Genero no encontrada'
            });
        }
        
        res.status(200).json({
            status: 'Success',
            message: 'Genero actualizado correctamente',
            data: updatedPublisher
        });

    }catch(err){
        next(err);
    }
}

export async function deleteGenre(req, res, next){
    try{
        const { id } = req.params;
        const deletedPublisher = await GenreService.delete(id);

        if(!deletedPublisher){
            res.status(404).json({
                status: 'Fail',
                message: 'El id no ha sido encontrado'
            });
        }

        res.status(200).json({
            status: 'Success',
            message: 'Genero eliminada exitosamente'
        });
    }catch(err){
        next(err);
    }
}