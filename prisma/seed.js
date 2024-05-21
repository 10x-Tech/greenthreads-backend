// // seed.ts
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function seed() {
//   try {
//     // Insert sample products
//     const product1 = await prisma.product.create({
//       data: {
//         productName: 'T-Shirt',
//         description: 'Comfortable cotton t-shirt',
//         categories: {
//           create: [{ categoryName: 'Clothing' }]
//         },
//         subCategories: {
//           create: [{ subCategoryName: 'T-Shirts' }]
//         },
//         previewImage: 'https://example.com/tshirt.jpg'
//       }
//     });

//     const product2 = await prisma.product.create({
//       data: {
//         productName: 'Jeans',
//         description: 'Classic denim jeans',
//         categories: {
//           create: [{ categoryName: 'Clothing' }]
//         },
//         subCategories: {
//           create: [{ subCategoryName: 'Jeans' }]
//         },
//         previewImage: 'https://example.com/jeans.jpg'
//       }
//     });

//     // Insert product variations (e.g., sizes and colors)
//     const tshirtVariation = await prisma.productVariation.create({
//       data: {
//         variationName: 'Size',
//         options: {
//           create: [
//             { optionName: 'Small' },
//             { optionName: 'Medium' },
//             { optionName: 'Large' }
//           ]
//         },
//         products: {
//           connect: [{ productId: product1.productId }]
//         }
//       }
//     });

//     const tshirtColorVariation = await prisma.productVariation.create({
//       data: {
//         variationName: 'Color',
//         options: {
//           create: [
//             { optionName: 'Red' },
//             { optionName: 'Blue' },
//             { optionName: 'Green' }
//           ]
//         },
//         products: {
//           connect: [{ productId: product1.productId }]
//         }
//       }
//     });

//     // Insert sample product images
//     await prisma.productImage.createMany({
//       data: [
//         {
//           imageUrl: 'https://example.com/tshirt_red.jpg',
//           productId: product1.productId,
//           variationId: tshirtColorVariation.variationId
//         },
//         {
//           imageUrl: 'https://example.com/tshirt_blue.jpg',
//           productId: product1.productId,
//           variationId: tshirtColorVariation.variationId
//         }
//         // Add more images as needed...
//       ]
//     });

//     console.log('Seed data inserted successfully.');
//   } catch (error) {
//     console.error('Error seeding database:', error);
//   } finally {
//     await prisma.$disconnect(); // Disconnect Prisma Client
//   }
// }

// // Run seed function to insert dummy data
// seed();

// Product Variations vs. Product Combinations
// Product Variations (ProductVariation):

// Definition: Product variations represent different attributes or options that a product can have, such as color, size, material, etc.
// Example: For a t-shirt, variations could include color (e.g., red, blue) and size (e.g., small, medium, large).
// Purpose: Product variations define the possible options or configurations for a product but do not directly represent inventory or stock.
// Product Combinations (ProductCombination):

// Definition: Product combinations represent specific configurations or combinations of variations that are available as distinct products with their own SKU and inventory.
// Example: A specific red t-shirt in size small would be represented as a product combination.
// Purpose: Product combinations tie together specific variations (e.g., color = red, size = small) into unique product instances that can be tracked for inventory management and sales.

// Product Variations define the attributes or options that a product can have, providing flexibility in customization.
// Product Combinations represent specific instances of a product based on selected variations, combining attributes into unique products with inventory and SKU.

const data = {
  productName: "T-Shirt",
  productSlug: "t-shirt",
  description: "A comfortable cotton t-shirt",
  categories: ["Men's Clothing", "T-Shirts"],
  subCategories: ["Casual", "Summer Wear"],
  previewImage: "tshirt.jpg",
  variations: [
    {
      variationName: "Color",
      options: [
        { optionName: "Red" },
        { optionName: "Blue" },
        { optionName: "Green" },
      ],
    },
    {
      variationName: "Size",
      options: [
        { optionName: "Small" },
        { optionName: "Medium" },
        { optionName: "Large" },
      ],
    },
  ],
  combinations: [
    {
      skuId: "TS001-RD-SM",
      variationOptions: [
        { variationName: "Color", optionName: "Red" },
        { variationName: "Size", optionName: "Small" },
      ],
      availableStock: 100,
    },
    {
      skuId: "TS001-BL-MD",
      variationOptions: [
        { variationName: "Color", optionName: "Blue" },
        { variationName: "Size", optionName: "Medium" },
      ],
      availableStock: 50,
    },
  ],
};

// import { PrismaClient, Product, ProductVariation, ProductVariationOption, ProductCombination } from '@prisma/client';

// const prisma = new PrismaClient();

// async function createProductWithCombinations(productData: any): Promise<Product> {
//   const { productName, productSlug, description, categories, subCategories, previewImage, variations } = productData;

//   try {
//     // Create the product with basic information
//     const createdProduct: Product = await prisma.product.create({
//       data: {
//         productName,
//         productSlug,
//         description,
//         categories: { connect: categories.map((category: string) => ({ categoryName: category })) },
//         subCategories: { connect: subCategories.map((subCategory: string) => ({ subCategoryName: subCategory })) },
//         previewImage
//       }
//     });

//     // Create variations and combinations for the product
//     const createdVariations: ProductVariation[] = [];
//     const createdCombinations: ProductCombination[] = [];

//     for (const variationData of variations) {
//       const { variationName, options } = variationData;

//       // Create product variation
//       const createdVariation: ProductVariation = await prisma.productVariation.create({
//         data: {
//           variationName,
//           options: {
//             create: options.map((option: string) => ({ optionName: option }))
//           }
//         }
//       });

//       createdVariations.push(createdVariation);

//       // Create product combinations based on variations
//       const combinationOptions: ProductVariationOption[] = createdVariation.options;

//       const combinationPromises = options.map(async (option: string) => {
//         const combinationOptionsData: ProductVariationOption[] = combinationOptions.filter(opt => opt.optionName === option);

//         const productCombination: ProductCombination = await prisma.productCombination.create({
//           data: {
//             productId: createdProduct.productId,
//             skuId: generateSkuId(combinationOptionsData),
//             variationOptions: { connect: combinationOptionsData.map(opt => ({ id: opt.optionId })) },
//             availableStock: 0 // Set initial stock for each combination
//           }
//         });

//         return productCombination;
//       });

//       const createdProductCombinations = await Promise.all(combinationPromises);
//       createdCombinations.push(...createdProductCombinations);
//     }

//     console.log('Created product with variations and combinations:', createdProduct);

//     return createdProduct;
//   } catch (error) {
//     console.error('Error creating product with variations and combinations:', error);
//     throw error;
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// function generateSkuId(combinationOptions: ProductVariationOption[]): string {
//   // Generate a unique SKU ID based on combination options
//   const skuId = combinationOptions.map(opt => opt.optionName.charAt(0).toUpperCase()).join('');
//   return skuId;
// }

// // Example usage:
// const newProductData = {
//   "productName": "T-Shirt",
//   "productSlug": "t-shirt",
//   "description": "A comfortable cotton t-shirt",
//   "categories": ["Men's Clothing", "T-Shirts"],
//   "subCategories": ["Casual", "Summer Wear"],
//   "previewImage": "tshirt.jpg",
//   "variations": [
//     {
//       "variationName": "Color",
//       "options": ["Red", "Blue"]
//     },
//     {
//       "variationName": "Size",
//       "options": ["Small", "Medium"]
//     }
//   ]
// };

// createProductWithCombinations(newProductData);

import { PrismaClient } from "@prisma/client";
import { connect } from "http2";

const prisma = new PrismaClient();

async function main() {
  // Seed data for Size model
  await prisma.size.createMany({
    data: [
      { name: "Small" },
      { name: "Medium" },
      { name: "Large" },
      { name: "28" },
      { name: "32" },
      { name: "30" },
      // Add more sizes as needed
    ],
  });
  // Seed data for Color model
  await prisma.color.createMany({
    data: [
      { name: "Red" },
      { name: "Blue" },
      { name: "Green" },
      { name: "Grey" },
      // Add more colors as needed
    ],
  });
  const parentCat = await prisma.category.create({
    data: {
      name: "Men",
    },
  });
  const child = await prisma.category.create({
    data: {
      name: "Clothing",
      parentId: parentCat.id,
    },
  });
  const user1 = await prisma.user.create({
    data: {
      userId: "1", // Provide a UUID for userId
      username: "john_doe",
      email: "john@example.com",
      profileImg: "https://example.com/profile.jpg",
      phoneNumber: "+1234567890",
    },
  });
  // Seed Customer data
  const customer1 = await prisma.customer.create({
    data: {
      id: "1", // Provide a UUID for customer id
      externalId: "customer1", // Example external ID
      fullName: "John Doe",
      address: {
        create: [
          {
            city: "Ahmedabad",
            country: "India",
            line1: "123 Main Street",
            postalCode: "380028",
            state: "Gujarat",
          },
        ],
      },
      userId: user1.userId,
    },
  });
  const user2 = await prisma.user.create({
    data: {
      userId: "2", // Provide a UUID for userId
      username: "sam_gad",
      email: "samyak@example.com",
      profileImg: "https://example.com/profile.jpg",
      phoneNumber: "5656565656",
    },
  });
  // Seed Customer data
  const customer2 = await prisma.customer.create({
    data: {
      id: "2", // Provide a UUID for customer id
      externalId: "customer2", // Example external ID
      fullName: "Samyak Gandhi",
      address: {
        create: [
          {
            city: "Ahmedabad",
            country: "India",
            line1: "123 Main Street",
            postalCode: "380028",
            state: "Gujarat",
          },
        ],
      },
      userId: user2.userId,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
