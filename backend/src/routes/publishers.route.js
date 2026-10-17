import { Router } from "express";
import { validationsCreatePublisher, validatePublisherId } from "../dtos/publishers.dto.js";
import { requireAdmin, requireAuth } from "../middlewares/auth.middleware.js";
import { managerValidationErrors } from "../middlewares/validate.middleware.js";
import { createPublisher } from "../controllers/publishers.contrioller.js";

const publishersRoute = Router()

// Modulo de creacion de editoriales
publishersRoute.post('/', requireAuth, requireAdmin, validationsCreatePublisher, managerValidationErrors, createPublisher);

export default publishersRoute;