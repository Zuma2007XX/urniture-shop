
'use client';

import Image from 'next/image';

export default function LogoTestPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-12">Варіанти логотипу</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Variant 1 */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <div className="relative w-64 h-64 mb-6 border border-gray-100 rounded-lg overflow-hidden">
                            <Image src="/logos/variant-1.png" alt="Variant 1" fill className="object-contain" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Варіант 1: Мінімалізм</h2>
                        <p className="text-gray-500 text-center text-sm">Чіткий шрифт, високий контраст.</p>
                        <div className="mt-4 px-4 py-2 bg-black text-white rounded text-sm">logo-variant-1.png</div>
                    </div>

                    {/* Variant 2 */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <div className="relative w-64 h-64 mb-6 border border-gray-100 rounded-lg overflow-hidden">
                            <Image src="/logos/variant-2.png" alt="Variant 2" fill className="object-contain" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Варіант 2: Архітектурний</h2>
                        <p className="text-gray-500 text-center text-sm">Лінії нагадують конструкцію меблів.</p>
                        <div className="mt-4 px-4 py-2 bg-black text-white rounded text-sm">logo-variant-2.png</div>
                    </div>

                    {/* Variant 3 */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <div className="relative w-64 h-64 mb-6 border border-gray-100 rounded-lg overflow-hidden">
                            <Image src="/logos/variant-3.png" alt="Variant 3" fill className="object-contain" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Варіант 3: Абстракція</h2>
                        <p className="text-gray-500 text-center text-sm">Геометричні форми, стиль Баухауз.</p>
                        <div className="mt-4 px-4 py-2 bg-black text-white rounded text-sm">logo-variant-3.png</div>
                    </div>

                    {/* Variant 4 */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <div className="relative w-64 h-64 mb-6 border border-gray-100 rounded-lg overflow-hidden">
                            <Image src="/logos/variant-4.png" alt="Variant 4" fill className="object-contain" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Варіант 4: Преміум</h2>
                        <p className="text-gray-500 text-center text-sm">Елегантний шрифт із засічками.</p>
                        <div className="mt-4 px-4 py-2 bg-black text-white rounded text-sm">logo-variant-4.png</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
