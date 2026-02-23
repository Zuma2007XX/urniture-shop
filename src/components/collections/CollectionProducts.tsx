'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import CatalogProductCard from "@/components/catalog/CatalogProductCard";
import Pagination from "@/components/ui/Pagination";
import { ProductMinimal } from "@/lib/product-utils";

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
    createdAt: Date;
}

interface CollectionProductsProps {
    products: Product[];
    categories: Category[]; // Passed from server or derived? Better derived to match catalog logic or fetched. 
    // Catalog fetches from API. Here we can derive from the products we have since it's a closed set (the collection).
}

const ITEMS_PER_PAGE = 12;

export default function CollectionProducts({ products: initialProducts }: { products: any[] }) {
    // We can accept initialProducts which are all products in the collection.

    // 1. Derive categories from the products
    // We need a map of category slug -> name.
    // Since product.category is a slug (usually), we might need a way to get the name. 
    // In Catalog it fetches /api/categories. We can do that or pass them.
    // For now let's try to fetch them or map them if we have a constant. 
    // Actually, distinct categories from the product list is best.

    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState("all");
    const [sortBy, setSortBy] = useState("new");
    const [currentPage, setCurrentPage] = useState(1);
    const [variantsMap, setVariantsMap] = useState<Record<string, ProductMinimal[]>>({});

    // Process products for display
    const filteredProducts = initialProducts.filter(product => {
        if (activeCategory === 'all') return true;
        return product.category === activeCategory;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        // 'new' - assuming initialProducts comes sorted by createdAt desc or we sort here
        // If 'new', we rely on original order if it was sorted, or sort by createdAt string comparison
        if (sortBy === 'new') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
    });

    const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
    const currentProducts = sortedProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Fetch categories on mount or derive
    useEffect(() => {
        // Derive categories present in this collection
        const uniqueCategories = Array.from(new Set(initialProducts.map(p => p.category)));

        // We need names for these slugs. We can fetch all categories to map them.
        fetch('/api/categories')
            .then(res => res.json())
            .then((allCats: Category[]) => {
                const relevantCats = allCats.filter(c => uniqueCategories.includes(c.slug));
                // Also handle cases where category might not be in the API (e.g. if hardcoded somewhere else, but typically they are in DB)

                // If we found matches, use them. If not, fallback to slug as name.
                const mappedCats = uniqueCategories.map(slug => {
                    const found = allCats.find(c => c.slug === slug);
                    return found || { id: slug, name: slug, slug };
                });

                setCategories([
                    { id: "all", name: "Всі товари", slug: "all" },
                    ...mappedCats
                ]);
            })
            .catch(() => {
                // Fallback if API fails
                setCategories([
                    { id: "all", name: "Всі товари", slug: "all" },
                    ...uniqueCategories.map(c => ({ id: c, name: c, slug: c }))
                ]);
            });
    }, [initialProducts]);


    // Fetch variants for visible products
    useEffect(() => {
        const seriesIds = Array.from(new Set(currentProducts.map(p => p.series).filter(Boolean))) as string[];

        if (seriesIds.length > 0) {
            // We can check if we already have them in initialProducts? 
            // The initialProducts contains ALL products of the collection. 
            // Variants (siblings) might be in the SAME collection.
            // But they might ALSO be in other collections? 
            // Typically variants are in the same series. 
            // A product in "Sonata" collection might have a variant that is ALSO in "Sonata".
            // But sometimes a variant might not be in the collection (rare but possible).
            // To be safe and consistent with Catalog, let's fetch from API or search in initialProducts.
            // Searching in initialProducts is instant and saves a request if they are there.
            // Let's try to find in initialProducts first.

            const newMap: Record<string, ProductMinimal[]> = {};

            // local search
            seriesIds.forEach(series => {
                if (!variantsMap[series]) {
                    const siblingsInCollection = initialProducts.filter(p => p.series === series);
                    // If we have siblings here, great.
                    // But we might miss siblings that are NOT in this collection.
                    // Does the user want to see ALL color variants even if they are not in this collection?
                    // Probably yes. So fetching from API is safer to get COMPLETE list of variants.
                }
            });

            // Let's use the API to be consistent with Catalog and ensure we get ALL variants (even those not in this collection)
            fetch(`/api/products?series=${seriesIds.join(',')}`)
                .then(r => r.json())
                .then((variants: ProductMinimal[]) => {
                    if (Array.isArray(variants)) {
                        const mapUpdate: Record<string, ProductMinimal[]> = {};
                        variants.forEach(v => {
                            if (v.series) {
                                if (!mapUpdate[v.series]) mapUpdate[v.series] = [];
                                mapUpdate[v.series].push(v);
                            }
                        });
                        setVariantsMap(prev => ({ ...prev, ...mapUpdate }));
                    }
                })
                .catch(err => console.error("Error fetching variants", err));
        }
    }, [currentProducts]); // removed 'products' dep as it causes loop if strictly used, currentProducts is derived.

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top of grid? 
        // Maybe scroll to component top? For now window top is fine or maybe 
        // we can scroll to the filter section.
    };

    // Handle category change -> reset page
    const handleCategoryChange = (slug: string) => {
        setActiveCategory(slug);
        setCurrentPage(1);
    };

    return (
        <div>
            {/* Filters & Sorting Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.slug)}
                        className={`text-sm px-5 py-2 rounded-full border transition-colors ${activeCategory === cat.slug
                            ? "bg-black text-white border-black"
                            : "bg-white text-gray-700 border-gray-300 hover:border-black"
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}

                {/* Sort dropdown */}
                <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
                    <span>Сортувати:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent font-medium text-black outline-none cursor-pointer"
                    >
                        <option value="new">Новинки</option>
                        <option value="price-asc">Ціна ↑</option>
                        <option value="price-desc">Ціна ↓</option>
                    </select>
                </div>
            </div>

            {/* Products Grid */}
            {currentProducts.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-500">Товарів не знайдено.</p>
                    <button
                        onClick={() => handleCategoryChange("all")}
                        className="mt-3 text-sm text-black underline underline-offset-4"
                    >
                        Скинути фільтри
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {currentProducts.map((product) => (
                            <CatalogProductCard
                                key={product.id}
                                product={product}
                                variants={product.series ? variantsMap[product.series] : undefined}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {sortedProducts.length > ITEMS_PER_PAGE && (
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
