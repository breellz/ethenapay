import { Router } from "express";
import { authRouter } from "./auth.route";
import { appRouter } from "./app.route";
import { settingsRouter } from "./settings.route";
import { adminRouter } from "./admin";
import { userRouter } from "./user.route";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/app", appRouter);
apiRouter.use("/settings", settingsRouter)
apiRouter.use("/admin", adminRouter);
apiRouter.use("/user", userRouter);
