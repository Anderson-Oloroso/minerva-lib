import { body } from 'express-validator';

export const validateCreateAuthor = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre del autor no puede estar vacío')
        .isString().withMessage('El nombre tiene que ser una cadena de texto válida')
        .isLength({ min:4, max: 50 }).withMessage('El nombre debe tener entre 4 a 50 caracteres')
];