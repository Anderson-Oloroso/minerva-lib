import { Router } from "express";
import { validateId, validationsCreateAuthor} from "../dtos/authors.dto.js";
import { managerValidationErrors } from "../middlewares/validate.middleware.js";

const authorsRouter = Router();

// Endpoint GET para listar autores
authorsRouter.get('/', getAuthors);

// Endpoint POST para crear un autor
authorsRouter.post('/', validationsCreateAuthor, managerValidationErrors, createAuthor);

// Endpoint PUT para actualizar autor
authorsRouter.put('/:id', validateId, managerValidationErrors, updateAuthor);

// Endpoint DELETE para eliminar un autor
authorsRouter.delete('/:id', validateId, managerValidationErrors, deleteAuthor);

export default authorsRouter;