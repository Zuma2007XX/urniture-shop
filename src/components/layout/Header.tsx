'use client';

import Link from 'next/link';
// Image import removed for logo; using native img to avoid caching
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { getLocalizedField } from '@/lib/translateDb';

export default function Header() {
    const { data: session } = useSession();
    const { items } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);

    const [showSuggestions, setShowSuggestions] = useState(false);

    const { language, setLanguage, t } = useLanguage();
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

    const [categories, setCategories] = useState<any[]>([]);
    const [collections, setCollections] = useState<any[]>([]);
    const [logoUrl, setLogoUrl] = useState('/logo.png');
    const [instagramUrl, setInstagramUrl] = useState('https://instagram.com');

    useEffect(() => {
        setLogoUrl(`/logo.png?v=${Date.now()}`);
    }, []);

    // Fetch categories and collections for dropdowns
    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCategories(data);
            })
            .catch(err => console.error("Failed to fetch categories", err));

        fetch('/api/collections')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCollections(data);
            })
            .catch(err => console.error("Failed to fetch collections", err));

        fetch('/api/admin/content')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const social = data.find((c: any) => c.section === 'contact_social');
                    if (social?.linkText) setInstagramUrl(social.linkText);
                }
            })
            .catch(err => console.error("Failed to fetch social links", err));
    }, []);

    // Close lang menu on click outside
    useEffect(() => {
        const handleClickOutside = () => setIsLangMenuOpen(false);
        if (isLangMenuOpen) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => window.removeEventListener('click', handleClickOutside);
    }, [isLangMenuOpen]);

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.trim().length > 1) {
                fetch(`/api/products?search=${encodeURIComponent(searchTerm)}`)
                    .then(res => res.json())
                    .then(data => {
                        if (Array.isArray(data)) {
                            setSuggestions(data.slice(0, 5));
                            setShowSuggestions(true);
                        }
                    })
                    .catch(err => console.error(err));
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = () => setShowSuggestions(false);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            router.push(`/catalog?search=${encodeURIComponent(searchTerm)}`);
            setShowSuggestions(false);
            setIsMenuOpen(false);
        }
    };

    return (
        <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-14 flex justify-between items-center relative">
                {/* Left: Logo */}
                <Link href="/" className="flex items-center shrink-0">
                    <img src={logoUrl} alt="Serious Mebel" style={{ height: 57, width: 'auto' }} className="object-contain" />
                </Link>

                {/* Center: Nav */}
                <nav className="hidden md:flex items-center gap-7 h-full">
                    <Link href="/" className="text-[13px] text-gray-700 hover:text-black transition-colors">
                        {t('header.home')}
                    </Link>

                    {/* Catalog Dropdown */}
                    <div className="relative group h-full flex items-center">
                        <Link href="/catalog" className="text-[13px] text-gray-700 hover:text-black transition-colors py-4">
                            {t('header.catalog')}
                        </Link>
                        {categories.length > 0 && (
                            <div className="absolute top-[calc(100%-0.5rem)] left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100/50 p-6 w-[500px]">
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                        {categories.map((category) => (
                                            <Link
                                                key={category.id}
                                                href={`/catalog?category=${category.slug}`}
                                                className="group/link text-[13px] font-medium text-gray-600 hover:text-black hover:bg-gray-50/80 px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-between"
                                            >
                                                <span>{getLocalizedField(category, 'name', language)}</span>
                                                {category._count?.products > 0 && (
                                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full group-hover/link:bg-white group-hover/link:text-black transition-colors shadow-sm">
                                                        {category._count.products}
                                                    </span>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                    <div className="mt-6 pt-5 border-t border-gray-100">
                                        <Link href="/catalog" className="flex items-center justify-center w-full py-3 bg-black text-white text-[13px] font-bold tracking-wide uppercase rounded-xl hover:bg-gray-900 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                            {t('header.show_all') || 'Смотреть все'}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Collections Dropdown */}
                    <div className="relative group h-full flex items-center">
                        <Link href="/collections" className="text-[13px] text-gray-700 hover:text-black transition-colors py-4">
                            {t('header.collections')}
                        </Link>
                        {collections.length > 0 && (
                            <div className="absolute top-[calc(100%-0.5rem)] left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100/50 p-6 w-[700px]">
                                    <div className="grid grid-cols-3 gap-4">
                                        {collections.map((collection) => (
                                            <Link
                                                key={collection.id}
                                                href={`/collections/${collection.slug}`}
                                                className="group/item relative overflow-hidden rounded-xl block aspect-[4/3]"
                                            >
                                                {/* Background Image */}
                                                {collection.image ? (
                                                    <img
                                                        src={collection.image}
                                                        alt={getLocalizedField(collection, 'title', language)}
                                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-105"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 w-full h-full bg-gray-100 flex items-center justify-center transition-transform duration-700 group-hover/item:scale-105">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-gray-300">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                                        </svg>
                                                    </div>
                                                )}

                                                {/* Overlay Gradient */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover/item:opacity-90 transition-opacity duration-300" />

                                                {/* Text Content */}
                                                <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col items-start justify-end">
                                                    <h4 className="text-[15px] font-bold text-white mb-1 shadow-sm">{getLocalizedField(collection, 'title', language)}</h4>
                                                    <div className="flex items-center gap-2">
                                                        {collection._count?.products > 0 && (
                                                            <span className="text-[10px] font-medium text-white/80 uppercase tracking-wider bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                                                                {collection._count.products} виробів
                                                            </span>
                                                        )}
                                                        <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-2.5 h-2.5 text-white">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}

                                        {/* "Все коллекции" Card inside Grid */}
                                        <Link
                                            href="/collections"
                                            className="group/btn relative overflow-hidden rounded-xl bg-gray-50 hover:bg-black transition-colors duration-300 flex flex-col items-center justify-center aspect-[4/3] border border-gray-100"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black shadow-sm group-hover/btn:scale-110 transition-transform duration-300">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                                    </svg>
                                                </div>
                                                <span className="text-[13px] font-bold text-gray-900 group-hover/btn:text-white uppercase tracking-wide transition-colors duration-300">
                                                    Всі колекції
                                                </span>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <Link href="/about" className="text-[13px] text-gray-700 hover:text-black transition-colors">
                        {t('header.about')}
                    </Link>
                    <Link href="/contacts" className="text-[13px] text-gray-700 hover:text-black transition-colors">
                        {t('header.contacts')}
                    </Link>
                </nav>

                {/* Right: Instagram + Search + User + Cart */}
                <div className="flex items-center gap-5">
                    {/* Instagram Icon */}
                    <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden md:flex text-gray-500 hover:text-black transition-colors"
                        title="Instagram"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                            <circle cx="12" cy="12" r="5" />
                            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                        </svg>
                    </a>

                    {/* Search Bar Container */}
                    <div className="relative z-50">
                        <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 gap-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                            <input
                                type="text"
                                placeholder={t('header.search')}
                                className="bg-transparent text-sm outline-none w-32 placeholder-gray-400 focus:w-48 transition-all duration-300"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearch}
                                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                            />
                        </div>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden py-2"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="max-h-[60vh] overflow-y-auto">
                                    {suggestions.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/product/${product.id}`}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                            onClick={() => setShowSuggestions(false)}
                                        >
                                            <div className="relative w-10 h-10 bg-gray-100 rounded overflow-hidden shrink-0">
                                                {product.images && (() => {
                                                    let imgSrc = '';
                                                    try {
                                                        const parsed = JSON.parse(product.images);
                                                        if (Array.isArray(parsed) && parsed.length > 0) imgSrc = parsed[0];
                                                    } catch (e) {
                                                        imgSrc = product.images.split(',')[0].trim();
                                                    }
                                                    // Handle potential cleanup if it still has brackets/quotes from bad split
                                                    if (imgSrc.startsWith('["')) imgSrc = imgSrc.replace('["', '').replace('"]', '');

                                                    return imgSrc ? (
                                                        <img
                                                            src={imgSrc}
                                                            alt={product.name}
                                                            className="object-cover w-full h-full"
                                                        />
                                                    ) : null;
                                                })()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                                <p className="text-xs text-gray-500">{product.price} ₴</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                <div className="border-t border-gray-100 mt-1 pt-1">
                                    <button
                                        className="w-full text-left px-4 py-2 text-xs font-medium text-black hover:bg-gray-50 transition-colors"
                                        onClick={() => {
                                            router.push(`/catalog?search=${encodeURIComponent(searchTerm)}`);
                                            setShowSuggestions(false);
                                        }}
                                    >
                                        {t('header.show_all')} ({suggestions.length}+)
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>



                    {/* User Icon */}
                    {session ? (
                        <div className="flex items-center gap-3">
                            <Link href="/profile" className="text-gray-600 hover:text-black transition-colors" title={t('header.profile')}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                            </Link>
                        </div>
                    ) : (
                        <Link href="/auth/signin" className="text-gray-600 hover:text-black transition-colors" title={t('header.login')}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                        </Link>
                    )}

                    {/* Cart Icon */}
                    <Link href="/cart" className="text-gray-600 hover:text-black transition-colors relative" title={t('header.cart')}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12.636A1.125 1.125 0 0 1 19.747 22.5H4.253a1.125 1.125 0 0 1-1.122-1.233L4.394 8.514a1.125 1.125 0 0 1 1.122-1.007h12.968a1.125 1.125 0 0 1 1.122 1.007Z" />
                        </svg>
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-black"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {
                isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 py-4 px-6 flex flex-col gap-4">
                        <Link href="/catalog" className="text-sm text-gray-700">{t('header.catalog')}</Link>
                        <Link href="/collections" className="text-sm text-gray-700">{t('header.collections')}</Link>
                        <Link href="/about" className="text-sm text-gray-700">{t('header.about')}</Link>
                        <Link href="/contacts" className="text-sm text-gray-700">{t('header.contacts')}</Link>
                        <Link href="/cart" className="text-sm text-gray-700">{t('header.cart')} ({cartCount})</Link>
                        {session ? (
                            <>
                                <Link href="/profile" className="text-sm text-gray-700">{t('header.profile')}</Link>
                                <button onClick={() => signOut()} className="text-sm text-gray-500 text-left">{t('header.logout')}</button>
                            </>
                        ) : (
                            <Link href="/auth/signin" className="text-sm text-gray-700">{t('header.login')}</Link>
                        )}
                    </div>
                )
            }
        </header >
    );
}
