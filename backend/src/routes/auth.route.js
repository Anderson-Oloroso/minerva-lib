import { Router } from "express";
import { validationsLogin, validationsRegister } from "../dtos/auth.dto.js";
import { managerValidationErrors } from "../middlewares/validate.middleware.js";
import { getProfile, login, logout, register } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post('/register', validationsRegister, managerValidationErrors, register);
authRouter.post('/login', validationsLogin, managerValidationErrors, login);
authRouter.post('/logout', logout);
authRouter.get('/profile', getProfile);

export default authRouter;