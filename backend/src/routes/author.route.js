import { Router } from "express";
import { managerValidationErrors } from "../middlewares/validate.middleware.js";
import { requireAdmin, requireAuth } from '../middlewares/auth.middleware.js'
import { validateCreateAuthor } from "../validators/author.validator.js";
import { validateId } from "../validators/common.validator.js";

import Pool from "../config/database.js";
import AuthorModel from "../models/author.model.js";
import AuthorController from "../controllers/author.controller.js";

const authorModel = new AuthorModel(Pool);
const authorController = new AuthorController(authorModel);

const authorsRouter = Router();

authorsRouter.get('/', requireAuth, authorController.getAll);
authorsRouter.get('/:id', requireAuth, validateId, managerValidationErrors, authorController.getById);
authorsRouter.post('/', requireAuth, requireAdmin, validateCreateAuthor, managerValidationErrors, authorController.create);
authorsRouter.put('/:id', requireAuth, requireAdmin, validateId, managerValidationErrors, authorController.update);
authorsRouter.delete('/:id', requireAuth, requireAdmin, validateId, managerValidationErrors, authorController.delete);

export default authorsRouter;