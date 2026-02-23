'use client';

import { useRef } from 'react';
import CatalogProductCard from '@/components/catalog/CatalogProductCard';

interface Product {
    id: string;
    name: string;
    price: number;
    images: string;
    category: string;
    badge?: string | null;
    material?: string | null;
    description?: string;
    specifications?: string | null;
    series?: string | null;
    variants?: any[]; // Allow variants
}

export default function ProductCarousel({ products }: { products: Product[] }) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = container.clientWidth / (window.innerWidth >= 1024 ? 4 : 2); // Scroll by item width approx
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (!products.length) return null;

    return (
        <div className="relative group/carousel">
            {/* Scroll Buttons */}
            <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 bg-white border border-gray-100 rounded-full shadow-lg flex items-center justify-center text-black opacity-0 group-hover/carousel:opacity-100 transition-opacity disabled:opacity-0 hover:scale-105 duration-200"
                aria-label="Previous"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
            </button>
            <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 bg-white border border-gray-100 rounded-full shadow-lg flex items-center justify-center text-black opacity-0 group-hover/carousel:opacity-100 transition-opacity disabled:opacity-0 hover:scale-105 duration-200"
                aria-label="Next"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
            </button>

            {/* Scrollable Container */}
            <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide pb-10 -mx-4 px-4 snap-x snap-mandatory pt-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {products.map((product) => {
                    // Find variants (siblings) for this product from the same list
                    // Siblings share the same 'series' identifier
                    // 1. Prefer variants explicitly passed with the product (used in Bestsellers/Home)
                    // 2. Fallback to finding siblings in the current list (used in Related Products/Catalog)
                    const variants = (product.variants && product.variants.length > 0)
                        ? product.variants
                        : (product.series
                            ? products.filter(p => p.series === product.series && p.id !== product.id)
                            : []);

                    return (
                        <div
                            key={product.id}
                            className="min-w-[280px] md:min-w-[320px] lg:min-w-[300px] snap-start h-auto"
                        >
                            <CatalogProductCard
                                product={product}
                                variants={variants}
                                hideWishlist={true}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
