export interface ProductFiltersResponse {
    categories: string[];
    brands: string[];
    maxPrice: number;
}

export interface ProductVariant {
    id: number;
    color: string;
    size: string;
    stockQuantity: number;
    sku: string;
}

export interface ProductImage {
    id: number;
    imageUrl: string;
    sortOrder: number;
    isPrimary: boolean;
}

export interface ProductResponse {
    id: string; // SKU code
    name: string;
    slug: string;
    description: string;
    categoryName: string;
    categoryId: string;
    brandName: string;
    brandId: number | string;
    originalPrice: number;
    salePrice: number;
    isActive: boolean;
    isFeatured: boolean;
    totalSold: number;
    avgRating: number;
    reviewCount: number;
    createdAt: string;
    images: ProductImage[];
    variants: ProductVariant[];
    // Hỗ trợ fallback cho các component cũ nếu cần
    basePrice?: number; 
    featuredImage?: string | null;
}

export interface Page<T> {
    content: T[];
    pageable: any;
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: any;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}
