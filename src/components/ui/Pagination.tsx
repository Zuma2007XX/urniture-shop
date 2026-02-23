import React from 'react';
import Link from 'next/link';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange?: (page: number) => void;
    createPageUrl?: (page: number) => string;
}

export default function Pagination({ currentPage, totalPages, onPageChange, createPageUrl }: PaginationProps) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        // Always show first, last, current, and neighbors
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - 1 && i <= currentPage + 1)
            ) {
                pages.push(i);
            } else if (
                (i === currentPage - 2 && currentPage > 3) ||
                (i === currentPage + 2 && currentPage < totalPages - 2)
            ) {
                pages.push('...');
            }
        }
        // Remove duplicates and keep order (simplified logic above might produce dups or adjacent dots, let's refine)
        return Array.from(new Set(pages));
    };

    // Better logic for dots
    const renderPageNumbers = () => {
        const pages = [];
        const showMax = 5;

        if (totalPages <= showMax) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            // Always show 1
            pages.push(1);

            if (currentPage > 3) pages.push('...');

            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            // Adjust if near start
            if (currentPage <= 3) {
                start = 2;
                end = 4;
            }
            // Adjust if near end
            if (currentPage >= totalPages - 2) {
                start = totalPages - 3;
                end = totalPages - 1;
            }

            for (let i = start; i <= end; i++) {
                if (i > 1 && i < totalPages) pages.push(i);
            }

            if (currentPage < totalPages - 2) pages.push('...');

            // Always show last
            pages.push(totalPages);
        }
        return pages;
    };

    const pages = renderPageNumbers();

    const renderButton = (page: number | string, isActive: boolean, isDisabled: boolean = false) => {
        if (page === '...') {
            return <span key={`dots-${Math.random()}`} className="px-3 py-2 text-gray-400">...</span>;
        }

        const className = `w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors border ${isActive
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-gray-200 hover:border-black hover:text-black'
            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`;

        if (createPageUrl) {
            return (
                <Link
                    key={page}
                    href={createPageUrl(page as number)}
                    className={className}
                >
                    {page}
                </Link>
            );
        }

        return (
            <button
                key={page}
                onClick={() => onPageChange?.(page as number)}
                disabled={isDisabled}
                className={className}
            >
                {page}
            </button>
        );
    };

    const renderArrow = (direction: 'prev' | 'next') => {
        const isDisabled = direction === 'prev' ? currentPage === 1 : currentPage === totalPages;
        const targetPage = direction === 'prev' ? currentPage - 1 : currentPage + 1;

        const className = `flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${isDisabled
                ? 'opacity-40 cursor-not-allowed text-gray-400 border-transparent'
                : 'text-gray-700 border-gray-200 hover:border-black hover:text-black'
            }`;

        const content = (
            <>
                {direction === 'prev' && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                )}
                <span>{direction === 'prev' ? 'Назад' : 'Далі'}</span>
                {direction === 'next' && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                )}
            </>
        );

        if (isDisabled) {
            return <div className={className}>{content}</div>;
        }

        if (createPageUrl) {
            return (
                <Link href={createPageUrl(targetPage)} className={className}>
                    {content}
                </Link>
            );
        }

        return (
            <button onClick={() => onPageChange?.(targetPage)} className={className}>
                {content}
            </button>
        );
    };

    return (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-12">
            {renderArrow('prev')}
            <div className="flex items-center gap-1 mx-2">
                {pages.map((p) => renderButton(p, p === currentPage))}
            </div>
            {renderArrow('next')}
        </div>
    );
}
