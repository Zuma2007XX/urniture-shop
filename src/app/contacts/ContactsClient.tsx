'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface ContactData {
    phone: string;
    phoneHours: string;
    email: string;
    emailNote: string;
    city: string;
    street: string;
    hoursBody: string;
    departmentsBody: string;
    instagramUrl: string;
    facebookUrl: string;
    telegramUrl: string;
}

export default function ContactsClient({ data }: { data: ContactData }) {
    const [hoveredPin, setHoveredPin] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [formSent, setFormSent] = useState(false);
    const [formError, setFormError] = useState('');
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setFormError('');
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Помилка');
            }
            setFormSent(true);
            setTimeout(() => setFormSent(false), 5000);
            setFormData({ name: '', email: '', message: '' });
        } catch (err: unknown) {
            setFormError(err instanceof Error ? err.message : 'Помилка при відправці');
        } finally {
            setSending(false);
        }
    };

    // Parse hours: "Пн-Пт: 9:00–18:00|Субота: 10:00–15:00|Неділя: Вихідний"
    const hoursLines = data.hoursBody.split('|').map(line => {
        const parts = line.split(': ');
        return { day: parts[0], time: parts.slice(1).join(': ') };
    });

    // Parse departments: "Відділ продажів|+38..||Сервіс|+38..||Оптові|email"
    const departmentBlocks = data.departmentsBody.split('||').map(block => {
        const parts = block.split('|');
        return { name: parts[0], contact: parts[1] || '' };
    });

    // Geographically accurate Ukraine SVG path (from GeoJSON world dataset, Douglas-Peucker simplified)
    const ukrainePath = "M421.1,50L425,50L427.1,53.9L440.3,51.1L446.9,37.4L468.1,42.2L479.3,35.2L491.5,35.7L492.7,39.6L504.8,35.9L515.5,46.7L516.8,58.2L529.8,67.9L528.3,71.7L516.5,74.1L522,82.5L520.4,89.2L525.5,92.5L520.4,97.3L537.8,98.1L543.5,102L557.1,99.6L559.7,107.9L568.4,109.7L565.5,114.2L573.1,129.5L569.3,132.1L578.9,147.1L588.2,143.2L599.2,143.3L605.9,151L611.7,149.7L619.3,155.3L629.7,148.7L652.9,142.7L660.5,150.5L660.1,155.3L665.7,162.3L673.5,166.5L676.9,172.2L683.7,170L684.1,163.3L689.2,163.3L691.5,167.7L704.2,168.6L715.4,177.6L724.3,173.7L728.7,180.9L740.8,182L743.5,188.1L750.8,192.1L763.7,189.4L760.4,195.2L765.5,203.7L764.8,208.6L755.2,219.9L745.9,221.1L749.1,228L761.2,229.5L758,233.9L749.9,232.9L743.9,245.2L752.2,245.9L755.9,256.9L751.4,260.7L758.7,262.6L752.5,275.8L749.1,276.9L749.1,287.1L711,286.2L707.1,295.7L690,300.5L684.7,315.7L689.2,319.1L682.8,331.2L679.9,327.8L658.3,328.8L649.6,339.9L645.2,336.8L629.9,344.4L626.4,353.5L627.8,348.6L623.4,345.6L611.3,348.7L606.3,355.1L602.6,351.7L590.8,352.6L569.4,368.4L560.5,381.8L553.1,384.6L562.1,378.7L567.9,370.2L564.8,369.4L565.5,364.6L561.6,360.4L562.4,366.9L558.2,372.5L549.5,374.9L546.1,379.1L552.8,404.6L545.2,399.8L541.1,390.3L531.9,391.4L526.5,385L506.5,378L499.3,376.8L493,386.3L480.6,381.8L481.4,376.5L476.8,381.3L472.8,379.5L472.5,381.8L451.4,384.7L441.5,381.8L441.8,377.5L426.1,371.1L422.6,373.1L422.6,369.9L433,366.3L420.5,361.1L417.9,365L410.6,356.2L445.6,363L457.3,352.8L444.5,357.7L441,355.1L436.8,357.8L431.7,353.9L428.3,346.7L429.8,332.8L425.2,331.9L426.5,328.2L420.2,318.9L425.6,328.1L424.1,332.9L428.6,333.4L426.6,336.5L429.5,336.8L425.2,344.1L426.3,353.1L410,354L415.1,343.7L410.6,347.5L407.8,344.4L410.5,348.9L406.8,353.9L381.6,357.8L380.4,366.9L375.5,369.7L376.7,372.2L369,384.4L354.4,398.9L353.9,394.9L352.6,399.2L348.3,397.4L346.8,401.6L345.7,399.2L345.9,404.2L344.1,401.9L340.6,403.5L343,407.3L337.8,410.3L333.9,398.5L331.9,413.4L336.7,412.6L332.5,417.9L338.7,419.6L336.8,432L334.7,432.5L335.1,427.1L331.1,422.5L320.9,419.8L305.8,428.6L299.1,426.6L299.6,430.9L295.8,431.8L280.2,426.5L274.9,418.4L277.8,415.5L287.3,416.2L286.1,407.9L297,397.9L297,391.5L305.9,388.8L308.3,378.7L305,374.5L305.5,363.6L315.3,359L315.9,369L320.3,362.7L323.1,365.8L326.4,362L332.9,368.8L337,362.7L341.7,370L354.1,365.4L344.7,359.4L345.8,343.9L330.6,336.3L332.4,329.9L327.3,327.3L330,325.8L330.5,315.3L324.5,317.8L314.1,308.3L312.5,303.7L317.4,285L312.8,279.1L305.7,281.4L299.5,271.6L290.2,269.2L286.3,274.2L283.6,268.3L279.7,270.3L281.3,264.5L270.5,264.6L269.8,260.3L249.6,250.8L234.2,257.7L218.7,256L216.4,261.8L212.5,259.4L210,263.4L197.1,266L191.7,278.2L154.3,283.4L146.9,292.1L139.3,293.9L124.8,280.9L111.2,283.5L93.5,278.5L80.4,279.4L67.2,272.3L64.1,277.4L58.4,277.5L56.5,280.7L53.4,272.7L45.4,272.4L40.3,264.3L35.2,264.3L31.7,255.4L26,255.3L26.2,246.1L33.2,239.9L42.7,218.2L56.1,221.7L55.5,217.5L48.5,213.3L50.8,206.9L47.8,190.7L89.5,146.2L101.8,144.2L107,136.6L105.9,127.1L100.8,121.8L108.4,119.1L101.7,114.6L97,102.9L87.6,94.2L90.2,88.6L86.8,76.4L101.8,78.6L112.6,71.2L118.6,62.2L151.1,58.3L175.1,59.5L219.7,69.5L231.8,69.1L236.6,78.5L254.1,78.4L254.9,85.3L259.7,77.1L269.6,80.1L275.3,74.9L280.4,81.8L291.4,80.4L296.6,88.8L299.5,81.5L311.1,76L320.8,90.8L333.9,83.8L341.7,87.2L354.8,84.2L361.9,88.8L363.3,94.2L371.3,98L375.2,90.4L369.9,77.6L379.1,61.2L387.3,55.9L386.4,52.3L399.1,53.4L405.5,49L421.1,50Z M428.3,377.5L437.6,380.6L413.6,374.3L410.4,368.1L415.1,374.5L428.3,377.5Z";

    // Accurate city positions on the map (viewBox 0 0 800 500)
    const cities = [
        { name: 'Київ', x: 370.1, y: 141.7 },
        { name: 'Львів', x: 103.8, y: 175.6 },
        { name: 'Харків', x: 604.3, y: 167.2 },
        { name: 'Одеса', x: 378.7, y: 362.2 },
        { name: 'Дніпро', x: 555.9, y: 251.7 },
    ];

    // Zaporizhzhia position
    const zapX = 559.6;
    const zapY = 286.7;

    return (
        <div className="bg-white text-black font-sans">

            {/* Hero */}
            <section className="pt-24 pb-16 px-6 lg:px-10 max-w-[1400px] mx-auto text-center">
                <div className="mb-4 inline-block border border-black px-3 py-1 text-[10px] uppercase tracking-widest">
                    Зв&apos;яжіться з нами
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-none mb-8">
                    Контакти
                </h1>
                <p className="max-w-2xl mx-auto text-gray-500 text-sm md:text-base leading-relaxed">
                    Ми завжди раді почути від вас. Наш офіс та виробництво знаходяться у Запоріжжі — серці українського промислового регіону.
                </p>
            </section>

            {/* Contact Cards */}
            <section className="max-w-[1400px] mx-auto px-6 lg:px-10 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Phone */}
                    <div className="group border border-gray-100 rounded-2xl p-8 hover:border-black transition-all duration-500 hover:shadow-xl">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 group-hover:bg-black transition-colors duration-500 flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                            </svg>
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Телефон</h3>
                        <a href={`tel:${data.phone.replace(/[\s()-]/g, '')}`} className="text-lg font-medium hover:text-gray-500 transition-colors">
                            {data.phone}
                        </a>
                        <p className="text-xs text-gray-400 mt-2">{data.phoneHours}</p>
                    </div>

                    {/* Email */}
                    <div className="group border border-gray-100 rounded-2xl p-8 hover:border-black transition-all duration-500 hover:shadow-xl">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 group-hover:bg-black transition-colors duration-500 flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                            </svg>
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Email</h3>
                        <a href={`mailto:${data.email}`} className="text-lg font-medium hover:text-gray-500 transition-colors">
                            {data.email}
                        </a>
                        <p className="text-xs text-gray-400 mt-2">{data.emailNote}</p>
                    </div>

                    {/* Address */}
                    <div className="group border border-gray-100 rounded-2xl p-8 hover:border-black transition-all duration-500 hover:shadow-xl">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 group-hover:bg-black transition-colors duration-500 flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Адреса</h3>
                        <p className="text-lg font-medium">{data.city}</p>
                        <p className="text-xs text-gray-400 mt-2">{data.street}</p>
                    </div>
                </div>
            </section>

            {/* Interactive Ukraine Map */}
            <section className="bg-[#fafafa] py-24">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                    <div className="text-center mb-16">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4">Наше розташування</p>
                        <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight">
                            Серце українського<br />виробництва
                        </h2>
                    </div>

                    <div className="relative max-w-4xl mx-auto">
                        <svg
                            viewBox="-10 0 830 500"
                            className="w-full h-auto"
                            style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.08))' }}
                        >
                            <defs>
                                <linearGradient id="ukraineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#f0f0f3" />
                                    <stop offset="100%" stopColor="#dddde2" />
                                </linearGradient>
                                <filter id="shadow3d" x="-5%" y="-5%" width="110%" height="120%">
                                    <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#000" floodOpacity="0.12" />
                                </filter>
                            </defs>

                            {/* Ukraine shape */}
                            <g filter="url(#shadow3d)">
                                {/* 3D depth layer */}
                                <path
                                    d={ukrainePath}
                                    fill="#d4d4d8"
                                    stroke="none"
                                    transform="translate(0, 8)"
                                />
                                {/* Main surface */}
                                <path
                                    d={ukrainePath}
                                    fill="url(#ukraineGrad)"
                                    stroke="#c0c0c8"
                                    strokeWidth="1.2"
                                />
                            </g>

                            {/* City dots */}
                            {cities.map(city => (
                                <g key={city.name}>
                                    <circle cx={city.x} cy={city.y} r="4" fill="#b0b0b8" />
                                    <text
                                        x={city.x + 10}
                                        y={city.y + 4}
                                        style={{ fontSize: '13px', fill: '#999', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}
                                    >
                                        {city.name}
                                    </text>
                                </g>
                            ))}

                            {/* Zaporizhzhia Pin */}
                            <g
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredPin(true)}
                                onMouseLeave={() => setHoveredPin(false)}
                            >
                                {/* Pulse */}
                                <circle cx={zapX} cy={zapY} r="8" fill="none" stroke="black" strokeWidth="1" opacity="0.2">
                                    <animate attributeName="r" values="8;28;8" dur="3s" repeatCount="indefinite" />
                                    <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
                                </circle>
                                <circle cx={zapX} cy={zapY} r="6" fill="none" stroke="black" strokeWidth="1" opacity="0.3">
                                    <animate attributeName="r" values="6;20;6" dur="3s" repeatCount="indefinite" begin="0.5s" />
                                    <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" begin="0.5s" />
                                </circle>

                                {/* Pin */}
                                <circle cx={zapX} cy={zapY} r="8" fill="black" className="transition-all duration-300" style={{ transform: hoveredPin ? 'scale(1.3)' : 'scale(1)', transformOrigin: `${zapX}px ${zapY}px` }} />
                                <circle cx={zapX} cy={zapY} r="4" fill="white" />

                                {/* Label */}
                                <g className="transition-all duration-500" style={{ opacity: hoveredPin ? 1 : 0.9, transform: hoveredPin ? 'translateY(-6px)' : 'translateY(0)' }}>
                                    <rect x={zapX - 60} y={zapY + 16} width="120" height="42" rx="6" fill="black" />
                                    <polygon points={`${zapX - 6},${zapY + 16} ${zapX + 6},${zapY + 16} ${zapX},${zapY + 10}`} fill="black" />
                                    <text x={zapX} y={zapY + 36} textAnchor="middle" fill="white" style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '1px' }}>ЗАПОРІЖЖЯ</text>
                                    <text x={zapX} y={zapY + 50} textAnchor="middle" fill="#888" style={{ fontSize: '9px' }}>Головний офіс</text>
                                </g>
                            </g>
                        </svg>

                        {/* Floating badge */}
                        <div className="absolute top-4 right-4 md:top-8 md:right-8 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-black rounded-full animate-pulse" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Виробництво</p>
                                    <p className="text-sm font-bold">{data.city.replace('м. ', '')}, Україна</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Form + Details */}
            <section className="py-24 max-w-[1400px] mx-auto px-6 lg:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

                    {/* Contact Form */}
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4">Зворотній зв&apos;язок</p>
                        <h2 className="text-3xl font-bold uppercase tracking-tight mb-8">
                            Напишіть нам
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Ім&apos;я</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border-b-2 border-gray-200 focus:border-black py-3 text-sm outline-none transition-colors bg-transparent"
                                    placeholder="Ваше ім'я"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full border-b-2 border-gray-200 focus:border-black py-3 text-sm outline-none transition-colors bg-transparent"
                                    placeholder="your@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">Повідомлення</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full border-b-2 border-gray-200 focus:border-black py-3 text-sm outline-none transition-colors resize-none bg-transparent"
                                    placeholder="Опишіть ваше питання..."
                                />
                            </div>
                            {formError && (
                                <p className="text-red-500 text-sm">{formError}</p>
                            )}
                            <button
                                type="submit"
                                disabled={sending}
                                className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-500 ${formSent
                                    ? 'bg-green-600 text-white'
                                    : sending
                                        ? 'bg-gray-400 text-white cursor-wait'
                                        : 'bg-black text-white hover:bg-gray-800'
                                    }`}
                            >
                                {formSent ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                        Надіслано!
                                    </>
                                ) : sending ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Надсилаю...
                                    </>
                                ) : (
                                    <>
                                        Надіслати
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Details */}
                    <div className="space-y-12">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4">Деталі</p>
                            <h2 className="text-3xl font-bold uppercase tracking-tight mb-8">
                                Інформація
                            </h2>
                        </div>

                        {/* Working hours */}
                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Графік роботи</h3>
                            <div className="space-y-3 text-sm">
                                {hoursLines.map((line, i) => (
                                    <div key={i} className="flex justify-between">
                                        <span className="text-gray-500">{line.day}</span>
                                        <span className={`font-medium ${line.time.includes('Вихідний') ? 'text-red-500' : ''}`}>{line.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Departments */}
                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Відділи</h3>
                            <div className="space-y-4 text-sm">
                                {departmentBlocks.map((dept, i) => (
                                    <div key={i}>
                                        <p className="font-medium">{dept.name}</p>
                                        <p className="text-gray-500">{dept.contact}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Social media */}
                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Соціальні мережі</h3>
                            <div className="flex gap-4">
                                {/* Instagram */}
                                <a href={data.instagramUrl} target="_blank" rel="noopener noreferrer"
                                    className="group/social w-12 h-12 rounded-xl bg-gray-50 hover:bg-black flex items-center justify-center transition-all duration-500 hover:shadow-lg hover:scale-110">
                                    <svg className="w-5 h-5 text-gray-400 group-hover/social:text-white transition-colors duration-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                    </svg>
                                </a>

                                {/* Facebook */}
                                <a href={data.facebookUrl} target="_blank" rel="noopener noreferrer"
                                    className="group/social w-12 h-12 rounded-xl bg-gray-50 hover:bg-black flex items-center justify-center transition-all duration-500 hover:shadow-lg hover:scale-110">
                                    <svg className="w-5 h-5 text-gray-400 group-hover/social:text-white transition-colors duration-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </a>

                                {/* Telegram */}
                                <a href={data.telegramUrl} target="_blank" rel="noopener noreferrer"
                                    className="group/social w-12 h-12 rounded-xl bg-gray-50 hover:bg-black flex items-center justify-center transition-all duration-500 hover:shadow-lg hover:scale-110">
                                    <svg className="w-5 h-5 text-gray-400 group-hover/social:text-white transition-colors duration-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <section className="bg-black text-white py-20">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10 text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-6">Завжди на зв&apos;язку</p>
                    <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-8">
                        Питання? Ми тут.
                    </h2>
                    <p className="text-gray-400 max-w-xl mx-auto mb-10 text-sm leading-relaxed">
                        Наша команда завжди готова допомогти вам з вибором меблів, консультацією щодо матеріалів та умов доставки.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href={`tel:${data.phone.replace(/[\s()-]/g, '')}`}
                            className="inline-flex items-center gap-2 bg-white text-black text-sm font-bold uppercase tracking-widest px-8 py-4 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                            </svg>
                            Зателефонувати
                        </a>
                        <Link
                            href="/catalog"
                            className="inline-flex items-center gap-2 border border-gray-700 text-white text-sm font-bold uppercase tracking-widest px-8 py-4 rounded-full hover:border-white transition-colors"
                        >
                            Перейти до каталогу
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
