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

async function deleteCategoryWithChildren(prisma: any, node: any) {
  const children = await prisma.comment.findMany({
    where: {
      parent: {
        id: node.id,
      },
    },
  });

  for (const child of children) {
    await deleteCategoryWithChildren(prisma, child);
  }

  await prisma.comment.delete({
    where: {
      id: node.id,
    },
  });
}

export function generateSKU(productCode: string, variations: any[]) {
  // Initialize the SKU with the product code
  let sku = productCode;

  // Sort variations to ensure consistency in SKU generation
  variations.sort((a, b) => a.variantName.localeCompare(b.variantName));

  // Loop through each variation and concatenate its options to the SKU
  variations.forEach((variation) => {
    // Sort options to ensure consistency in SKU generation
    variation.variationOptions.sort((a: any, b: any) =>
      a.name.localeCompare(b.name)
    );
    // Extract the first character of each option name (or any other method)
    const variationCode = variation.variationOptions
      .map((option: any) => option.name[0].toUpperCase())
      .join("");
    sku += variationCode;
  });

  return sku;
}

export function generateProductCode(
  productName: string,
  category: string,
  subCategory: string,
  subSubCategory: string
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
