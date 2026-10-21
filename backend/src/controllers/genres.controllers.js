import CreateGenreDto from '../dtos/genres.dto.js'
import { GenreService } from '../services/genres.service.js';

export async function createGenre(req, res, next){
    try{
        const genreDto = new CreateGenreDto(req.body);
        const newGenre = await GenreService.create({genre: genreDto.genre});

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
        const genres = await GenreService.list();
        
        if(!genres || genres === 0){
            res.status(200).json({
            status: 'Success',
            total: 0,
            message: 'Aun no hay Generos en la base de datos',
        });
        }

        res.status(200).json({
            status: 'Success',
            total: genres.length,
            message: 'Generos en la base de datos',
            data: genres
        });
    }catch(err){
        next(err);
    }
}

export async function updateGenre(req, res, next){
    try{
        const { id } = req.params;
        const newGenre = new CreateGenreDto(req.body);
        const updatedGenre = await GenreService.update({genre: newGenre.genre.trim() !== '' ? newGenre.genre : null}, id);

        if(!updatedGenre){
            res.status(404).json({
                status: 'Fail',
                message: 'Genero no encontrada'
            });
        }
        
        res.status(200).json({
            status: 'Success',
            message: 'Genero actualizado correctamente',
            data: updatedGenre
        });

    }catch(err){
        next(err);
    }
}

export async function deleteGenre(req, res, next){
    try{
        const { id } = req.params;
        const deletedGenre = await GenreService.delete(id);

        if(!deletedGenre){
            res.status(404).json({
                status: 'Fail',
                message: 'El id no ha sido encontrado'
            });
        }

        res.status(200).json({
            status: 'Success',
            message: 'Genero eliminado exitosamente'
        });
    }catch(err){
        next(err);
    }
}