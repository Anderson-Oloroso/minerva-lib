import { Router } from "express";
import authorsRouter from "./authors.route.js"
import authRouter from "./auth.route.js";
import publishersRoute from "./publishers.route.js";

const apiRouter = Router();

apiRouter.use('/authors', authorsRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/publishers', publishersRoute);

export default apiRouter;