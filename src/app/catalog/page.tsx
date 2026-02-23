'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import CatalogProductCard from "@/components/catalog/CatalogProductCard";
import Pagination from "@/components/ui/Pagination";
import { ProductMinimal } from "@/lib/product-utils";
import { useLanguage } from '@/context/LanguageContext';
import { getLocalizedField } from '@/lib/translateDb';

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    material: string | null;
    category: string;
    images: string;
    badge?: string | null;
    description?: string;
    specifications?: string | null;
    series?: string | null;
}

const ITEMS_PER_PAGE = 12;

import { useRouter, useSearchParams } from 'next/navigation';

// ...
import { Suspense } from 'react';

function CatalogContent() {
    const { language, t } = useLanguage();
    const searchParams = useSearchParams(); // Hook to read query params
    const searchQuery = searchParams?.get('search'); // Get 'search' param

    const [categories, setCategories] = useState<Category[]>([
        { id: "all", name: 'all', slug: "all" } // Use slug as name placeholder for now, will translate in render
    ]);
    const [activeCategory, setActiveCategory] = useState("all");
    const [sortBy, setSortBy] = useState("new");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [variantsMap, setVariantsMap] = useState<Record<string, ProductMinimal[]>>({});

    const categoryQuery = searchParams?.get('category');

    // Sync active category from URL or global search
    useEffect(() => {
        if (searchQuery) {
            setActiveCategory('all');
        } else {
            setActiveCategory(categoryQuery || 'all');
        }
    }, [searchQuery, categoryQuery]);

    // Fetch categories
    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCategories([
                        { id: "all", name: 'all', slug: "all" },
                        ...data
                    ]);
                }
            })
            .catch(err => console.error("Failed to fetch categories", err));
    }, []);

    // Fetch products
    useEffect(() => {
        setLoading(true);

        const params = new URLSearchParams();
        params.set('category', activeCategory);
        if (searchQuery) params.set('search', searchQuery);

        fetch(`/api/products?${params.toString()}`)
            .then(r => r.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
                setCurrentPage(1); // Reset to first page on category change
            })
            .catch(() => setLoading(false));
    }, [activeCategory, searchQuery]);

    // Fetch variants for visible products
    useEffect(() => {
        const visibleProducts = products.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        );

        const seriesIds = Array.from(new Set(visibleProducts.map(p => p.series).filter(Boolean))) as string[];

        if (seriesIds.length > 0) {
            fetch(`/api/products?series=${seriesIds.join(',')}`)
                .then(r => r.json())
                .then((variants: ProductMinimal[]) => {
                    const newMap: Record<string, ProductMinimal[]> = {};
                    if (Array.isArray(variants)) {
                        variants.forEach(v => {
                            if (v.series) {
                                if (!newMap[v.series]) newMap[v.series] = [];
                                newMap[v.series].push(v);
                            }
                        });
                        setVariantsMap(prev => ({ ...prev, ...newMap }));
                    }
                })
                .catch(err => console.error("Error fetching variants", err));
        }
    }, [products, currentPage]);

    const sortedProducts = [...products].sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0; // 'new' is default from API (createdAt desc)
    });

    // Pagination Logic
    const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
    const currentProducts = sortedProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const visibleCategories = showAllCategories ? categories : categories.slice(0, 6);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 md:py-16">
            {/* Title */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{t('catalog.title')}</h1>
                <p className="text-sm text-gray-500 max-w-lg leading-relaxed">
                    {t('catalog.subtitle')}
                </p>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
                {visibleCategories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => { setActiveCategory(cat.slug); }}
                        className={`text-sm px-5 py-2 rounded-full border transition-colors ${activeCategory === cat.slug
                            ? "bg-black text-white border-black"
                            : "bg-white text-gray-700 border-gray-300 hover:border-black"
                            }`}
                    >
                        {cat.id === 'all' ? t('catalog.filters.all') : getLocalizedField(cat, 'name', language)}
                    </button>
                ))}

                {/* Show More / Hide Button */}
                <button
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="text-sm px-4 py-2 font-medium underline underline-offset-4 text-gray-500 hover:text-black transition-colors"
                >
                    {showAllCategories ? t('catalog.filters.hide') : t('catalog.filters.show_all')}
                </button>

                {/* Sort dropdown */}
                <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
                    <span>{t('catalog.sort.label')}</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent font-medium text-black outline-none cursor-pointer"
                    >
                        <option value="new">{t('catalog.sort.new')}</option>
                        <option value="price-asc">{t('catalog.sort.price_asc')}</option>
                        <option value="price-desc">{t('catalog.sort.price_desc')}</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
                </div>
            ) : (
                <>
                    {/* Product Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {currentProducts.map((product) => (
                            <CatalogProductCard
                                key={product.id}
                                product={product}
                                variants={product.series ? variantsMap[product.series] : undefined}
                            />
                        ))}
                    </div>

                    {/* Empty state */}
                    {sortedProducts.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-gray-500">{t('catalog.empty')}</p>
                            <button
                                onClick={() => setActiveCategory("all")}
                                className="mt-3 text-sm text-black underline underline-offset-4"
                            >
                                {t('catalog.filters.show_all')}
                            </button>
                        </div>
                    )}

                    {/* Pagination */}
                    {sortedProducts.length > 0 && (
                        <div className="mt-12">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default function Catalog() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" /></div>}>
            <CatalogContent />
        </Suspense>
    );
}
