import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
    const token = req.cookies.access_token;

    if (!token) {
        return res.status(401).json({
            status: 'Fail',
            message: 'Usuario no autenticado. --> Iniciar Sesión'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            status: 'Fail',
            message: 'Token inválido o expirado'
        });
    }
}

export function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({
            status: 'Fail',
            message: 'Acceso denegado, se requiere permisos de administrador'
        });
    }
    next();
}