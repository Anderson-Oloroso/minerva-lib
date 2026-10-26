import { Router } from "express";
import authorsRouter from "./author.route.js"
import authRouter from "./auth.route.js";

const apiRouter = Router();

apiRouter.use('/authors', authorsRouter);
apiRouter.use('/auth', authRouter);

export default apiRouter;