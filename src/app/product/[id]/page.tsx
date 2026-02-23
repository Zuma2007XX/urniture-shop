'use client';

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ProductCarousel from "@/components/ui/ProductCarousel";
import { findMatchingSibling } from '@/lib/product-utils';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';
import { getLocalizedField } from '@/lib/translateDb';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string;
    category: string;
    series: string | null;
    badge: string | null;
    material: string | null;
    frame: string | null;
    upholstery: string | null;
    loadLimit: string | null;
    assembly: string | null;
    recyclability: string | null;
    warranty: string | null;
    concept: string | null;
    stock: number;
    collection: {
        id: string;
        title: string;
        description: string | null;
        image: string | null;
        slug: string;
    } | null;
    specifications: string | null;
}

export default function ProductPage() {
    const params = useParams();
    const { addItem } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [seriesProducts, setSeriesProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdded, setIsAdded] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [openSection, setOpenSection] = useState<string | null>('desc');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [siblings, setSiblings] = useState<Product[]>([]);
    const { language, t } = useLanguage();

    // Helper for normalizing strings (used in matching)
    // Remove all non-alphanumeric chars and lowercase
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-zа-я0-9]/g, '');

    const findSibling = (colorName: string) => {
        return findMatchingSibling(siblings, colorName);
    };

    useEffect(() => {
        // Fetch current product
        fetch(`/api/admin/products/${params.id}`)
            .then(r => r.json())
            .then(data => {
                if (!data || data.error) {
                    console.error('Product fetch error:', data);
                    setLoading(false);
                    return;
                }

                setProduct(data);

                // Fetch related products by category
                fetch(`/api/products?category=${data.category}`)
                    .then(r => r.json())
                    .then((related: any) => {
                        if (Array.isArray(related)) {
                            // Filter out current product
                            setSeriesProducts(related.filter((p: Product) => p.id !== data.id));
                        }
                    })
                    .catch(err => console.error("Error fetching related:", err));

                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [params.id]);

    useEffect(() => {
        if (product?.series) {
            fetch(`/api/products?series=${product.series}`)
                .then(r => r.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setSiblings(data.filter((p: Product) => p.id !== product.id));
                    }
                })
                .catch(err => console.error("Error fetching siblings:", err));
        }
    }, [product?.series, product?.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500">Товар не знайдено</p>
                <Link href="/catalog" className="text-sm text-black underline mt-4 block">
                    Повернутися до каталогу
                </Link>
            </div>
        );
    }

    const images = JSON.parse(product.images || '[]');
    const categoryLabels: Record<string, string> = {
        chairs: 'Крісла', tables: 'Столи', lamps: 'Лампи', sofas: 'Дивани', decor: 'Декор',
    };

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: getLocalizedField(product, 'name', language),
            price: product.price,
            image: images[0] || '',
            quantity: 1,
        });
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const nextImage = () => {
        setActiveImageIndex((prev) => (prev + 1) % images.length);
        setPreviewImage(null);
    };

    const prevImage = () => {
        setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
        setPreviewImage(null);
    };



    return (
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 animate-fadeIn">
            {/* ... breadcrumbs ... */}
            <nav className="py-4 text-[10px] uppercase tracking-widest text-gray-500 hidden md:block">
            </nav>

            {/* Main Product Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 pb-20 border-b border-gray-100 mt-6">
                {/* Left Column: Images */}

                <div className="flex flex-col gap-4 sticky top-24 h-fit">
                    {/* Main Image Carousel */}
                    <div className="relative aspect-[4/5] bg-transparent rounded-sm overflow-hidden group">
                        {/* Show preview if available, otherwise active image */}
                        {(previewImage || images[activeImageIndex]) ? (
                            <Image
                                src={previewImage || images[activeImageIndex]}
                                alt={getLocalizedField(product, 'name', language)}
                                fill
                                className="object-contain p-4 transition-transform duration-700 hover:scale-105"
                                priority
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                        )}

                        {/* Navigation Arrows */}
                        {images.length > 1 && !previewImage && (
                            <>
                                <button
                                    onClick={(e) => { e.preventDefault(); prevImage(); }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm z-10"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="w-5 h-5 text-black" />
                                </button>
                                <button
                                    onClick={(e) => { e.preventDefault(); nextImage(); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm z-10"
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="w-5 h-5 text-black" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {images.map((img: string, idx: number) => (
                                <button
                                    key={idx}
                                    className={`relative w-20 h-20 flex-shrink-0 bg-transparent rounded-sm overflow-hidden border-2 transition-all ${activeImageIndex === idx && !previewImage
                                        ? 'border-black opacity-100'
                                        : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                    onClick={() => { setActiveImageIndex(idx); setPreviewImage(null); }}
                                >
                                    <Image
                                        src={img}
                                        alt={`View ${idx + 1}`}
                                        fill
                                        className="object-contain p-1"
                                        sizes="80px"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Details */}
                <div className="flex flex-col pt-2">
                    {/* Breadcrumbs */}
                    <nav className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-6 font-bold">
                        <Link href="/" className="hover:text-black transition-colors">ГОЛОВНА</Link>
                        <span className="mx-2">›</span>
                        <Link href="/catalog" className="hover:text-black transition-colors">МЕБЛІ</Link>
                        <span className="mx-2">›</span>
                        <span className="text-black">{categoryLabels[product.category] || product.category}</span>
                    </nav>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 leading-[1.1]">
                        {getLocalizedField(product, 'name', language)}
                    </h1>

                    {/* Short Description */}
                    <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-md">
                        {getLocalizedField(product, 'description', language)}
                    </p>

                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-10 border-b border-gray-100 pb-8">
                        <span className="text-3xl font-bold text-gray-900">{product.price.toLocaleString('uk-UA')} грн</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">ПДВ включено</span>
                    </div>

                    {/* Color Selector */}
                    {(() => {
                        let colorsToRender: any[] = [];
                        let hasAdminColors = false;

                        // 1. Check Admin colors setup
                        if (product.specifications) {
                            try {
                                const specs = JSON.parse(product.specifications);
                                if (specs.colors && specs.colors.length > 0) {
                                    colorsToRender = specs.colors.map((c: any) => ({
                                        name: c.name,
                                        images: c.images || [c.image],
                                        isCurrent: normalize(product.name).includes(normalize(c.name)),
                                        siblingProd: findSibling(c.name)
                                    }));
                                    hasAdminColors = true;
                                }
                            } catch (e) { }
                        }

                        // 2. Fallback to Series Siblings (for scraped products)
                        if (!hasAdminColors && siblings.length > 0) {
                            const allVariants = [product, ...siblings];
                            colorsToRender = allVariants.map(v => {
                                let images = [];
                                try { images = JSON.parse(v.images || '[]'); } catch (e) { }

                                // Extract color name after 'мм' or fallback to specific logic
                                let colorName = v.badge || "Варіант";
                                const parts = v.name.split('мм');
                                if (parts.length > 1 && parts[1].trim()) {
                                    colorName = parts[1].replace(/&nbsp;/g, ' ').replace(/-/g, ' ').trim();
                                }

                                return {
                                    name: colorName,
                                    images: images,
                                    isCurrent: v.id === product.id,
                                    siblingProd: v.id === product.id ? null : v
                                };
                            });
                        }

                        if (colorsToRender.length > 0) {
                            return (
                                <div className="mb-10">
                                    <h3 className="text-xl mb-6">Колір</h3>
                                    <div className="flex gap-4 flex-wrap">
                                        {colorsToRender.map((color: any, index: number) => {
                                            const Wrapper = color.siblingProd ? Link : 'div';
                                            const isActive = color.isCurrent;

                                            return (
                                                <Wrapper
                                                    key={index}
                                                    href={color.siblingProd ? `/product/${color.siblingProd.id}` : "#"}
                                                    className={`flex flex-col items-center gap-2 group cursor-pointer ${isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                                                    title={color.name}
                                                    onMouseEnter={() => {
                                                        if (color.siblingProd && color.images && color.images.length > 0) {
                                                            setPreviewImage(color.images[0]);
                                                        }
                                                    }}
                                                    onMouseLeave={() => setPreviewImage(null)}
                                                >
                                                    <div className={`w-16 h-16 relative border rounded-lg overflow-hidden transition-all ${isActive ? 'border-black ring-1 ring-black shadow-md' : 'border-gray-200 group-hover:border-gray-400'}`}>
                                                        {color.images && color.images.length === 2 ? (
                                                            <>
                                                                <div className="absolute inset-0" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)', zIndex: 1 }}>
                                                                    <Image src={color.images[0]} alt="" fill className="object-cover" />
                                                                </div>
                                                                <div className="absolute inset-0" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}>
                                                                    <Image src={color.images[1]} alt="" fill className="object-cover" />
                                                                </div>
                                                                <div className="absolute inset-0 border-[0.5px] border-white/20" style={{
                                                                    background: 'linear-gradient(to bottom right, transparent 49%, white 49%, white 51%, transparent 51%)',
                                                                    opacity: 0.3
                                                                }} />
                                                            </>
                                                        ) : (
                                                            (color.images?.[0]) ? (
                                                                <Image src={color.images[0]} alt={color.name} fill className="object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[8px] text-gray-400">
                                                                    NO IMG
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                    <span className={`text-xs transition-colors text-center max-w-[80px] leading-tight ${isActive ? 'text-black font-medium' : 'text-gray-500 group-hover:text-black'}`}>
                                                        {color.name}
                                                    </span>
                                                </Wrapper>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })()}

                    {/* Actions */}
                    <div className="flex flex-col gap-3 mb-12">
                        <button
                            onClick={handleAddToCart}
                            disabled={isAdded}
                            className={`w-full flex items-center justify-between px-8 py-5 text-xs font-bold uppercase tracking-widest transition-all rounded-sm ${isAdded
                                ? 'bg-green-700 text-white cursor-default'
                                : 'bg-[#1a1a1a] text-white hover:bg-black'
                                }`}
                        >
                            <span>{isAdded ? 'Додано у кошик' : 'Додати у кошик'}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                            </svg>
                        </button>

                    </div>

                    {/* Tabs: Description / Specs / Delivery */}
                    <div>
                        <div className="flex gap-8 border-b border-gray-100 mb-6">
                            <button
                                onClick={() => setOpenSection('desc')}
                                className={`pb-3 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2 ${openSection === 'desc' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-900'}`}
                            >
                                Опис
                            </button>
                            <button
                                onClick={() => setOpenSection('specs')}
                                className={`pb-3 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2 ${openSection === 'specs' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-900'}`}
                            >
                                Характеристики
                            </button>
                            <button
                                onClick={() => setOpenSection('delivery')}
                                className={`pb-3 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2 ${openSection === 'delivery' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-900'}`}
                            >
                                Доставка
                            </button>
                        </div>

                        <div className="min-h-[400px] text-sm text-gray-500 leading-relaxed">
                            {openSection === 'desc' && (
                                <div className="animate-fadeIn">
                                    <p className="mb-4">{getLocalizedField(product, 'description', language)}</p>
                                    <p>{product.concept}</p>
                                </div>
                            )}
                            {openSection === 'specs' && (
                                <div className="animate-fadeIn space-y-8">
                                    {product.specifications ? (() => {
                                        let specs: any = {};
                                        try {
                                            specs = JSON.parse(product.specifications);
                                        } catch (e) {
                                            specs = {};
                                        }

                                        // Fallback to title extraction for dimensions
                                        let fallbackDims = null;
                                        const dimMatch = product.name.match(/(\d+)\s*[xх]\s*(\d+)\s*[xх]\s*(\d+)/i);
                                        if (dimMatch && (!specs.dimensions || (!specs.dimensions.width && !specs.dimensions.depth && !specs.dimensions.height))) {
                                            fallbackDims = {
                                                width: parseInt(dimMatch[1], 10),
                                                depth: parseInt(dimMatch[2], 10),
                                                height: parseInt(dimMatch[3], 10)
                                            };
                                        }
                                        const dims = specs.dimensions || fallbackDims;

                                        return (
                                            <>
                                                {/* Розміри */}
                                                {(dims?.width || dims?.height || dims?.depth || dims?.weight) && (
                                                    <div>
                                                        <h4 className="text-sm font-bold mb-3 uppercase tracking-wider text-gray-900 mt-6">Розміри та вага</h4>
                                                        <div className="grid grid-cols-1 gap-2 text-sm">
                                                            {dims?.width && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Ширина</span><span className="text-gray-900 font-medium text-right">{dims.width} мм</span></div>}
                                                            {dims?.depth && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Глибина</span><span className="text-gray-900 font-medium text-right">{dims.depth} мм</span></div>}
                                                            {dims?.height && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Висота</span><span className="text-gray-900 font-medium text-right">{dims.height} мм</span></div>}
                                                            {dims?.weight && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Вага</span><span className="text-gray-900 font-medium text-right">{dims.weight} кг</span></div>}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* General */}
                                                {(specs.general?.roomUse || specs.general?.location || specs.general?.drawerGuides || specs.general?.drawerCount) && (
                                                    <div>
                                                        <h4 className="text-sm font-bold mb-3 uppercase tracking-wider text-gray-900">Загальні</h4>
                                                        <div className="grid grid-cols-1 gap-2 text-sm">
                                                            {specs.general?.roomUse && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Кімната використання</span><span className="text-gray-900 font-medium text-right">{specs.general.roomUse}</span></div>}
                                                            {specs.general?.location && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Розташування</span><span className="text-gray-900 font-medium text-right">{specs.general.location}</span></div>}
                                                            {specs.general?.drawerGuides && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Тип направляючих</span><span className="text-gray-900 font-medium text-right">{specs.general.drawerGuides}</span></div>}
                                                            {specs.general?.drawerCount && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Кількість ящиків/дверей</span><span className="text-gray-900 font-medium text-right">{specs.general.drawerCount}</span></div>}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Materials */}
                                                {(specs.materials?.frameEdge || specs.materials?.frameMaterial || specs.materials?.facadeMaterial || specs.materials?.facadeEdge) && (
                                                    <div>
                                                        <h4 className="text-sm font-bold mb-3 uppercase tracking-wider text-gray-900 mt-6">Матеріали</h4>
                                                        <div className="grid grid-cols-1 gap-2 text-sm">
                                                            {specs.materials?.frameEdge && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Матеріал кромки каркасу</span><span className="text-gray-900 font-medium text-right">{specs.materials.frameEdge}</span></div>}
                                                            {specs.materials?.frameMaterial && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Матеріал каркасу</span><span className="text-gray-900 font-medium text-right">{specs.materials.frameMaterial}</span></div>}
                                                            {specs.materials?.facadeMaterial && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Матеріал фасаду</span><span className="text-gray-900 font-medium text-right">{specs.materials.facadeMaterial}</span></div>}
                                                            {specs.materials?.facadeEdge && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Матеріал кромки фасаду</span><span className="text-gray-900 font-medium text-right">{specs.materials.facadeEdge}</span></div>}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Frame */}
                                                {specs.frame?.shelfCount && (
                                                    <div>
                                                        <h4 className="text-sm font-bold mb-3 uppercase tracking-wider text-gray-900 mt-6">Каркас</h4>
                                                        <div className="grid grid-cols-1 gap-2 text-sm">
                                                            <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Кількість полиць</span><span className="text-gray-900 font-medium text-right">{specs.frame.shelfCount}</span></div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Warranty */}
                                                {(specs.warranty?.period || specs.warranty?.production) && (
                                                    <div>
                                                        <h4 className="text-sm font-bold mb-3 uppercase tracking-wider text-gray-900 mt-6">Гарантія</h4>
                                                        <div className="grid grid-cols-1 gap-2 text-sm">
                                                            {specs.warranty?.period && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Гарантійний термін</span><span className="text-gray-900 font-medium text-right">{specs.warranty.period}</span></div>}
                                                            {specs.warranty?.production && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Виробництво</span><span className="text-gray-900 font-medium text-right">{specs.warranty.production}</span></div>}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );

                                    })() : (
                                        <div className="grid grid-cols-2 gap-4">
                                            {product.loadLimit && <div><span className="text-gray-400 block text-[10px] uppercase">Навантаження</span> <span className="text-gray-900">{product.loadLimit}</span></div>}
                                            {product.assembly && <div><span className="text-gray-400 block text-[10px] uppercase">Збірка</span> <span className="text-gray-900">{product.assembly}</span></div>}
                                            {product.recyclability && <div><span className="text-gray-400 block text-[10px] uppercase">Переробка</span> <span className="text-gray-900">{product.recyclability}</span></div>}
                                            {product.warranty && <div><span className="text-gray-400 block text-[10px] uppercase">Гарантія</span> <span className="text-gray-900">{product.warranty}</span></div>}
                                        </div>
                                    )}
                                </div>
                            )}
                            {openSection === 'delivery' && (
                                <ul className="animate-fadeIn list-disc list-inside space-y-2">
                                    <li>Безкоштовна доставка замовлень від 10 000 ₴</li>
                                    <li>Термін виготовлення: 14-21 робочих днів</li>
                                    <li>Доставка кур'єрською службою Нова Пошта</li>
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Collection / Limited Series Bottom Section */}
            {(product.collection || product.series) && (
                <div className="py-20 bg-gray-50 rounded-sm overflow-hidden mb-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-6 lg:px-20">
                        <div className="order-2 lg:order-1">

                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                Колекція '{product.collection ? getLocalizedField(product.collection, 'title', language) : product.series}'
                            </h2>
                            <p className="text-sm text-gray-500 leading-bold mb-8 max-w-md">
                                {product.collection ? getLocalizedField(product.collection, 'description', language) : ""}
                            </p>
                            <Link href="/catalog" className="inline-block bg-[#1a1a1a] text-white text-[10px] font-bold uppercase tracking-widest px-8 py-4 hover:bg-black transition-colors rounded-sm">
                                Дивитися всю серію
                            </Link>
                        </div>
                        <div className="order-1 lg:order-2 relative aspect-square bg-transparent">
                            {(product.collection?.image || images[1]) && (
                                <Image
                                    src={product.collection?.image || images[1]}
                                    alt={product.collection?.title || "Collection"}
                                    fill
                                    className="object-contain"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Related Products Carousel */}
            {seriesProducts.length > 0 && (
                <div className="py-20 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl font-bold text-gray-900">Схожі товари</h2>
                        <Link href={`/catalog?category=${product.category}`} className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 hover:border-gray-300 transition-colors">
                            Дивитися всі
                        </Link>
                    </div>
                    <ProductCarousel products={seriesProducts} />
                </div>
            )}
        </div>
    );
}
