import { v4 as uuidv4 } from "uuid";

export function generateSlug(name: string) {
  // Convert to lowercase and replace spaces with hyphens
  let slug = name.toLowerCase().replace(/\s+/g, "-");

  // Remove special characters
  slug = slug.replace(/[^a-z0-9\-]/g, "");

  // Remove consecutive hyphens
  slug = slug.replace(/-{2,}/g, "-");

  // Remove leading and trailing hyphens
  slug = slug.replace(/^-+|-+$/g, "");

  return slug;
}

export function generateSkuId({
  brandName = "",
  size,
  color,
}: {
  brandName: string;
  size: string;
  color: string;
}) {
  // Ensure the brand name is at least 3 letters long by padding with underscores if necessary
  const brandCode = brandName.padEnd(3, "_").slice(0, 3).toUpperCase();

  // Generate a 4-digit number using a portion of a UUID
  const uuid = uuidv4();
  const numberCode = uuid.slice(0, 4).toUpperCase(); // Taking the first 4 characters of the UUID

  // Create the skuId
  const skuId = `${brandCode}_${size}_${color}_${numberCode}`;

  return skuId;
}

export function generateProductCode(
  productName: string,
  category: string,
  subCategory?: string,
  subSubCategory?: string
) {
  // Convert strings to uppercase and remove spaces
  const formattedName = productName.toUpperCase().replace(/\s/g, "");
  const formattedCategory = category.toUpperCase().replace(/\s/g, "");
  // const formattedSubCategory = subCategory
  //   ? subCategory.toUpperCase().replace(/\s/g, "")
  //   : "";
  // const formattedSubSubCategory = subSubCategory
  //   ? subSubCategory.toUpperCase().replace(/\s/g, "")
  //   : "";

  // Concatenate formatted category, subcategory, and sub-subcategory
  let productCode = `${formattedCategory.substring(0, 3)}`;
  // if (formattedSubCategory) {
  //   productCode += `-${formattedSubCategory.substring(0, 3)}`;
  // }
  // if (formattedSubSubCategory) {
  //   productCode += `-${formattedSubSubCategory.substring(0, 3)}`;
  // }
  productCode += `-${formattedName.substring(0, 3)}-${uuidv4({}).substring(
    0,
    3
  )}`;

  return productCode;
}

export function generateOrderId() {
  const prefix = "Order_";
  const uuid = uuidv4().replace(/-/g, ""); // Remove hyphens from UUID
  const randomString = uuid.slice(0, 7); // Take the first 7 characters
  return prefix + randomString;
}

// Example usage
const orderId = generateOrderId();

export const formatPeriodicRevenue = (
  orderItems: any[],
  duration: string,
  currentYear: number
) => {
  let periods: Date[] = [];

  if (duration === "yearly") {
    // Initialize periods for the last 5 years
    periods = Array.from(
      { length: 5 },
      (_, i) => new Date(currentYear - i, 0, 1)
    );
  } else if (duration === "monthly") {
    // Initialize periods for all 12 months of the current year
    periods = Array.from({ length: 12 }, (_, i) => new Date(currentYear, i, 1));
  }

  const revenue = periods.reduce((acc: any, period) => {
    const key = formatDateKey(period, duration);
    acc[key] = 0; // Initialize revenue for each period to 0
    return acc;
  }, {});

  // Accumulate actual revenue from order items
  for (const orderItem of orderItems) {
    const orderDate = new Date(orderItem.createdAt);
    const key = formatDateKey(orderDate, duration);

    // Add order item total amount to revenue for the corresponding period
    if (revenue[key] !== undefined) {
      revenue[key] += orderItem.amountTotal;
    }
  }

  // Format the revenue data into the desired response format
  return Object.keys(revenue).map((key) => ({
    name: key,
    total: revenue[key],
  }));
};

// Helper function to format date keys
const formatDateKey = (date: Date, duration: string): string => {
  const year = date.getFullYear();
  const month = date.toLocaleString("default", { month: "short" }); // Get month name in short format (e.g., Jan, Feb)

  switch (duration) {
    case "yearly":
      return year.toString();
    case "monthly":
      return `${month}`;
    default:
      return "";
  }
};
