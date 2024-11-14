import { Request, Response, NextFunction } from "express";
import * as paseto from 'paseto';
import { User, IUser, UserStatusEnum, UserRoleEnum } from "../models/user/user.model"



export interface CustomRequest extends Request {
  user?: IUser;
  token?: string;
  admin?: IUser
}

export const Auth = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user, token } = await BaseAuth(req, res, next);
    req.user = user;
    req.token = token;
    next()
  } catch (error) {
    console.log(error);
    res.status(401).send({ error: "You are not authenticated" });
  }
};

export const BaseAuth = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<{ user: IUser, token: string }> => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new Error("no token was found");
  }
  const { V4: { verify } } = paseto
  const decoded = await verify(token, process.env.PASETO_PUBLIC_KEY as string);
  if (decoded.type !== 'access') {
    throw new Error('Invalid token type');
  }

  const user: IUser | null = await User.findOne({
    _id: decoded._id
  })
  if (!user || (user.signOutTime && (decoded.issuedAt as number) < user.signOutTime.getTime())) {
    throw new Error("Token inactive");
  }
  if (user.status === UserStatusEnum.DEACTIVATED || user.status === UserStatusEnum.BANNED) {
    throw new Error("Account deactivated");
  }

  return { user, token };
};

export const AuthWithEmailVerification = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user, token } = await BaseAuth(req, res, next);

    if (user!.status === UserStatusEnum.PENDING) {
      throw new Error(
        "User profile is not active, please complete registration"
      );
    }

    if (user!.status !== UserStatusEnum.ACTIVE) {
      throw new Error("Account restricted");
    }
    if (!user!.isEmailVerified) {
      throw new Error("Email  not verified")
    }

    if (!user!.permissions) {
      throw new Error("User has no permissions, please complete registration");
    }
    req.user = user;
    req.token = token
    next();
  } catch (error) {
    console.log(error);
    res.status(401).send({ error: error.message });
  }
};

export const AdminOrRootAdminAuth = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user, token } = await BaseAuth(req, res, next);
    if (![UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN].includes(user.role)) {
      throw new Error("You are not authorized to perform this action");
    }

    if (![UserStatusEnum.ACTIVE, UserStatusEnum.PENDING].includes(user.status)) {
      throw new Error("Account banned or deactivated, contact support.");
    }

    req.user = user;
    req.admin = user;
    next();
  } catch (error) {
    res.status(401).send({ error: error.message });
  }
};

export const RootAuth = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = await BaseAuth(req, res, next);

    if (user.role !== UserRoleEnum.SUPERADMIN) {
      throw new Error("You are not authorized to perform this action");
    }

    if (!user?.isRoot) {
      throw new Error("You are not authorized to perform this action");
    }

    req.user = user;
    req.admin = user;
    next();
  } catch (error) {
    res.status(401).send({ error: error?.message });
  }
};
