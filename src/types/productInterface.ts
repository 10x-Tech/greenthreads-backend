enum ProductStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// DTOs (Data Transfer Objects) for Product and related models

interface Category {
  catId: string;
  categoryName: string;
  categoryIcon?: string;
}

interface SubCategory {
  subCatId: string;
  subCategoryName: string;
  Category: Category[];
}

interface ProductVariation {
  variationName: string;
  options: ProductVariationOption[];
  products: Product[];
}

interface ProductVariationOption {
  optionId: string;
  optionName: string;
  variationId: string | null;
  variation?: ProductVariation;
  productImage?: ProductImage[];
}

interface ProductImage {
  imageUrl: string;
  productId: string;
  productVariationOptionId: string | null;
  productVariationOption?: ProductVariationOption;
}

interface ProductCombination {
  id: string;
  skuId: string;
  availableStock: number;
  productId: string;
  product: Product;
  productStock: ProductStock[];
  createdAt: Date;
  updatedAt: Date;
}

interface ProductStock {
  id: string;
  totalStock: number;
  unitPrice: number;
  totalPrice: number;
  productCombinationId: string;
  productCombination: ProductCombination;
}

interface Product {
  productId: string;
  productName: string;
  productSlug: string;
  description?: string | null;
  categories: Category[];
  subCategories: SubCategory[];
  previewImage?: string | null;
  productVariationVariationId: string | null;
  ProductVariation?: ProductVariation | null;
  ProductImage: ProductImage[];
  ProductCombination: ProductCombination[];
  createdAt: Date;
  updatedAt: Date;
}

export {
  Category,
  SubCategory,
  ProductVariationOption,
  ProductVariation,
  ProductImage,
  ProductCombination,
  ProductStock,
  Product,
  ProductStatus,
};
