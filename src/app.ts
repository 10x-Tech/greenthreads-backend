import "dotenv/config";

import express, { Application, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import productRoutes from "@/routes/v1/productRoute";
import webhookRoutes from "@/routes/v1/webhooks";
import categoryRoutes from "@/routes/v1/categoryRoutes";
import s3Uploads from "@/routes/v1/s3Uploads";

import AppError from "@/utils/AppError";
import globalErrorHandler from "@/controllers/error";
import cors from "cors";

const PORT = process.env.PORT || 8080;

const app: Application = express();

app.use(cors());

app.options("*", cors());

// app.use(bodyParser.json());
/* register middlewares */
// app.use(bodyParser.raw({ type: "application/json" }));
// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
// app.use(cookieParser());

app.get("/", (req, res) => {
  res.send(`HELLO FROM et`);
});

// Routes
app.use("/api/v1/users", webhookRoutes);
// Routes
app.use("/api/v1/products", productRoutes);

// Routes
app.use("/api/v1", categoryRoutes);

// Routes
app.use("/api/v1", s3Uploads);

// Routes
// app.use("/api/v1", categoryRoutes);

// /* aws routes */
// app.use("/api/aws", handleFileUpload, awsRouter);

// Error handling middleware
// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//   console.error(err.stack);
//   res.status(500).send("Something broke!");
// });

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
