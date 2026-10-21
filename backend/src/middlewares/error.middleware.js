export function errorHandler(err, req, res, next){
    res.status(err.statusCode || 500).json({
        mensaje: err.message || 'Error interno del servidor',
        errores: err.details || null
    });
}