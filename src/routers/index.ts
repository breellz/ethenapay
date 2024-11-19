import { Router } from "express";
import { authRouter } from "./auth.route";
import { paymentRouter } from "./payment.route";
export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/payment", paymentRouter);
