import "dotenv/config";

import express, { Application, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import productRoutes from "@/routes/v1/productRoute";
import clerkWebhookRoutes from "@/routes/v1/clerkWebhooks";
import stripeWebhookRoutes from "@/routes/v1/stripeWebhook";

import categoryRoutes from "@/routes/v1/categoryRoutes";
import cartRoutes from "@/routes/v1/cartRoutes";
import orderRoutes from "@/routes/v1/orderRoutes";
import s3Uploads from "@/routes/v1/s3Uploads";

import AppError from "@/utils/AppError";
import globalErrorHandler from "@/controllers/error";
import cors from "cors";
import { bufferToJSON } from "@/middleware";

const PORT = process.env.PORT || 8080;

const app: Application = express();

app.use(cors());

app.options("*", cors());

// app.use(bodyParser.json());
/* register middlewares */
// Body parser, reading data from body into req.body

app.use((req, res, next) => {
  if (req.originalUrl.includes("webhook")) {
    next();
  } else {
    express.json({ limit: "10kb" })(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// app.use(cookieParser());

// Routes
app.use("/webhook/sellers", clerkWebhookRoutes);

// Routes
app.use("/webhook/checkout", stripeWebhookRoutes);
// Routes
app.use("/api/v1/products", productRoutes);

// Routes
app.use("/api/v1/orders", orderRoutes);

// app.use("/api/v1/brands");
// Routes
app.use("/api/v1", categoryRoutes);

// Routes
app.use("/api/v1/cart", cartRoutes);

// Routes
app.use("/api/v1", s3Uploads);

const server = app.listen(PORT, () => {
  console.log(`Listening: http://localhost:${PORT}`);
});

process.on("unhandledRejection", (err: Error) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});

app.all("*", (req, res, next) => {
  next(new AppError(404, `Can't find ${req.originalUrl} on this server!`));
});

app.use(globalErrorHandler);

export default app;
