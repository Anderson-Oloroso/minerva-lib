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
            message: 'Aun no hay editoriales en la base de datos',
        });
        }

        res.status(200).json({
            status: 'Success',
            message: 'Editoriales en la base de datos',
            data: publishers
        });
    }catch(err){
        next(err);
    }
}