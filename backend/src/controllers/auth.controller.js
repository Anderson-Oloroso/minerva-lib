import AuthDTO from "../dtos/auth.dto.js";

export default class AuthController {
    #authService;

    constructor(authService) {
        this.#authService = authService;
        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.profile = this.profile.bind(this);
    }

    async register(req, res, next) {
        try {
            const dto = new AuthDTO(req.body);
            const newClient = await this.#authService.register({
                dpi: dto.doc,
                name: dto.name,
                last_name: dto.last_name,
                phone: dto.phone,
                email: dto.email,
                password: dto.password
            });

            res.status(201).json({
                status: 'Success',
                message: 'Cliente registrado correctamente',
                data: newClient
            });
        } catch (err) {
            next(err);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const client = await this.#authService.login(email, password);

            if (!client) {
                return res.status(401).json({
                    status: 'Fail',
                    message: 'El correo o la contraseña son incorrectos'
                });
            }

            req.session.user = client;

            res.status(200).json({
                status: 'Success',
                message: 'Inicio de sesión exitoso',
                data: client
            });
        } catch (err) {
            next(err);
        }
    }

    async logout(req, res, next) {
        try {
            req.session = null;
            res.status(200).json({
                status: 'Success',
                message: 'Sesión cerrada exitosamente'
            });
        } catch (err) {
            next(err);
        }
    }

    async profile(req, res, next) {
        try {
            res.status(200).json({
                status: 'Success',
                data: req.session.user
            });
        } catch (err) {
            next(err);
        }
    }
}