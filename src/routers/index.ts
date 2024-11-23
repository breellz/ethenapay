import { Router } from "express";
import { authRouter } from "./auth.route";
import { paymentRouter } from "./payment.route";
import { swapRouter } from "./swap.route";
import { userRouter } from "./user.route";
export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/payment", paymentRouter);
apiRouter.use("/swap", swapRouter);
apiRouter.use("/user", userRouter);
