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
    id: string; // Mã sản phẩm
    name: string;
    slug: string;
    description: string | null;
    categoryName: string | null;
    categoryId: string | null;
    brandName: string | null;
    brandId: number | string | null;
    originalPrice: number;
    salePrice: number | null;
    /** File mô hình 3D (.glb). Null = chỉ có ảnh */
    model3dUrl?: string | null;
    isActive: boolean;
    isFeatured: boolean;
    totalSold: number;
    avgRating: number;
    reviewCount: number;
    createdAt: string;
    images: ProductImage[];
    variants: ProductVariant[];
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
}

export interface Brand {
    id: number;
    name: string;
    slug: string;
    logoUrl?: string | null;
}

export type ProductSort = 'newest' | 'best_selling' | 'price_asc' | 'price_desc' | 'rating';

export interface ProductQuery {
    categoryName?: string;
    brandName?: string;
    minPrice?: number;
    maxPrice?: number;
    productSize?: string;
    q?: string;
    onSale?: boolean;
    sortBy?: ProductSort;
    page?: number;
    size?: number;
}

export interface Page<T> {
    content: T[];
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}
