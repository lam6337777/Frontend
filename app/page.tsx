'use client';

import React, { useEffect, useState } from "react";
import Hero from "@/components/home/Hero/Hero";
import Promotions from "@/components/home/Promotions/Promotions";
import ProductCard from "@/components/ui/ProductCard/ProductCard";
import { productService } from "@/services/productService";
import { ProductResponse } from "@/types/product";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<ProductResponse[]>([]);
  const [newArrivals, setNewArrivals] = useState<ProductResponse[]>([]);
  const [bestSellers, setBestSellers] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [featuredRes, newArrivalsRes, bestSellersRes] = await Promise.all([
          productService.getFeaturedProducts(3),
          productService.getNewArrivals(3),
          productService.getBestSellers(4)
        ]);
        
        if (featuredRes.success) setFeaturedProducts(featuredRes.data);
        if (newArrivalsRes.success) setNewArrivals(newArrivalsRes.data.content);
        if (bestSellersRes.success) setBestSellers(bestSellersRes.data.content);
      } catch (error) {
        console.error("Failed to fetch home page data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />

      <section className="py-20 px-[5%] bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-xs font-bold tracking-[0.2em] text-zinc-400 block mb-2 uppercase">Sản phẩm mới nhất</span>
              <h2 className="text-3xl font-bold tracking-tight">Hàng mới về</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="aspect-square bg-zinc-100 animate-pulse" />
              ))
            ) : (
              newArrivals.map(product => {
                const primaryImage = product.images.find(img => img.isPrimary)?.imageUrl || product.images[0]?.imageUrl;
                return (
                  <ProductCard 
                    key={product.id} 
                    id={product.id}
                    name={product.name}
                    brand={product.brandName}
                    price={product.originalPrice}
                    salePrice={product.salePrice}
                    image={primaryImage}
                    label="NEW"
                  />
                );
              })
            )}
          </div>
        </div>
      </section>

      <Promotions />

      <section className="py-20 px-[5%] bg-zinc-50">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-[0.2em] text-zinc-400 block mb-2 uppercase">Phong cách kinh điển</span>
            <h2 className="text-3xl font-bold tracking-tight">Sản phẩm bán chạy</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Tạm thời dùng lại featured products cho best sellers */}
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-zinc-100 animate-pulse" />
              ))
            ) : (
              bestSellers.map(product => {
                const primaryImage = product.images.find(img => img.isPrimary)?.imageUrl || product.images[0]?.imageUrl;
                return (
                  <ProductCard 
                    key={product.id} 
                    id={product.id}
                    name={product.name}
                    brand={product.brandName}
                    price={product.originalPrice}
                    salePrice={product.salePrice}
                    image={primaryImage}
                  />
                );
              })
            )}
          </div>
        </div>
      </section>

    </div>
  );
}

