import { Router } from "express";
import { validationsCreateAuthor } from "../dtos/authors.dto.js";
import { managerValidationErrors } from "../middlewares/validate.middleware.js";
import { createAuthor, getAuthors } from "../controllers/authors.controller.js";

const authorsRouter = Router();

// Endpoint GET para listar autores
authorsRouter.get('/', getAuthors);

// Endpoint POST para crear un autor
authorsRouter.post('/', validationsCreateAuthor, managerValidationErrors, createAuthor);
export default authorsRouter;