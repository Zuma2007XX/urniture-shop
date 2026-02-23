import CollectionProducts from '@/components/collections/CollectionProducts';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';

// ... existing imports

export default async function CollectionPage({
    params
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const normalizedSlug = slug.toLowerCase();

    // 1. Get Collection ID
    const collectionMetadata = await prisma.collection.findUnique({
        where: { slug: normalizedSlug },
        select: { id: true, title: true, description: true, image: true }
    });

    if (!collectionMetadata) {
        notFound();
    }

    // 2. Get ALL products for this collection (no pagination here)
    const products = await prisma.product.findMany({
        where: {
            collectionId: collectionMetadata.id,
            stock: { gt: -1 }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Serialize products for Client Component (convert Dates to strings)
    const serializedProducts = products.map(p => ({
        ...p,
        price: Number(p.price), // Ensure price is number if it's Decimal
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        // Ensure other potential non-serializable fields are handled if necessary
        // Prismo Decimal is usually string or number? In standardized schema it might be Decimal.
        // If price is Int/Float in schema it's fine. If Decimal, needs conversion.
        // CatalogProductCard expects number.
    }));


    return (
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12">
            {/* Header */}
            <div className="mb-16">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-black">Головна</Link>
                    <span>/</span>
                    <Link href="/collections" className="hover:text-black">Колекції</Link>
                    <span>/</span>
                    <span className="text-black">{collectionMetadata.title}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                            {collectionMetadata.title}
                        </h1>
                        {collectionMetadata.description && (
                            <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
                                {collectionMetadata.description}
                            </p>
                        )}
                    </div>
                    {collectionMetadata.image && (
                        <div className="relative aspect-[2/1] md:aspect-[3/2] rounded-lg overflow-hidden bg-gray-100">
                            <Image
                                src={collectionMetadata.image}
                                alt={collectionMetadata.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Products Grid with Filters */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-8">Товари колекції</h2>

                {serializedProducts.length === 0 ? (
                    <p className="text-gray-500">У цій колекції поки немає товарів.</p>
                ) : (
                    <CollectionProducts products={serializedProducts as any[]} />
                )}
            </div>
        </div>
    );
}
