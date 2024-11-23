import "dotenv/config";
import express, { Application } from "express";
import productRoutes from "@/routes/v1/productRoute";
import clerkWebhookRoutes from "@/routes/v1/clerkWebhooks";
import stripeWebhookRoutes from "@/routes/v1/stripeWebhook";
import categoryRoutes from "@/routes/v1/categoryRoutes";
import cartRoutes from "@/routes/v1/cartRoutes";
import orderRoutes from "@/routes/v1/orderRoutes";
import paymentsRoutes from "@/routes/v1/payments";
import analyticsRoute from "@/routes/v1/analytics";
import adminRoutes from "@/routes/v1/adminRoutes";
import brandRoutes from "@/routes/v1/brandRoutes";
import s3Uploads from "@/routes/v1/s3Uploads";
import AppError from "@/utils/AppError";
import globalErrorHandler from "@/controllers/error";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import queueService from "./Queue/queue";

const PORT = process.env.PORT || 8080;

const app: Application = express();

app.enable("trust proxy");

app.use(cors());

app.options("*", cors());

// Set security HTTP headers
app.use(helmet());

// Limit requests from same IP
const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

// app.use("/api", limiter);

app.use((req, res, next) => {
  if (req.originalUrl.includes("webhook")) {
    next();
  } else {
    express.json({ limit: "10kb" })(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Public Routes
app.use("/webhook/sellers", clerkWebhookRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/webhook/checkout", stripeWebhookRoutes);
app.use("/api/v1/categories", categoryRoutes);

// Authenticated Routes
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payments", paymentsRoutes);
app.use("/api/v1/analytics", analyticsRoute);
app.use("/api/v1/brand", brandRoutes);
app.use("/api/v1", s3Uploads);

// app.get("/api/v1/email", async (req: Request, res: Response) => {
//   try {
//     const email = new Email({
//       email: "makwananikhil36@gmail.com",
//       name: "Nikhil Kapadia",
//     });
//     // email.send();

//     res.status(200).json({
//       success: true,
//       data: email,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error,
//     });
//   }
// });

const startServer = async () => {
  try {
    // Initialize Redis and Queue
    await queueService.initializeQueue();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Process handlers
    process.on("unhandledRejection", async (err: Error) => {
      console.log("UNHANDLED REJECTION! 💥 Shutting down...");
      console.log(err.name, err.message);
      await queueService.closeConnections();

      server.close(() => {
        process.exit(1);
      });
    });

    process.on("SIGTERM", async () => {
      console.log("SIGTERM received. Closing connections...");
      await queueService.closeConnections();
      server.close(() => {
        console.log("💥 Process terminated!");
        process.exit(0);
      });
    });

    process.on("SIGINT", async () => {
      console.log("👋 SIGINT RECEIVED. Shutting down gracefully");
      await queueService.closeConnections();
      server.close(() => {
        console.log("💥 Process terminated!");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await queueService.closeConnections();
    process.exit(1);
  }
};

// Handle uncaught exceptions - This should be at the very top of your file
process.on("uncaughtException", async (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  await queueService.closeConnections();
  process.exit(1);
});

// Routes
app.all("*", (req, res, next) => {
  next(new AppError(404, `Can't find ${req.originalUrl} on this server!`));
});

app.use(globalErrorHandler);

// Start the server - call only once
startServer().catch(async (error) => {
  console.error("Failed to start application:", error);
  await queueService.closeConnections();
  process.exit(1);
});

export default app;

