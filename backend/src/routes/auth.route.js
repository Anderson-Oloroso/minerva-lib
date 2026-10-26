import { Router } from "express";
import { managerValidationErrors } from "../middlewares/validate.middleware.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

import { validationsRegister, validationsLogin } from "../validators/auth.validator.js";

import Pool from "../config/database.js";
import ClientModel from "../models/client.model.js";
import AuthService from "../services/auth.service.js";
import AuthController from "../controllers/auth.controller.js";

// Ensamblaje con inyección de dependencias
const clientModel = new ClientModel(Pool);
const authService = new AuthService(clientModel);
const authController = new AuthController(authService);

const authRouter = Router();

authRouter.post('/register', validationsRegister, managerValidationErrors, authController.register);
authRouter.post('/login',    validationsLogin, managerValidationErrors, authController.login);
authRouter.post('/logout',   requireAuth, authController.logout);
authRouter.get('/profile',   requireAuth, authController.profile);

export default authRouter;