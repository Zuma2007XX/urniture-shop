'use client';

import { useCart } from "@/context/CartContext";
import { useState } from "react";

interface AddToCartHomeButtonProps {
    product: {
        id: string;
        name: string;
        price: number;
        images: string;
    };
}

export default function AddToCartHomeButton({ product }: AddToCartHomeButtonProps) {
    const { addItem } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation if inside a link (though we will separate them)
        e.stopPropagation();

        const images = JSON.parse(product.images || '[]');

        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: images[0] || '',
            quantity: 1,
        });

        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <button
            onClick={handleAddToCart}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 shadow-sm ${isAdded ? 'bg-green-600 text-white scale-110' : 'bg-black text-white hover:bg-gray-800 hover:scale-105'
                }`}
            aria-label="Додати в кошик"
            title="Додати в кошик"
        >
            {isAdded ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
            )}
        </button>
    );
}
