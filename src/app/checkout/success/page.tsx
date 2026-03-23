'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const orderNumber = searchParams.get('order');
    const { clearCart } = useCart();
    const [isCleared, setIsCleared] = useState(false);

    useEffect(() => {
        if (!isCleared) {
            clearCart();
            setIsCleared(true);
        }
    }, [clearCart, isCleared]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mb-8 shadow-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
            </div>

            <h1 className="text-4xl font-black uppercase mb-4 tracking-tight">Замовлення сплачено!</h1>
            <p className="text-gray-500 max-w-sm mb-10 leading-relaxed">
                Дякуємо! Ваше замовлення <span className="font-bold text-black">#{orderNumber}</span> успішно оформлено та сплачено. 
                Ми розпочнемо підготовку до відправки найближчим часом.
            </p>

            <Link href="/catalog" className="bg-black text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-800 transition-all active:scale-[0.98]">
                Повернутися до каталогу
            </Link>
        </div>
    );
}
