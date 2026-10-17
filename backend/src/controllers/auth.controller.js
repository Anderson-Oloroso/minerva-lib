import { AuthService } from "../services/auth.service.js";
import AuthDTO from "../dtos/auth.dto.js";

// Registrar -- COmo una funcionalidad o modificacion directa, cambiar el nombre de clients en todo y cambiarlo a users
export async function register(req, res, next){
    try{
        const authDto = new AuthDTO(req.body);
        const newUser = await AuthService.register({
            doc: authDto.doc,
            name: authDto.name,
            last_name: authDto.last_name,
            phone: authDto.phone,
            email: authDto.email,
            password: authDto.password
        });

        res.status(201).json({
            status: 'Succes',
            message: 'Cliente registrado correctamente',
            data: newUser
        });
    }catch(err){
        next(err)
    }
}

// Login
export async function login(req, res, next){
    try{
        const { email, password } = req.body;
        const user = await AuthService.login(email, password);

        if(!user){
            return res.status(401).json({
                status: 'Fail',
                message: 'El correo o la contraseña son incorrectos'
            });
        }

        req.session.user = user;

        res.status(200).json({
            status: 'Success',
            message: 'Inicio de sesión exitoso',
            data: user
        });
    }catch(err){
        next(err);
    }
}

// Logout
export async function logout(req, res, next){
    try{
        req.session = null;
        res.status(200).json({
            status: 'Success',
            message: 'Sesión cerrada exitosamente'
        });
    }catch(err){
        next(err);
    }
}

// Verificar sesión
export async function  getProfile(req, res, next){
    try{
        if(!req.session || !req.session.user){
            return res.status(401).json({
                status: 'Fail',
                message: 'No hay sesión activa'
            });
        }

        res.status(200).json({
            status: 'Success',
            data: req.session.user
        });
    }catch(err){
        next(err);
    }
}