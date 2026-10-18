import CreatePublisherDto from '../dtos/publishers.dto.js'
import { PublisherService } from '../services/publishers.service.js';

export async function createPublisher(req, res, next){
    try{
        const publisherDto = new CreatePublisherDto(req.body);
        const newPublisher = await PublisherService.create({publisher: publisherDto.publisher});

        res.status(201).json({
            status: 'Success',
            message: 'Editorial creada correctamente',
            data: newPublisher
        });
    }catch(err){
        next(err);
    }
}

export async function listPublishers(req, res, next){
    try{
        const publishers = await PublisherService.list();
        
        if(!publishers || publishers === 0){
            res.status(200).json({
            status: 'Success',
            total: 0,
            message: 'Aun no hay editoriales en la base de datos',
        });
        }

        res.status(200).json({
            status: 'Success',
            total: publishers.length,
            message: 'Editoriales en la base de datos',
            data: publishers
        });
    }catch(err){
        next(err);
    }
}

export async function updatePublisher(req, res, next){
    try{
        const { id } = req.params;
        const newPublisher = new CreatePublisherDto(req.body);
        const updatedPublisher = await PublisherService.update({publisher: newPublisher.publisher.trim() !== '' ? newPublisher.publisher : null}, id);

        if(!updatedPublisher){
            res.status(404).json({
                status: 'Fail',
                message: 'Editorial no encontrada'
            });
        }
        
        res.status(200).json({
            status: 'Success',
            message: 'Editorial actualizada correctamente',
            data: updatedPublisher
        });

    }catch(err){
        next(err);
    }
}

export async function deletePublisher(req, res, next){
    try{
        const { id } = req.params;
        const deletedPublisher = await PublisherService.delete(id);

        if(!deletedPublisher){
            res.status(404).json({
                status: 'Fail',
                message: 'El id no ha sido encontrado'
            });
        }

        res.status(200).json({
            status: 'Success',
            message: 'Editorial eliminada exitosamente'
        });
    }catch(err){
        next(err);
    }
}