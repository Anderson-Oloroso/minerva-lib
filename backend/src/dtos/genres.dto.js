import { body, param } from "express-validator";

export default class CreateGenreDto{
    #name_genre

    constructor(data){
        this.#name_genre = data.genre;
    }

    get genre(){ return this.#name_genre}
}

export const validationsCreateGenre = [
    body('publisher')
    .trim()
    .notEmpty().withMessage('El nombre el genero no puede estar vacío')
    .isString().withMessage('El nombre el genero tiene que tener una cadena de texto válida')
    .isLength({min: 4, max: 50}).withMessage('El nombre el genero tiene que ser mayor a 4 caracteres y menor a 50')
];

export const validateGenreId = [
    param('id').isInt({min: 1}).withMessage('El id de el género debe ser un número entero positivo')
];
