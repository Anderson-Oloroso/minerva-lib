// Validador de express reutilizable
import {validationResult} from 'express-validator'

export function managerValidationErrors(req, res, next){
    const errores = validationResult(req);
    if(!errores.isEmpty()){
        const err = new Error('Errores de validación');
        err.statusCode = 400;
        err.details = errores.array()
        return next(err);
    }
    next();
}
