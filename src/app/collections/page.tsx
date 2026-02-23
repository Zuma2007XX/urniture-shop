import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function CollectionsPage() {
    const collections = await prisma.collection.findMany({
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { products: true } } }
    });

    return (
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20">
            <header className="mb-24 text-center">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase">Колекції</h1>
                <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
                    Архітектура вашого комфорту. Серії, що визначають простір.
                </p>
            </header>

            {collections.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Колекцій поки немає</p>
                </div>
            ) : (
                <div className="flex flex-col gap-32">
                    {collections.map((collection, index) => {
                        const isEven = index % 2 === 0;
                        return (
                            <div key={collection.id} className={`flex flex-col lg:flex-row gap-12 lg:gap-24 items-center ${!isEven ? 'lg:flex-row-reverse' : ''}`}>

                                {/* Image Section (approx 40-45%) */}
                                <div className="w-full lg:w-5/12 group perspective">
                                    <Link href={`/collections/${collection.slug}`} className="block relative aspect-[3/2] overflow-hidden rounded-3xl transform transition-all duration-700 hover:-rotate-1 hover:scale-[1.02]">
                                        {collection.image ? (
                                            <Image
                                                src={collection.image}
                                                alt={collection.title}
                                                fill
                                                className="object-contain transition-transform duration-1000 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                                                No Image
                                            </div>
                                        )}
                                        {/* Overlay gradient */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                                    </Link>
                                </div>

                                {/* Content Section */}
                                <div className="w-full lg:w-7/12 flex flex-col items-start lg:pr-12">
                                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 block">
                                        Колекція №{index + 1}
                                    </span>
                                    <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-[0.9] tracking-tight hover:text-gray-600 transition-colors">
                                        <Link href={`/collections/${collection.slug}`}>
                                            {collection.title}
                                        </Link>
                                    </h2>

                                    {collection.description && (
                                        <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-lg border-l-2 border-gray-100 pl-6">
                                            {collection.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-8">
                                        <Link
                                            href={`/collections/${collection.slug}`}
                                            className="group flex items-center gap-3 text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-2 hover:text-gray-600 hover:border-gray-300 transition-all"
                                        >
                                            Дивитися колекцію
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-1">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                            </svg>
                                        </Link>

                                        <span className="text-xs text-gray-400 font-medium">
                                            {collection._count.products} виробів
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
