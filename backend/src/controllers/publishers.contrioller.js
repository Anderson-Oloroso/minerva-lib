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