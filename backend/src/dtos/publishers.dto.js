import { body, param } from "express-validator";

export default class CreatePublisherDto{
    #name_publisher

    constructor(data){
        this.#name_publisher = data.publisher;
    }

    get publisher(){ return this.#name_publisher}
}

export const validationsCreatePublisher = [
    body('publisher')
    .trim()
    .notEmpty().withMessage('El nombre de la editorial no puede estar vacío')
    .isString().withMessage('El nombre de la editorial tiene que tener una cadena de texto válida')
    .isLength({min: 4, max: 50}).withMessage('El nombre de la editorial tiene que ser mayor a 4 caracteres y menor a 50')
];

export const validatePublisherId = [
    param('id').isInt({min: 1}).withMessage('El id de la editorial debe ser un número entero positivo')
];
