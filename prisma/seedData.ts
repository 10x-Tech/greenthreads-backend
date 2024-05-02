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

function generateCombinations(variations: any[]): any[] {
  const combinations: any[] = [];

  // Recursive function to generate combinations using backtracking
  function backtrack(index: number, currentOptions: any[]): void {
    if (index === variations.length) {
      // All variation options have been chosen, create a combination
      const skuId = `TS001-${currentOptions
        .map((option) => option.optionName.substring(0, 2).toUpperCase())
        .join("-")}`;
      const availableStock = Math.min(
        ...currentOptions.map((option) => {
          const variation = variations.find(
            (v) => v.name === option.variationName
          );
          const selectedOption = variation?.options.find(
            (opt: any) => opt.name === option.optionName
          );
          return selectedOption?.stock || 0;
        })
      );

      combinations.push({
        skuId,
        variationOptions: currentOptions,
        availableStock,
      });
      return;
    }

    // Choose an option from the current variation
    for (const option of variations[index].options) {
      backtrack(index + 1, [
        ...currentOptions,
        { variationName: variations[index].name, optionName: option.name },
      ]);
    }
  }

  // Start backtracking to generate all combinations
  backtrack(0, []);

  return combinations;
}

// Example usage:
const variations = [
  {
    name: "Color",
    options: [
      { name: "Red", stock: 100, price: 29.99 },
      { name: "Blue", stock: 50, price: 29.99 },
      { name: "Green", stock: 75, price: 29.99 },
    ],
  },
  {
    name: "Size",
    options: [
      { name: "Small", stock: 100, price: 29.99 },
      { name: "Medium", stock: 50, price: 29.99 },
      { name: "Large", stock: 75, price: 29.99 },
    ],
  },
  // Add more variations as needed
  {
    name: "Material",
    options: [
      { name: "Cotton", stock: 150, price: 39.99 },
      { name: "Polyester", stock: 80, price: 34.99 },
      { name: "Silk", stock: 60, price: 49.99 },
    ],
  },
];

const combinations = generateCombinations(variations);
console.log(combinations);
