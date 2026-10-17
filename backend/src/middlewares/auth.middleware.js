// Valida el inicio de sesión
export function requireAuth(req, res, next){
  if(!req.session ||!req.session?.user ){
    return res.status(401).send({ error: 'Usuario no autenticado. --> Iniciar Sesión' });
  }
  next();
}

// Valida los permisos de la sesión
export function requireAdmin(req, res, next){
  if(req.session?.user?.role !== 'admin'){
    return res.status(403).json({ err: ' Acceso denegado, se requiere permisos de administrador' });
  } 
  next()
}