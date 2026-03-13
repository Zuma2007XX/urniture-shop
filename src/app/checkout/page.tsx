'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

// ─── Manager Contact Links ─────────────────────────────────────────────────
// Update these with the real manager contact URLs:
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
        deliveryType: 'branch', // 'branch' or 'address'
        branch: '',
        address: '',
        paymentMethod: 'bank_transfer', // 'bank_transfer' or 'cod'
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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

                    <h1 className="text-3xl md:text-4xl font-black mb-3">Дякуємо за заявку!</h1>
                    <p className="text-gray-500 text-base mb-8">Ваша заявка успішно прийнята. Наш менеджер зв'яжеться з вами найближчим часом для підтвердження замовлення та уточнення деталей оплати.</p>

                    {/* Order number card */}
                    <div className="bg-black text-white rounded-2xl px-8 py-6 mb-8 shadow-2xl">
                        <p className="text-sm uppercase tracking-widest text-gray-400 mb-2">Номер вашої заявки</p>
                        <div className="flex items-center justify-center gap-4">
                            <p className="text-5xl font-black tracking-widest">#{orderNumber}</p>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(`#${orderNumber}`);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white active:scale-95"
                                title="Скопіювати номер"
                            >
                                {copied ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-green-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-3">Менеджер уточнить цей номер при дзвінку</p>
                    </div>

                    {/* Messenger buttons */}
                    <div className="space-y-3 mb-8">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Зв'яжіться з менеджером</p>

                        {/* Telegram */}
                        <a
                            href={MANAGER_TELEGRAM}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-[#2AABEE] hover:bg-[#229ED9] text-white rounded-2xl font-bold text-base transition-all duration-200 hover:scale-[1.02] shadow-md"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.203-.658-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
                            </svg>
                            Написати в Telegram
                        </a>

                        {/* Viber */}
                        <a
                            href={MANAGER_VIBER}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-[#7360F2] hover:bg-[#6351D9] text-white rounded-2xl font-bold text-base transition-all duration-200 hover:scale-[1.02] shadow-md"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path d="M11.398.002C8.638-.025 3.235.734 1.01 5.836c-1.09 2.495-1.047 5.74-.994 7.957.053 2.217.25 6.374 3.467 7.438v2.907S3.44 25.2 4.52 24.12c.675-.667 2.576-2.867 2.576-2.867 2.49.211 4.512-.048 4.77-.083 5.667-.713 8.524-3.626 8.924-8.067.467-5.218-.46-8.523-4.08-10.476A10.026 10.026 0 0 0 11.4.002h-.002zm.057 2.008c.875-.007 1.745.13 2.555.434 3.07 1.167 3.926 3.914 3.602 8.394-.284 3.763-2.54 6.132-7.348 6.735-.218.027-2.125.288-4.334.113l-3.56 3.934v-4.064l-.166-.054C-.268 16.347.218 9.906.78 7.535c.81-3.51 4.045-5.365 9.32-5.512a15.12 15.12 0 0 1 1.355-.013zm-.62 2.506c-.255.003-.47.012-.64.025l-.173.012-.037.007c-2.41.256-4.35 1.377-4.66 4.183-.176 1.6 0 3.112.504 3.868a7.74 7.74 0 0 0 .28.395l.074.095.024.032.01.013c.04.048.08.095.12.143.28.323.614.592.97.8.085.05.17.098.257.14l.01.005.012.006c.358.16.777.28 1.244.354a6.42 6.42 0 0 0 1.895.003l.087-.013.056-.01.028-.005c.53-.11.962-.29 1.286-.527a2.06 2.06 0 0 0 .61-.73c.09-.207.13-.443.115-.68a1.68 1.68 0 0 0-.5-1.062l-.008-.007c-.38-.37-.833-.632-1.303-.766a.776.776 0 0 0-.6.063.825.825 0 0 0-.37.534l-.027.172a.49.49 0 0 1-.318.404c-.26.085-.54.046-.762-.1-.35-.228-.652-.5-.897-.8-.244-.3-.423-.64-.527-1.007-.065-.238-.058-.49.023-.72l.025-.066a.842.842 0 0 0-.42-.896c-.15-.073-.32-.11-.495-.104a2.42 2.42 0 0 0-1.186.464l-.015.012a2.5 2.5 0 0 0-.89 1.776c-.033.606.154 1.23.534 1.823a7.04 7.04 0 0 0 1.313 1.534c.55.484 1.162.875 1.82 1.16.658.285 1.36.46 2.07.51h.008a6.84 6.84 0 0 0 2.35-.332c.73-.25 1.374-.655 1.873-1.18.5-.526.84-1.164.98-1.85a5.33 5.33 0 0 0-.06-2.14c-.3-1.24-1.03-2.33-2.032-3.094a6.12 6.12 0 0 0-1.908-.937 5.7 5.7 0 0 0-1.08-.203 6.2 6.2 0 0 0-.52-.02z" />
                            </svg>
                            Написати у Viber
                        </a>

                        {/* Instagram */}
                        <a
                            href={MANAGER_INSTAGRAM}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white rounded-2xl font-bold text-base transition-all duration-200 hover:scale-[1.02] shadow-md"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                            </svg>
                            Написати в Instagram
                        </a>
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
            <div className="max-w-[900px] mx-auto px-6 lg:px-10">
                <h1 className="text-3xl md:text-4xl font-black uppercase mb-3">
                    Оформлення заявки
                </h1>
                <p className="text-gray-500 text-sm mb-10">
                    Залиште свої контактні дані та менеджер зв'яжеться з вами для уточнення деталей доставки та оплати.
                </p>

                <div className="flex flex-col lg:flex-row gap-10 items-start">

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
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Ім'я *</label>
                                        <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/10 transition"
                                            placeholder="Іван" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Прізвище *</label>
                                        <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/10 transition"
                                            placeholder="Франко" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Телефон *</label>
                                        <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/10 transition"
                                            placeholder="+38 (000) 000-00-00" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/10 transition"
                                            placeholder="email@example.com" />
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
                                    <strong>ℹ️ Як це працює?</strong> Будь ласка, вкажіть ваш актуальний номер телефону. Наш менеджер зателефонує вам для підтвердження замовлення, а також надішле реквізити для оплати у Viber на цей номер.
                                </div>
                            </section>

                            {/* Step 2: Delivery */}
                            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold uppercase mb-6 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white text-sm">2</span>
                                    Доставка (Нова Пошта)
                                </h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Місто, село, смт *</label>
                                        <input required type="text" name="city" value={formData.city} onChange={handleInputChange}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/10 transition"
                                            placeholder="Київ" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-4">Спосіб доставки *</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${formData.deliveryType === 'branch' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                                <input type="radio" name="deliveryType" value="branch" checked={formData.deliveryType === 'branch'} onChange={handleInputChange} className="hidden" />
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${formData.deliveryType === 'branch' ? 'border-black' : 'border-gray-300'}`}>
                                                    {formData.deliveryType === 'branch' && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                                                </div>
                                                <span className="text-sm font-medium">У відділення</span>
                                            </label>
                                            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${formData.deliveryType === 'address' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                                <input type="radio" name="deliveryType" value="address" checked={formData.deliveryType === 'address'} onChange={handleInputChange} className="hidden" />
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${formData.deliveryType === 'address' ? 'border-black' : 'border-gray-300'}`}>
                                                    {formData.deliveryType === 'address' && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                                                </div>
                                                <span className="text-sm font-medium">Кур'єром на адресу</span>
                                            </label>
                                        </div>
                                    </div>

                                    {formData.deliveryType === 'branch' ? (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Номер відділення *</label>
                                            <input required={formData.deliveryType === 'branch'} type="text" name="branch" value={formData.branch} onChange={handleInputChange}
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/10 transition"
                                                placeholder="№1" />
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Повна адреса (вулиця, будинок, кв) *</label>
                                            <input required={formData.deliveryType === 'address'} type="text" name="address" value={formData.address} onChange={handleInputChange}
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/10 transition"
                                                placeholder="вул. Хрещатик, 1" />
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Step 3: Payment */}
                            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold uppercase mb-6 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white text-sm">3</span>
                                    Спосіб оплати
                                </h3>

                                <div className="space-y-4">
                                    <label className={`flex items-start p-4 border rounded-xl cursor-pointer transition ${formData.paymentMethod === 'bank_transfer' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="paymentMethod" value="bank_transfer" checked={formData.paymentMethod === 'bank_transfer'} onChange={handleInputChange} className="hidden" />
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 ${formData.paymentMethod === 'bank_transfer' ? 'border-black' : 'border-gray-300'}`}>
                                            {formData.paymentMethod === 'bank_transfer' && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold">Оплатити на розрахунковий рахунок</p>
                                            <p className="text-xs text-gray-500 mt-1">Реквізити будуть надіслані вам у Viber або SMS після підтвердження замовлення.</p>
                                        </div>
                                    </label>

                                    <label className={`flex items-start p-4 border rounded-xl cursor-pointer transition ${formData.paymentMethod === 'cod' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleInputChange} className="hidden" />
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 ${formData.paymentMethod === 'cod' ? 'border-black' : 'border-gray-300'}`}>
                                            {formData.paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold">Оплата при отриманні (післяплата)</p>
                                            <p className="text-xs text-gray-500 mt-1">Комісія за переказ коштів складає 20 грн + 2% від суми замовлення.</p>
                                        </div>
                                    </label>
                                </div>
                            </section>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full bg-black text-white px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-gray-800 active:scale-[0.99]'}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Обробка...
                                    </>
                                ) : (
                                    'Підтвердити заявку →'
                                )}
                            </button>
                            <p className="text-[10px] text-gray-400 text-center">
                                Натискаючи кнопку, ви погоджуєтеся з умовами обробки персональних даних.
                            </p>

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
