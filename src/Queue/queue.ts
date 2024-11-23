import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import prisma from "@/lib/prisma";
import { createSkus, validateRow } from "@/utils/bulkUpload";
import { generateProductCode, generateSlug } from "@/utils/helper";

let connection: IORedis | null = null;
let bulkUploadQueue: Queue | null = null;
let worker: Worker | null = null;

export const isQueueInitialized = () => {
  return connection !== null && bulkUploadQueue !== null && worker !== null;
};

export const initializeQueue = async () => {
  try {
    // Only initialize if not already initialized
    if (!connection) {
      connection = new IORedis({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: Number(process.env.REDIS_PORT) || 6379,
        maxRetriesPerRequest: null,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          console.log(`Retrying Redis connection in ${delay}ms...`);
          return delay;
        },
        reconnectOnError: (err) => {
          console.error("Redis connection error:", err);
          return true;
        },
      });

      connection.on("connect", () => {
        console.log("Successfully connected to Redis");
      });

      connection.on("error", (error) => {
        console.error("Redis connection error:", error);
      });

      // Test the connection
      await connection.ping();

      bulkUploadQueue = new Queue("bulk-upload", { connection });
      
      bulkUploadQueue.on("error", (error) => {
        console.error(`Queue error: ${error}`);
      });

      bulkUploadQueue.on("waiting", (job) => {
        console.log(`Job ${job.id} added`);
      });

      worker = new Worker(
        "bulk-upload",
        async (job: any) => {
          console.log(`Processing job ${job.id}`);
          const { rows, userId } = job.data;

          await prisma.$transaction(async (tx) => {
            for (const row of rows) {
              validateRow(row);

              const {
                ProductName,
                ProductDescription,
                ProductPrice,
                DiscountPercentage,
                isNextDayDelivery,
                DeliveryRange,
                Category,
                SubCategory,
                SubSubCategory,
                Variations,
              }: any = row;

              let variations;
              try {
                variations = JSON.parse(Variations);
              } catch (error: any) {
                throw new Error(
                  `Invalid JSON format in Variations field: ${error.message}`
                );
              }

              // Find or create the brand
              const brandInfo = await tx.brand.findUnique({
                where: { sellerId: userId },
              });

              if (!brandInfo) {
                throw new Error("Brand Not Found! Create One If not exist");
              }

              // Find categories
              const category = await tx.category.findFirst({
                where: { name: Category },
              });
              const subCategory = category
                ? await tx.category.findFirst({
                    where: { name: SubCategory, parentId: category.id },
                  })
                : null;
              const subSubCategory = subCategory
                ? await tx.category.findFirst({
                    where: { name: SubSubCategory, parentId: subCategory.id },
                  })
                : null;

              // Build category connections
              const categoriesToConnect = [category, subCategory, subSubCategory]
                .filter((cat) => cat?.id)
                .map((cat) => ({ id: cat?.id }));

              const productSlug = generateSlug(ProductName);
              const productCode = generateProductCode(
                ProductName,
                category?.name as string
              );

              const newProduct = await tx.product.create({
                data: {
                  sellerId: userId,
                  productName: ProductName,
                  productSlug,
                  productCode,
                  description: ProductDescription,
                  originalPrice: ProductPrice,
                  discountPercentage: DiscountPercentage,
                  discountedPrice:
                    ProductPrice - ProductPrice * (DiscountPercentage / 100),
                  categories: {
                    connect: categoriesToConnect,
                  },
                  brandId: brandInfo.id,
                  deliveryRange: DeliveryRange,
                  previewImage: "", // Assume no image for bulk upload for now
                  isNextDayDelivery: isNextDayDelivery === "true",
                  width: 0,
                  length: 0,
                  height: 0,
                  weight: 0,
                  productInventory: {
                    create: {
                      totalStock: 0,
                      unitPrice: ProductPrice,
                      totalPrice: ProductPrice,
                      isActive: true,
                    },
                  },
                },
                include: {
                  productInventory: true,
                },
              });

              await createSkus(tx, newProduct, brandInfo.name, variations);
            }
          });
        },
        { connection }
      );

      worker.on("completed", (job) => {
        console.log(`Job ${job.id} has completed`);
      });

      worker.on("failed", (job, err) => {
        console.error(`Job ${job?.id} has failed with error ${err.message}`);
      });

      worker.on("active", (job) => {
        console.log(`Job ${job.id} is now active`);
      });

      worker.on("progress", (job, progress) => {
        console.log(`Job ${job.id} is ${progress}% complete`);
      });

      worker.on("stalled", (job: any) => {
        console.log(`Job ${job?.id} has stalled`);
      });

      // Add initialization check after setting up everything
      if (!isQueueInitialized()) {
        throw new Error('Queue initialization failed');
      }

      console.log('Queue system fully initialized');
    }

    return bulkUploadQueue;
  } catch (error) {
    console.error("Failed to initialize Redis and Queue:", error);
    // Reset all connections on failure
    await closeConnections();
    throw error;
  }
};

export const closeConnections = async () => {
  try {
    if (worker) {
      await worker.close();
    }
    if (bulkUploadQueue) {
      await bulkUploadQueue.close();
    }
    if (connection) {
      await connection.quit();
    }
  } catch (error) {
    console.error("Error closing connections:", error);
  }
};

export const getQueue = () => {
  if (!isQueueInitialized()) {
    throw new Error('Queue not initialized. Call initializeQueue() first.');
  }
  return bulkUploadQueue;
};

export default {
  initializeQueue,
  closeConnections,
  getQueue,
  isQueueInitialized,
};


