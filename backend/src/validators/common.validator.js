import { param } from 'express-validator';

export const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El id debe ser un número entero positivo')
];