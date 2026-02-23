'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';

export default function Cart() {
    const { items, removeItem, updateQuantity, total } = useCart();

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-bold mb-6">Ваш кошик порожній</h1>
                <p className="text-gray-500 mb-8">Ви ще нічого не додали до кошика.</p>
                <Link
                    href="/catalog"
                    className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors"
                >
                    Перейти до каталогу
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8">Кошик</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                    {items.map((item) => (
                        <div key={item.id} className="flex gap-6 py-6 border-b border-gray-100 last:border-0">
                            <div className="relative w-24 h-24 bg-gray-100 shrink-0">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="flex-1 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-medium text-lg">{item.name}</h3>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456-1.291-1.81-1.319a2.25 2.25 0 0 0-2.244-.226l-5.152 2.161a2.25 2.25 0 0 0-1.166 2.505m10.371 1.13-10.371 1.13" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="px-3 py-1 hover:bg-gray-100"
                                        >
                                            -
                                        </button>
                                        <span className="px-3 py-1 font-medium">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="px-3 py-1 hover:bg-gray-100"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <p className="font-semibold text-lg">{(item.price * item.quantity).toLocaleString('uk-UA')} ₴</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-xl font-bold mb-6">Разом</h3>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Проміжний підсумок</span>
                                <span>{total.toLocaleString('uk-UA')} ₴</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Доставка</span>
                                <span>Безкоштовно</span>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4 mb-8">
                            <div className="flex justify-between font-bold text-xl">
                                <span>Сума</span>
                                <span>{total.toLocaleString('uk-UA')} ₴</span>
                            </div>
                        </div>

                        <Link
                            href="/checkout"
                            className="block w-full bg-black text-white text-center py-4 rounded-md font-medium hover:bg-gray-800 transition-colors"
                        >
                            Оформити замовлення
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
