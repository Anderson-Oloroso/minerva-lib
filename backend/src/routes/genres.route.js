import { Router } from "express";
import { managerValidationErrors } from "../middlewares/validate.middleware.js";
import { createGenre, deleteGenre, listGenres, updateGenre } from "../controllers/genres.controllers.js";
import { validateGenreId, validationsCreateGenre } from "../dtos/genres.dto.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware.js";

const genresRouter = Router();

genresRouter.get('/', listGenres);
genresRouter.post('/', requireAuth, requireAdmin, validationsCreateGenre, managerValidationErrors, createGenre);
genresRouter.put('/:id', requireAuth, requireAdmin, validateGenreId, managerValidationErrors, updateGenre)
genresRouter.delete('/:id', requireAuth, requireAdmin, validateGenreId, managerValidationErrors, deleteGenre);

export default genresRouter;