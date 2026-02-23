'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function CheckoutPage() {
    const { t, language } = useLanguage();
    const { items, total, clearCart } = useCart();
    const router = useRouter();
    const { data: session } = useSession(); // Get user session if logged in

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        deliveryMethod: 'nova_poshta_branch',
        city: '',
        branch: '',
        address: '',
        paymentMethod: 'cash_on_delivery',
        comments: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    items,
                    total,
                    userId: session?.user?.id || undefined // Send userId if logged in
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Помилка при оформленні замовлення');
            }

            alert('Замовлення успішно оформлено!');
            clearCart();
            router.push('/');
        } catch (error: any) {
            console.error('Checkout error:', error);
            alert(error.message || 'Виникла помилка. Спробуйте ще раз.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
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

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-32">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                <h1 className="text-3xl md:text-4xl font-black uppercase mb-12">
                    Оформлення замовлення
                </h1>

                <div className="flex flex-col lg:flex-row gap-12 items-start">

                    {/* Left Column: Form */}
                    <div className="w-full lg:w-2/3">
                        <form onSubmit={handleSubmit} className="space-y-12">

                            {/* Contact Info */}
                            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold uppercase mb-6 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm">1</span>
                                    Контактні дані
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Ім'я *</label>
                                        <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/5" placeholder="Іван" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Прізвище *</label>
                                        <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/5" placeholder="Франко" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Телефон *</label>
                                        <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/5" placeholder="+38 (000) 000-00-00" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/5" placeholder="email@example.com" />
                                    </div>
                                </div>
                            </section>

                            {/* Delivery Options */}
                            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold uppercase mb-6 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm">2</span>
                                    Доставка
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                    <label className={`cursor-pointer border rounded-xl p-4 flex flex-col gap-2 transition-all ${formData.deliveryMethod === 'nova_poshta_branch' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <div className="flex items-center gap-3">
                                            <input type="radio" name="deliveryMethod" value="nova_poshta_branch" checked={formData.deliveryMethod === 'nova_poshta_branch'} onChange={handleInputChange} className="w-4 h-4 text-black focus:ring-blackaccent-black" />
                                            <span className="font-bold text-sm">Нова Пошта (Відділення)</span>
                                        </div>
                                        <span className="text-xs text-gray-500 ml-7">Доставка на зручне відділення поштового оператора.</span>
                                    </label>

                                    <label className={`cursor-pointer border rounded-xl p-4 flex flex-col gap-2 transition-all ${formData.deliveryMethod === 'nova_poshta_courier' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <div className="flex items-center gap-3">
                                            <input type="radio" name="deliveryMethod" value="nova_poshta_courier" checked={formData.deliveryMethod === 'nova_poshta_courier'} onChange={handleInputChange} className="w-4 h-4 text-black focus:ring-blackaccent-black" />
                                            <span className="font-bold text-sm">Кур'єр Нової Пошти</span>
                                        </div>
                                        <span className="text-xs text-gray-500 ml-7">Адресна доставка кур'єром до дверей.</span>
                                    </label>

                                    <label className={`cursor-pointer border rounded-xl p-4 flex flex-col gap-2 transition-all ${formData.deliveryMethod === 'city_courier' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <div className="flex items-center gap-3">
                                            <input type="radio" name="deliveryMethod" value="city_courier" checked={formData.deliveryMethod === 'city_courier'} onChange={handleInputChange} className="w-4 h-4 text-black focus:ring-blackaccent-black" />
                                            <span className="font-bold text-sm">Кур'єр по місту</span>
                                        </div>
                                        <span className="text-xs text-gray-500 ml-7">Власна доставка магазину (Київ та передмістя).</span>
                                    </label>

                                    <label className={`cursor-pointer border rounded-xl p-4 flex flex-col gap-2 transition-all ${formData.deliveryMethod === 'pickup' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <div className="flex items-center gap-3">
                                            <input type="radio" name="deliveryMethod" value="pickup" checked={formData.deliveryMethod === 'pickup'} onChange={handleInputChange} className="w-4 h-4 text-black focus:ring-blackaccent-black" />
                                            <span className="font-bold text-sm">Самовивіз</span>
                                        </div>
                                        <span className="text-xs text-gray-500 ml-7">Безкоштовно з нашого салону або складу.</span>
                                    </label>
                                </div>

                                {/* Dynamic Fields for Delivery */}
                                {formData.deliveryMethod !== 'pickup' && (
                                    <div className="space-y-6 animate-in slide-in-from-top-4 fade-in duration-300">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Місто доставки *</label>
                                            <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/5" placeholder="Введіть ваше місто" />
                                        </div>

                                        {formData.deliveryMethod === 'nova_poshta_branch' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Номер відділення Нової Пошти *</label>
                                                <input required type="text" name="branch" value={formData.branch} onChange={handleInputChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/5" placeholder="Наприклад: Відділення №1 (до 30 кг)" />
                                            </div>
                                        )}

                                        {(formData.deliveryMethod === 'nova_poshta_courier' || formData.deliveryMethod === 'city_courier') && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Повна адреса (Вулиця, будинок, квартира) *</label>
                                                <input required type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/5" placeholder="вул. Хрещатик 1, кв 22" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </section>

                            {/* Payment Options */}
                            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold uppercase mb-6 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm">3</span>
                                    Оплата
                                </h2>

                                <div className="space-y-4">
                                    <label className={`cursor-pointer border rounded-xl p-5 flex items-start gap-4 transition-all ${formData.paymentMethod === 'cash_on_delivery' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="paymentMethod" value="cash_on_delivery" checked={formData.paymentMethod === 'cash_on_delivery'} onChange={handleInputChange} className="mt-1 w-4 h-4 text-black focus:ring-blackaccent-black" />
                                        <div>
                                            <span className="font-bold text-sm block mb-1">Оплата при отриманні (Накладений платіж)</span>
                                            <span className="text-xs text-gray-500 leading-relaxed block">Оплатіть замовлення безпосередньо при отриманні у відділенні пошти або кур'єру. Зверніть увагу, що перевізник стягує додаткову комісію за переказ коштів. (Зазвичай потрібна передоплата 10-20% для меблів).</span>
                                        </div>
                                    </label>

                                    <label className={`cursor-pointer border rounded-xl p-5 flex items-start gap-4 transition-all ${formData.paymentMethod === 'online_card' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="paymentMethod" value="online_card" checked={formData.paymentMethod === 'online_card'} onChange={handleInputChange} className="mt-1 w-4 h-4 text-black focus:ring-blackaccent-black" />
                                        <div>
                                            <span className="font-bold text-sm block mb-1">Онлайн оплата (Visa/Mastercard, Apple Pay)</span>
                                            <span className="text-xs text-gray-500 leading-relaxed block">Швидка та безпечна оплата карткою через платіжну систему на сайті. Без додаткових комісій.</span>
                                        </div>
                                    </label>

                                    <label className={`cursor-pointer border rounded-xl p-5 flex items-start gap-4 transition-all ${formData.paymentMethod === 'installments' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="paymentMethod" value="installments" checked={formData.paymentMethod === 'installments'} onChange={handleInputChange} className="mt-1 w-4 h-4 text-black focus:ring-blackaccent-black" />
                                        <div>
                                            <span className="font-bold text-sm block mb-1">Оплата частинами (ПриватБанк, Monobank)</span>
                                            <span className="text-xs text-gray-500 leading-relaxed block">Розбийте платежі на комфортні суми без переплат за програмами популярних українських банків.</span>
                                        </div>
                                    </label>

                                    <label className={`cursor-pointer border rounded-xl p-5 flex items-start gap-4 transition-all ${formData.paymentMethod === 'iban' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="paymentMethod" value="iban" checked={formData.paymentMethod === 'iban'} onChange={handleInputChange} className="mt-1 w-4 h-4 text-black focus:ring-blackaccent-black" />
                                        <div>
                                            <span className="font-bold text-sm block mb-1">Оплата за реквізитами (IBAN)</span>
                                            <span className="text-xs text-gray-500 leading-relaxed block">Переказ на розрахунковий рахунок ФОП або ТОВ. Метод доступний для фізичних та юридичних осіб з урахуванням ПДВ або без.</span>
                                        </div>
                                    </label>
                                </div>
                            </section>

                            <section>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Коментар до замовлення</label>
                                <textarea name="comments" value={formData.comments} onChange={handleInputChange} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/5 resize-none" placeholder="Додаткова інформація..."></textarea>
                            </section>

                        </form>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="text-lg font-bold uppercase mb-6 pb-4 border-b border-gray-100">Ваше замовлення</h2>

                            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">{item.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">{item.quantity} шт. × {item.price.toLocaleString('uk-UA')} ₴</p>
                                        </div>
                                        <div className="text-sm font-bold pt-1">
                                            {(item.price * item.quantity).toLocaleString('uk-UA')} ₴
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-6 border-t border-gray-100">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Вартість товарів</span>
                                    <span>{total.toLocaleString('uk-UA')} ₴</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Доставка</span>
                                    <span className="text-xs">{formData.deliveryMethod === 'pickup' ? 'Безкоштовно' : 'За тарифами перевізника'}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mt-6 pt-6 border-t border-gray-100">
                                <span className="text-sm font-medium uppercase tracking-wider text-gray-500">Разом</span>
                                <span className="text-2xl font-black">{total.toLocaleString('uk-UA')} ₴</span>
                            </div>

                            <button
                                type="submit"
                                onClick={(e) => {
                                    // Trigger form submission manually since the button is outside the <form> wrapping the inputs
                                    // Actually, let's wrap the button in an onClick that submits the form.
                                    // Better yet, just use a unified function since it's uncontrolled.
                                    e.preventDefault();
                                    const form = document.querySelector('form');
                                    if (form?.reportValidity()) {
                                        handleSubmit(e as unknown as React.FormEvent);
                                    }
                                }}
                                disabled={isSubmitting}
                                className={`w-full mt-8 bg-black text-white px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-gray-800 active:scale-[0.98]'}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Обробка...
                                    </>
                                ) : (
                                    'Підтвердити замовлення'
                                )}
                            </button>
                            <p className="text-[10px] text-gray-400 text-center mt-4">
                                Натискаючи кнопку, ви погоджуєтеся з умовами надання послуг та політикою конфіденційності.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
