'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { findMatchingSibling, ProductMinimal, isColorMatching } from '@/lib/product-utils';
import { useLanguage } from '@/context/LanguageContext';
import { getLocalizedField } from '@/lib/translateDb';

const getCategoryName = (slug: string) => {
    const category = PRODUCT_CATEGORIES.find(c => c.id === slug);
    return category ? category.name : slug;
};

interface Product {
    id: string;
    name: string;
    nameEn?: string | null;
    nameRu?: string | null;
    nameBg?: string | null;
    price: number;
    images: string;
    category: string;
    badge?: string | null;
    isNew?: boolean;
    material?: string | null;
    description?: string;
    specifications?: string | null;
    series?: string | null;
}

export interface CatalogProductCardProps {
    product: Product;
    variants?: ProductMinimal[];
    hideWishlist?: boolean;
}

export default function CatalogProductCard({ product, variants, hideWishlist }: CatalogProductCardProps) {
    const { addItem } = useCart();
    const [isAdded, setIsAdded] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const { language } = useLanguage();

    const images = JSON.parse(product.images || '[]');
    const imageSrc = previewImage || images[0] || '';

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        addItem({
            id: product.id,
            name: getLocalizedField(product, 'name', language),
            price: product.price,
            image: imageSrc,
            quantity: 1,
        });

        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <div className="group/card relative bg-white border border-gray-100 rounded-lg p-4 transition-all duration-300 hover:shadow-lg flex flex-col h-full">
            {/* Top Row: Badges & Wishlist */}
            <div className="flex justify-between items-start mb-4 z-10 relative">
                <div className="flex flex-col gap-1">
                    {product.badge && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm w-fit ${product.badge === 'SALE' ? 'bg-black text-white' : 'bg-gray-100 text-black'
                            }`}>
                            {product.badge}
                        </span>
                    )}
                    {product.isNew && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm w-fit bg-blue-600 text-white">
                            NEW
                        </span>
                    )}
                </div>

                {!hideWishlist && (
                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Image */}
            <Link
                href={`/product/${product.id}`}
                className="block relative aspect-square mb-6 overflow-hidden"
                onMouseEnter={() => {
                    if (!previewImage && images.length > 1) {
                        // We rely on CSS hover for the secondary image opacity
                    }
                }}
            >
                {/* Main Image */}
                <Image
                    src={imageSrc}
                    alt={getLocalizedField(product, 'name', language)}
                    fill
                    className="object-contain transition-all duration-500 group-hover/card:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                />

                {!imageSrc && (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">No Image</div>
                )}
            </Link>

            {/* Content */}
            <div className="flex flex-col flex-1">
                {/* Price */}
                <div className="mb-2">
                    <span className={`text-xl font-bold ${product.badge === 'SALE' ? 'text-red-600' : 'text-black'}`}>
                        {product.price.toLocaleString('uk-UA')} ₴
                    </span>
                    {/* Old price simulation if SALE */}
                    {product.badge === 'SALE' && (
                        <span className="ml-2 text-sm text-gray-400 line-through">
                            {(product.price * 1.2).toLocaleString('uk-UA', { maximumFractionDigits: 0 })} ₴
                        </span>
                    )}
                </div>

                {/* Title */}
                <Link href={`/product/${product.id}`} className="mb-1">
                    <h3 className="text-sm font-medium text-gray-900 group-hover/card:text-black line-clamp-2 min-h-[40px]">
                        {getLocalizedField(product, 'name', language)}
                    </h3>
                </Link>

                {/* Additional Info / Attributes */}
                <div className="text-xs text-gray-500 mb-4 min-h-[20px]">
                    {getCategoryName(product.category)}
                </div>
            </div>

            {/* Color Variants */}
            {(() => {
                try {
                    const specs = product.specifications ? JSON.parse(product.specifications) : null;
                    if (specs?.colors && Array.isArray(specs.colors) && specs.colors.length > 0) {
                        const isStyleCollection = product.name.toLowerCase().includes('стайл') || product.category === 'style';

                        // Style collection: 3 columns grid (as requested to keep)
                        // Others: Flex row (as requested "в ряд")
                        const containerClass = isStyleCollection
                            ? "grid grid-cols-3 gap-2 mb-4 w-fit"
                            : "flex flex-wrap gap-2 mb-4";

                        const limit = isStyleCollection ? 6 : 5; // Show 6 for grid, 5 for row (plus counter)

                        return (
                            <div className={containerClass}>
                                {specs.colors.slice(0, limit).map((color: any, idx: number) => {
                                    const sibling = variants && variants.length > 0 ? findMatchingSibling(variants, color.name) : null;
                                    const Wrapper = sibling ? Link : 'div';
                                    const wrapperProps = sibling ? { href: `/product/${sibling.id}` } : {};

                                    return (
                                        <Wrapper
                                            key={idx}
                                            href={sibling ? `/product/${sibling.id}` : "#"}
                                            className="relative w-12 h-12 rounded-sm border border-gray-200 overflow-hidden shadow-sm hover:border-black transition-colors block cursor-pointer"
                                            title={color.name}
                                            onMouseEnter={() => {
                                                // 1. Try to find sibling variant first
                                                if (sibling) {
                                                    try {
                                                        const siblingImages = JSON.parse(sibling.images);
                                                        if (siblingImages.length > 0) {
                                                            // Use the first image (product on white background)
                                                            setPreviewImage(siblingImages[0]);
                                                            return;
                                                        }
                                                    } catch (e) {
                                                        console.error("Error parsing sibling images", e);
                                                    }
                                                }

                                                // 2. If no sibling found, show current product's first image
                                                if (isColorMatching(product.name, color.name)) {
                                                    setPreviewImage(images[0]); // Show first main image
                                                    return;
                                                }


                                            }}
                                            onMouseLeave={() => setPreviewImage(null)}
                                        >
                                            {color.images && color.images.length === 2 ? (
                                                <>
                                                    <div className="absolute inset-0" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)', zIndex: 1 }}>
                                                        <Image src={color.images[0]} alt="" fill className="object-cover" sizes="48px" />
                                                    </div>
                                                    <div className="absolute inset-0" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}>
                                                        <Image src={color.images[1]} alt="" fill className="object-cover" sizes="48px" />
                                                    </div>
                                                    <div className="absolute inset-0" style={{
                                                        background: 'linear-gradient(to bottom right, transparent 49%, rgba(255,255,255,0.5) 49%, rgba(255,255,255,0.5) 51%, transparent 51%)',
                                                    }} />
                                                </>
                                            ) : (
                                                (color.images?.[0] || color.image) ? (
                                                    <Image src={color.images?.[0] || color.image} alt={color.name} fill className="object-cover" sizes="48px" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100" />
                                                )
                                            )}
                                        </Wrapper>
                                    );
                                })}
                                {specs.colors.length > limit && (
                                    <div className="text-[10px] text-gray-400 flex items-center justify-center h-12 w-12 border border-gray-100 rounded-sm">
                                        +{specs.colors.length - limit}
                                    </div>
                                )}
                            </div>
                        );
                    }
                } catch (e) {
                    // ignore parse error
                }
                return null;
            })()}

            {/* Footer: Rating & Cart Btn */}
            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                {/* Rating */}
                <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">4.9</span>
                    <span className="text-xs text-gray-400 ml-1">/ 24 відгуки</span>
                </div>

                {/* Cart Button */}
                <button
                    onClick={handleAddToCart}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${isAdded ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-gray-800'
                        }`}
                    title="Додати в кошик"
                >
                    {isAdded ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}
