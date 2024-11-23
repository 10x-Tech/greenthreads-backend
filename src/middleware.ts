import {
  ClerkExpressRequireAuth,
  LooseAuthProp,
  WithAuthProp,
} from "@clerk/clerk-sdk-node";
import { Request, Response, NextFunction } from "express";
import { AuthObject, SignedInAuthObject } from "@clerk/backend/internal";

/* extend Express Request */
declare global {
  namespace Express {
    interface Request extends LooseAuthProp {}
  }
}

const clerk = ClerkExpressRequireAuth({});

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  await clerk(req, res, next);
};

export const checkAuth = (
  req: WithAuthProp<Request>,
  res: Response,
  next: NextFunction
) => {
  if (!req?.auth?.userId)
    return res.status(401).json({
      success: false,
      message: "Please login to continue",
    });
  else next();
};

export const bufferToJSON = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (["PUT", "POST", "PATCH"].includes(req.method) && req.body) {
    const stringify = (req.body as Buffer).toString("utf-8");
    req.body = JSON.parse(stringify ?? "{}");
  }
  next();
};

import multer from "multer";
import path from "path";
import AppError from "./utils/AppError";
import { VendorRole } from "@prisma/client";

// Multer configuration
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "uploadImage")); // Set the destination folder for uploads
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + "-" + Date.now()); // Set the filename
    },
  }),
});

export const handleFileUpload = upload.single("file"); // This middleware will handle single file uploads with the field name 'file'

// Define the structure of the roles in the request
interface RoleRequest extends Request {
  roles?: string[];
}

// TypeScript version of the verifyRoles function
export const verifyRoles = (...allowedRoles: string[]) => {
  return (req: RoleRequest, res: Response, next: NextFunction) => {
    if (!req?.roles) return res.sendStatus(401);

    const rolesArray = [...allowedRoles];
    const result = req.roles
      .map((role) => rolesArray.includes(role))
      .find((val) => val === true);

    if (!result) return res.sendStatus(401);

    next();
  };
};

// Middleware to authorize based on roles
export const authorizeRoles = (...allowedRoles: ("ADMIN" | "SELLER")[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.auth;

    if (!user) {
      return next(new AppError(401, "Unauthenticated"));
    }

    const userRole = user.sessionClaims.metadata.role;
    // console.log(userRole, "ROLE");
    if (!allowedRoles.includes(userRole)) {
      return next(new AppError(403, "Forbidden"));
    }

    next();
  };
};
