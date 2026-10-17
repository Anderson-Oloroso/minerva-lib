import { Router } from "express";
import { validationsCreatePublisher, validatePublisherId } from "../dtos/publishers.dto.js";
import { requireAdmin, requireAuth } from "../middlewares/auth.middleware.js";
import { managerValidationErrors } from "../middlewares/validate.middleware.js";
import { createPublisher, listPublishers, updatePublisher } from "../controllers/publishers.contrioller.js";

const publishersRoute = Router()

// Modulo de creacion de editoriales
publishersRoute.post('/', requireAuth, requireAdmin, validationsCreatePublisher, managerValidationErrors, createPublisher);
publishersRoute.get('/', listPublishers);
publishersRoute.put('/:id', requireAuth, requireAdmin, validatePublisherId, managerValidationErrors, updatePublisher);

export default publishersRoute;