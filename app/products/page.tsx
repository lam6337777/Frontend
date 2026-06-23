'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import FilterSidebar from "@/components/products/FilterSidebar/FilterSidebar";
import ProductCard from "@/components/ui/ProductCard/ProductCard";
import { productService } from '@/services/productService';
import { ProductResponse, ProductFiltersResponse } from '@/types/product';

function ProductsContent() {
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get('search');
    const categoryParam = searchParams.get('category');
    
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [filters, setFilters] = useState<ProductFiltersResponse>({ brands: [], categories: [], maxPrice: 50000 });
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);

    // Sync state with URL params
    useEffect(() => {
        if (categoryParam) {
            setSelectedCategory(categoryParam);
            setPage(0);
        }
    }, [categoryParam]);

    // Fetch filters on mount
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const res = await productService.getProductFilters();
                if (res.success) {
                    setFilters(res.data);
                    // Cập nhật giá max mặc định cho thanh trượt nếu chưa chọn và giá trị hợp lệ
                    const maxVal = res.data.maxPrice || 50000;
                    setPriceRange([0, maxVal]);
                }
            } catch (error) {
                console.error("Failed to fetch filters", error);
            }
        };
        fetchFilters();
    }, []);

    // Fetch products when filters change
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const res = await productService.getProducts({
                    categoryName: selectedCategory || undefined,
                    productSize: selectedSize || undefined,
                    maxPrice: priceRange[1],
                    q: searchTerm || undefined,
                    page,
                    size: 12
                });
                if (res.success) {
                    setProducts(res.data.content);
                    setTotalPages(res.data.totalPages);
                }
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, [selectedCategory, selectedSize, priceRange, page, searchTerm]);

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(prev => prev === category ? null : category);
        setPage(0);
    };

    const handleSizeChange = (size: string) => {
        setSelectedSize(prev => prev === size ? null : size);
        setPage(0);
    };

    const handlePriceChange = (val: number) => {
        setPriceRange([0, val]);
        setPage(0);
    };

    const handleReset = () => {
        setSelectedCategory(null);
        setSelectedSize(null);
        setPriceRange([0, filters.maxPrice]);
        setPage(0);
    };

    return (
        <div className="flex bg-white min-h-screen">
            <FilterSidebar
                availableCategories={filters.categories}
                maxPrice={filters.maxPrice}
                selectedCategory={selectedCategory}
                selectedSize={selectedSize}
                priceRange={priceRange}
                onCategoryChange={handleCategoryChange}
                onSizeChange={handleSizeChange}
                onPriceChange={handlePriceChange}
                onReset={handleReset}
            />

            <main className="flex-1 p-12">
                <div className="flex justify-between items-center mb-12">
                    <div className="transition-all duration-500 ease-in-out">
                        <nav className="text-sm font-medium text-zinc-500 mb-3 flex items-center transition-all">
                            <Link href="/" className="hover:text-black transition-colors">Trang chủ</Link> 
                            <span className="mx-2">/</span> 
                            <span className="text-black capitalize">{selectedCategory?.toLowerCase() || 'Tất cả sản phẩm'}</span>
                        </nav>
                        <h1 
                            key={selectedCategory || 'all'}
                            className="text-2xl font-bold tracking-tight text-black capitalize"
                        >
                            {selectedCategory?.toLowerCase() || 'Tất cả sản phẩm'}
                        </h1>
                        <p className="text-zinc-500 mt-4 max-w-lg">
                            Định nghĩa sự sang trọng tối giản thông qua kiến trúc đơn sắc và vật liệu hiệu suất cao.
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12 opacity-50">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="aspect-square bg-zinc-100 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                        {products.map(product => {
                            const primaryImage = product.images.find(img => img.isPrimary)?.imageUrl || product.images[0]?.imageUrl;
                            return (
                                <ProductCard 
                                    key={product.id} 
                                    id={product.id}
                                    name={product.name}
                                    price={product.originalPrice}
                                    salePrice={product.salePrice}
                                    brand={product.brandName}
                                    image={primaryImage}
                                    label={product.isFeatured ? 'FEATURED' : undefined}
                                    variants={product.variants}
                                />
                            );
                        })}
                    </div>
                )}

                {!isLoading && products.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="text-zinc-400 font-bold uppercase tracking-widest">Không tìm thấy sản phẩm nào phù hợp với bộ lọc đã chọn.</p>
                        <button onClick={handleReset} className="mt-4 text-xs font-bold border-b border-black uppercase tracking-widest">Xóa tất cả bộ lọc</button>
                    </div>
                )}

                {!isLoading && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-16">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="px-4 py-2 text-sm font-medium border border-zinc-300 rounded hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            Trước
                        </button>
                        {(() => {
                            const pages: (number | string)[] = [];
                            const delta = 1;
                            const left = Math.max(1, page - delta);
                            const right = Math.min(totalPages, page + delta + 1);

                            if (left > 2) {
                                pages.push(1, '...');
                            } else if (left === 2) {
                                pages.push(1);
                            }

                            for (let i = left; i < right; i++) {
                                pages.push(i);
                            }

                            if (right < totalPages - 1) {
                                pages.push('...', totalPages);
                            } else if (right === totalPages - 1) {
                                pages.push(totalPages);
                            }

                            return pages.map((p, idx) =>
                                p === '...' ? (
                                    <span key={`ellipsis-${idx}`} className="px-2 text-zinc-400 select-none">...</span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => setPage((p as number) - 1)}
                                        className={`w-10 h-10 text-sm font-medium rounded transition-colors ${
                                            page === (p as number) - 1
                                                ? 'bg-black text-white'
                                                : 'border border-zinc-300 hover:bg-zinc-100'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                )
                            );
                        })()}
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page === totalPages - 1}
                            className="px-4 py-2 text-sm font-medium border border-zinc-300 rounded hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            Sau
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <ProductsContent />
        </React.Suspense>
    );
}
