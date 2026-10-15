import { Router } from "express";
import authorsRouter from "./authors.routes.js"

const apiRouter = Router();

apiRouter.use('/authors', authorsRouter);

export default apiRouter;