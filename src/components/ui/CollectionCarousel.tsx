'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Collection {
    id: string;
    title: string;
    slug: string;
    image: string | null;
    description: string | null;
}

interface CollectionCarouselProps {
    collections: Collection[];
}

export default function CollectionCarousel({ collections }: CollectionCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = container.clientWidth / (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1);
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    if (collections.length === 0) {
        return <p className="text-gray-500 text-center">Колекції ще не додані.</p>;
    }

    return (
        <div className="relative group/carousel">
            {/* Left Arrow */}
            <button
                onClick={() => scroll('left')}
                className={`absolute left-0 top-1/3 -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-lg p-3 rounded-full hover:bg-gray-50 transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 ${!showLeftArrow ? 'invisible' : ''}`}
                aria-label="Previous"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
            </button>

            {/* Right Arrow */}
            <button
                onClick={() => scroll('right')}
                className={`absolute right-0 top-1/3 -translate-y-1/2 translate-x-4 z-10 bg-white shadow-lg p-3 rounded-full hover:bg-gray-50 transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 ${!showRightArrow ? 'invisible' : ''}`}
                aria-label="Next"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
            </button>

            {/* Scroll Container */}
            <div
                ref={scrollContainerRef}
                onScroll={checkScroll}
                className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pt-2 pb-10"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {collections.map((item) => (
                    <div
                        key={item.id}
                        className="min-w-full md:min-w-[calc(50%-12px)] lg:min-w-[calc(33.333%-16px)] snap-start flex-shrink-0 flex flex-col gap-4 group"
                    >
                        <div className="relative w-full aspect-[4/3] bg-gray-50 rounded-3xl overflow-hidden">
                            <Link href={`/collections/${item.slug}`}>
                                {item.image ? (
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className="object-cover p-2 rounded-2xl group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">No Image</div>
                                )}
                            </Link>
                        </div>
                        <div className="flex flex-col gap-3 items-center text-center px-4">
                            <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>

                            <Link
                                href={`/collections/${item.slug}`}
                                className="inline-flex items-center gap-2 bg-black text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-gray-900 transition-colors mt-1"
                            >
                                Дивитись колекцію
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
