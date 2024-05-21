import {
  ClerkExpressRequireAuth,
  ClerkExpressWithAuth,
  LooseAuthProp,
  WithAuthProp,
} from "@clerk/clerk-sdk-node";
import { Request, Response, NextFunction } from "express";

/* extend Express Request */
declare global {
  namespace Express {
    interface Request extends LooseAuthProp {}
  }
}

const clerk = ClerkExpressRequireAuth({});

export const auth = (req: Request, res: Response, next: NextFunction) => {
  clerk(req, res, next);
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
    const stringify = (req.body as Buffer).toString('utf-8');
    req.body = JSON.parse(stringify ?? "{}");
  }
  next();
};

import multer from "multer";
import path from "path";

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
