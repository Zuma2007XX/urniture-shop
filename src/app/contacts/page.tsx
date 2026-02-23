import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import ContactsClient from './ContactsClient';

export const dynamic = 'force-dynamic';

export default async function ContactsPage() {
    const siteContent = await prisma.siteContent.findMany();
    const getContent = (section: string) => siteContent.find(c => c.section === section);

    const phone = getContent('contact_phone');
    const email = getContent('contact_email');
    const address = getContent('contact_address');
    const hours = getContent('contact_hours');
    const departments = getContent('contact_departments');
    const social = getContent('contact_social');

    const contactData = {
        phone: phone?.title || '+38 (050) 123-45-67',
        phoneHours: phone?.subtitle || 'Пн-Пт: 9:00–18:00',
        email: email?.title || 'info@seriousmebel.ua',
        emailNote: email?.subtitle || 'Відповідаємо протягом 24 годин',
        city: address?.title || 'м. Запоріжжя',
        street: address?.subtitle || 'вул. Промислова, 42',
        hoursBody: hours?.body || 'Пн-Пт: 9:00–18:00|Субота: 10:00–15:00|Неділя: Вихідний',
        departmentsBody: departments?.body || 'Відділ продажів|+38 (050) 123-45-67||Сервіс та гарантія|+38 (050) 765-43-21||Оптові замовлення|opt@seriousmebel.ua',
        instagramUrl: social?.linkText || 'https://instagram.com',
        facebookUrl: social?.linkUrl || 'https://facebook.com',
        telegramUrl: social?.body || 'https://t.me',
    };

    return <ContactsClient data={contactData} />;
}
