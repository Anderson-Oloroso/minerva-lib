import { body, param } from "express-validator"

export default class createAuthorDTO{
    #name_author // NO olvidar --> Propiedad privada de la clase

    constructor(data){
        this.#name_author = data.name // Prepara el objeto listo para usar
    }

    set name(data){ this.#name_author = data } // Permite cambiarle valor a la variable
    get name (){ return this.#name_author} // Permite leer el dato de forma natural
}

export const validationsCreateAuthor = [
    body('name')
    .trim()
    .notEmpty().withMessage('El nombre del autor no puede estar vacio')
    .isString().withMessage('El nombre tiene que ser una cadena de texto válido')
    .isLength({min: 4, max: 50}).withMessage('El nombre debe tener entre 4 a 50 aracteres')
];

export const validateId = [
    param('id').isInt({min: 1}).withMessage('El id debe ser un número entero positivo')
];
