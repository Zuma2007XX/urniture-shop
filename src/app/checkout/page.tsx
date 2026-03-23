'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

// ─── Manager Contact Links ─────────────────────────────────────────────────
const MANAGER_INSTAGRAM = 'https://www.instagram.com/seriousmebel.ua/';
const MANAGER_TELEGRAM = 'https://t.me/seriousmebel';
const MANAGER_VIBER = 'viber://chat?number=%2B380000000000';

export default function CheckoutPage() {
    const { items, total, clearCart } = useCart();
    const { data: session } = useSession();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderNumber, setOrderNumber] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        city: '',
        cityRef: '',
        deliveryService: 'nova-poshta', // 'nova-poshta' or 'meest'
        deliveryType: 'branch', // 'branch' or 'address'
        branch: '',
        branchRef: '',
        address: '',
        paymentMethod: 'monobank', // 'monobank', 'liqpay', 'bank_transfer' or 'cod'
    });

    const [cities, setCities] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [isSearchingCity, setIsSearchingCity] = useState(false);
    const [isSearchingWarehouses, setIsSearchingWarehouses] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);

    // Fetch cities when typing
    useEffect(() => {
        if (formData.city.length < 2) {
            setCities([]);
            setShowCityDropdown(false); // Hide dropdown if query is too short
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearchingCity(true);
            try {
                const res = await fetch(`/api/delivery?type=cities&service=${formData.deliveryService}&query=${encodeURIComponent(formData.city)}`);
                const data = await res.json();
                setCities(data);
                setShowCityDropdown(true);
            } catch (error) {
                console.error('Error fetching cities:', error);
            } finally {
                setIsSearchingCity(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [formData.city, formData.deliveryService]);

    // Fetch warehouses when city is selected
    useEffect(() => {
        if (!formData.cityRef) {
            setWarehouses([]);
            return;
        }

        const fetchWarehouses = async () => {
            setIsSearchingWarehouses(true);
            try {
                const res = await fetch(`/api/delivery?type=warehouses&service=${formData.deliveryService}&cityRef=${formData.cityRef}`);
                const data = await res.json();
                setWarehouses(data);
            } catch (error) {
                console.error('Error fetching warehouses:', error);
            } finally {
                setIsSearchingWarehouses(false);
            }
        };

        fetchWarehouses();
    }, [formData.cityRef, formData.deliveryService]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCitySelect = (city: any) => {
        setFormData(prev => ({
            ...prev,
            city: city.Present,
            cityRef: city.DeliveryCity,
            branch: '',
            branchRef: ''
        }));
        setShowCityDropdown(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    items,
                    total,
                    userId: session?.user?.id || undefined,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Помилка при оформленні заявки');
            }

            const data = await response.json();

            // Handle Payment Redirect
            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
                return;
            }

            setOrderNumber(data.orderNumber);
            clearCart();
        } catch (error: any) {
            console.error('Checkout error:', error);
            alert(error.message || 'Виникла помилка. Спробуйте ще раз.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── Empty cart ───────────────────────────────────────────────────────
    if (items.length === 0 && !orderNumber) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12A1.125 1.125 0 0 1 19.747 22.5H4.253a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Кошик порожній</h2>
                    <p className="text-gray-500 mb-8">Додайте товари з каталогу, щоб оформити замовлення.</p>
                    <Link href="/catalog" className="inline-flex items-center justify-center w-full bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors uppercase tracking-wider text-sm">
                        Перейти до каталогу
                    </Link>
                </div>
            </div>
        );
    }

    // ─── Thank You Screen ─────────────────────────────────────────────────
    if (orderNumber) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-6">
                <div className="max-w-lg w-full text-center">
                    {/* Success icon */}
                    <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-10 h-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black mb-3">Дякуємо за замовлення!</h1>
                    <p className="text-gray-500 text-base mb-8">Ваше замовлення успішно прийняте. Менеджер зв'яжеться з вами найближчим часом.</p>

                    {/* Order number card */}
                    <div className="bg-black text-white rounded-2xl px-8 py-6 mb-8 shadow-2xl">
                        <p className="text-sm uppercase tracking-widest text-gray-400 mb-2">Номер замовлення</p>
                        <div className="flex items-center justify-center gap-4">
                            <p className="text-5xl font-black tracking-widest">#{orderNumber}</p>
                        </div>
                    </div>

                    <Link
                        href="/catalog"
                        className="inline-block text-sm text-gray-500 hover:text-black underline underline-offset-4 transition-colors"
                    >
                        Повернутися до каталогу
                    </Link>
                </div>
            </div>
        );
    }

    // ─── Checkout Form ────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-32">
            <div className="max-w-[1000px] mx-auto px-6 lg:px-10">
                <h1 className="text-3xl md:text-4xl font-black uppercase mb-3">
                    Оформлення замовлення
                </h1>
                <div className="flex flex-col lg:flex-row gap-10 items-start mt-10">

                    {/* Left: Form */}
                    <div className="w-full lg:w-3/5">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Step 1: Contact Details */}
                            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold uppercase mb-6 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white text-sm">1</span>
                                    Контактні дані
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <input required name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Ім'я" className="w-full border border-gray-200 rounded-xl px-4 py-3" />
                                    <input required name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Прізвище" className="w-full border border-gray-200 rounded-xl px-4 py-3" />
                                    <input required name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Телефон" className="w-full border border-gray-200 rounded-xl px-4 py-3" />
                                    <input name="email" value={formData.email} onChange={handleInputChange} placeholder="Email (необов'язково)" className="w-full border border-gray-200 rounded-xl px-4 py-3" />
                                </div>
                            </section>

                            {/* Step 2: Delivery */}
                            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold uppercase mb-6 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white text-sm">2</span>
                                    Доставка
                                </h3>

                                <div className="space-y-6">
                                    <select name="deliveryService" value={formData.deliveryService} onChange={handleInputChange} className="w-full border border-gray-200 rounded-xl px-4 py-3">
                                        <option value="nova-poshta">Нова Пошта</option>
                                        <option value="meest">Міст Експрес</option>
                                    </select>

                                    <div className="relative">
                                        <input
                                            required
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="Введіть місто..."
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3"
                                            autoComplete="off"
                                        />
                                        {isSearchingCity && <div className="absolute right-4 top-3.5 animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" />}
                                        
                                        {showCityDropdown && cities.length > 0 && (
                                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                                {cities.map((city, idx) => (
                                                    <button key={idx} type="button" onClick={() => handleCitySelect(city)} className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                                                        {city.Present}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button type="button" onClick={() => setFormData(p => ({ ...p, deliveryType: 'branch' }))} className={`p-4 border rounded-xl font-medium ${formData.deliveryType === 'branch' ? 'border-black bg-black text-white' : 'border-gray-200'}`}>У відділення</button>
                                        <button type="button" onClick={() => setFormData(p => ({ ...p, deliveryType: 'address' }))} className={`p-4 border rounded-xl font-medium ${formData.deliveryType === 'address' ? 'border-black bg-black text-white' : 'border-gray-200'}`}>Кур'єром</button>
                                    </div>

                                    {formData.deliveryType === 'branch' ? (
                                        <div className="relative">
                                            <select
                                                required
                                                name="branch"
                                                value={formData.branchRef}
                                                onChange={(e) => {
                                                    const selected = warehouses.find(w => w.Ref === e.target.value);
                                                    setFormData(p => ({ ...p, branchRef: e.target.value, branch: selected?.Description || '' }));
                                                }}
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3"
                                                disabled={!formData.cityRef || isSearchingWarehouses}
                                            >
                                                <option value="">Виберіть відділення...</option>
                                                {warehouses.map((w, idx) => (
                                                    <option key={idx} value={w.Ref}>{w.Description}</option>
                                                ))}
                                            </select>
                                            {isSearchingWarehouses && <div className="absolute right-8 top-3.5 animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" />}
                                        </div>
                                    ) : (
                                        <input required name="address" value={formData.address} onChange={handleInputChange} placeholder="Вулиця, буд, кв..." className="w-full border border-gray-200 rounded-xl px-4 py-3" />
                                    )}
                                </div>
                            </section>

                            {/* Step 3: Payment */}
                            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold uppercase mb-6 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white text-sm">3</span>
                                    Спосіб оплати
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className={`p-4 border rounded-xl cursor-pointer flex items-center gap-3 ${formData.paymentMethod === 'monobank' ? 'border-black ring-1 ring-black' : 'border-gray-200'}`}>
                                        <input type="radio" name="paymentMethod" value="monobank" checked={formData.paymentMethod === 'monobank'} onChange={handleInputChange} className="hidden" />
                                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold">M</div>
                                        <div>
                                            <p className="font-bold text-sm">Monobank</p>
                                            <p className="text-xs text-gray-500">Оплата карткою</p>
                                        </div>
                                    </label>
                                    <label className={`p-4 border rounded-xl cursor-pointer flex items-center gap-3 ${formData.paymentMethod === 'liqpay' ? 'border-black ring-1 ring-black' : 'border-gray-200'}`}>
                                        <input type="radio" name="paymentMethod" value="liqpay" checked={formData.paymentMethod === 'liqpay'} onChange={handleInputChange} className="hidden" />
                                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
                                        <div>
                                            <p className="font-bold text-sm">LiqPay</p>
                                            <p className="text-xs text-gray-500">Оплата карткою (Приват)</p>
                                        </div>
                                    </label>
                                    <label className={`p-4 border rounded-xl cursor-pointer flex items-center gap-3 ${formData.paymentMethod === 'bank_transfer' ? 'border-black ring-1 ring-black' : 'border-gray-200'}`}>
                                        <input type="radio" name="paymentMethod" value="bank_transfer" checked={formData.paymentMethod === 'bank_transfer'} onChange={handleInputChange} className="hidden" />
                                        <div>
                                            <p className="font-bold text-sm">Рахунок</p>
                                            <p className="text-xs text-gray-500">На реквізити</p>
                                        </div>
                                    </label>
                                    <label className={`p-4 border rounded-xl cursor-pointer flex items-center gap-3 ${formData.paymentMethod === 'cod' ? 'border-black ring-1 ring-black' : 'border-gray-200'}`}>
                                        <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleInputChange} className="hidden" />
                                        <div>
                                            <p className="font-bold text-sm">Післяплата</p>
                                            <p className="text-xs text-gray-500">При отриманні</p>
                                        </div>
                                    </label>
                                </div>
                            </section>

                            <button type="submit" disabled={isSubmitting} className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all disabled:bg-gray-400">
                                {isSubmitting ? 'Обробка...' : 'Підтвердити замовлення →'}
                            </button>
                        </form>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="w-full lg:w-2/5">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="text-lg font-bold uppercase mb-4 pb-4 border-b border-gray-100">Ваше замовлення</h2>

                            <div className="space-y-4 mb-6 max-h-[45vh] overflow-y-auto pr-2">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">📦</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{item.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{item.quantity} шт. × {item.price.toLocaleString('uk-UA')} ₴</p>
                                        </div>
                                        <div className="text-sm font-bold pt-1 shrink-0">
                                            {(item.price * item.quantity).toLocaleString('uk-UA')} ₴
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {formData.paymentMethod === 'cod' && (
                                <div className="space-y-2 mb-4 pb-4 border-b border-gray-100 italic">
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Сума товарів</span>
                                        <span>{total.toLocaleString('uk-UA')} ₴</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Комісія післяплати (20 ₴ + 2%)</span>
                                        <span>{(20 + total * 0.02).toLocaleString('uk-UA')} ₴</span>
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 flex justify-between items-end">
                                <span className="text-sm font-medium uppercase tracking-wider text-gray-500">
                                    {formData.paymentMethod === 'cod' ? 'Разом до сплати' : 'Разом'}
                                </span>
                                <span className="text-2xl font-black">
                                    {(formData.paymentMethod === 'cod' ? total + 20 + total * 0.02 : total).toLocaleString('uk-UA')} ₴
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
