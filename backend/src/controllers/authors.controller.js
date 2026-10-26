import createAuthorDTO from "../dtos/authors.dto.js";

export default class AuthorController{
    #authorModel

    constructor(model){
        this.#authorModel = model;

        // Amarrar el contexto con .bind
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async getAll(req, res, next){
        try{
            const authors = await this.#authorModel.list();
            res.status(200).json({
                status: 'Success',
                total: authors.length,
                data: authors
            });
        }catch(err){
            next(err);
        }
    }

    async getById(req, res, next){
        try{
            const { id } = req.params;
            const author = await this.#authorModel.getById(id);

            if(!author){
                return res.status(404).json({
                    status: 'Fail',
                    message: 'Autor no encontrado'
                });
            }

            res.status(200).json({
                status: 'Success',
                data: author
            });
        }catch(err){
            next(err);
        }
    }

    async create(req, res, next){
        try{
            const authorDto = new createAuthorDTO(req.body);
            const newAuthor = await this.#authorModel.create({ name: authorDto.name });

            res.status(201).json({
                status: 'Success',
                message: 'Autor creado exitosamente',
                data: newAuthor
            });
        }catch(err){
            next(err);
        }
    }

    async update(req, res, next){
        try{
            const { id } = req.params;
            const authorDto = new createAuthorDTO(req.body);
            const newValue = authorDto.name.trim() === '' ? null : authorDto.name;

            const updatedAuthor = await this.#authorModel.update({ name: newValue}, id);

            if(!updatedAuthor){
                return res.status(404).json({
                    status: 'Fail',
                    message: 'Autor no encontrado'
                });
            }

            res.status(200).json({
                status: 'Success',
                message: 'Autor modificado correctamente',
                data: updatedAuthor
            });
        }catch(err){
            next(err);
        }
    }

    async delete(req, res, next){
        try{
            const { id } = req.params;
            const wasDeleted = await this.#authorModel.delete(id);

            if(!wasDeleted){
                return res.status(404).json({
                    status: 'Fail',
                    message: 'Autor no encontrado'
                });
            }

            res.status(200).json({
                status: 'Success',
                message: 'Autor eliminado correctamente',
            });
        }catch(err){
            next(err);
        }
    }
}
