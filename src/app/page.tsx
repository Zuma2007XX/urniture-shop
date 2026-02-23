import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import ProductCarousel from "@/components/ui/ProductCarousel";
import CollectionCarousel from "@/components/ui/CollectionCarousel";
import BenefitsSection from "@/components/layout/BenefitsSection";
import TranslatedText from "@/components/ui/TranslatedText";

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Get featured (bestseller) products first, fallback to latest 4
  let featuredProducts = await prisma.product.findMany({
    where: { featured: true },
    orderBy: { createdAt: 'desc' },
  });

  // Fallback: if no featured products, show latest 4
  if (featuredProducts.length === 0) {
    featuredProducts = await prisma.product.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get all unique series IDs
  const seriesIds = Array.from(new Set(featuredProducts.map(p => p.series).filter(Boolean))) as string[];

  // Fetch all variants for these series
  // We explicitly select fields to match ProductMinimal for efficiency, 
  // but Prisma returns objects that match the partial shape.
  const allVariants = seriesIds.length > 0 ? await prisma.product.findMany({
    where: {
      series: { in: seriesIds },
    },
    select: {
      id: true,
      name: true,
      images: true,
      series: true,
    }
  }) : [];

  // Map variants to products
  // We use 'any' cast here because we are augmenting the product object with 'variants' 
  // which is not in the original Prisma return type, and TS might complain.
  const productsWithVariants = featuredProducts.map(p => ({
    ...p,
    variants: p.series ? allVariants.filter(v => v.series === p.series && v.id !== p.id) : []
  }));

  const siteContent = await prisma.siteContent.findMany();
  const getContent = (section: string) => siteContent.find(c => c.section === section);

  const hero = getContent('hero');
  const featuredTitle = getContent('featured_title');
  const newArrivalsTitle = getContent('new_arrivals_title');
  const collectionsTitle = getContent('collections_title');
  const collections = await prisma.collection.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Fetch New Arrivals (isNew = true)
  const newArrivalsProductsRaw = await prisma.product.findMany({
    where: { isNew: true },
    orderBy: { createdAt: 'desc' },
  });

  const newArrivalsSeriesIds = Array.from(new Set(newArrivalsProductsRaw.map(p => p.series).filter(Boolean))) as string[];
  const newArrivalsVariants = newArrivalsSeriesIds.length > 0 ? await prisma.product.findMany({
    where: { series: { in: newArrivalsSeriesIds } },
    select: { id: true, name: true, images: true, series: true }
  }) : [];

  const newArrivalsProducts = newArrivalsProductsRaw.map(p => ({
    ...p,
    variants: p.series ? newArrivalsVariants.filter(v => v.series === p.series && v.id !== p.id) : []
  }));

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-10">

      {/* Hero Banner */}
      <section className="mt-8 mb-20">
        <div className="relative w-full aspect-[16/7] rounded-lg overflow-hidden bg-gray-800">
          {hero?.image && (
            <Image
              src={hero.image}
              alt="Modern Interior"
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 pb-32">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95] mb-5 tracking-tight whitespace-pre-line">
              <TranslatedText dictKey="home.hero.title" defaultText={hero?.title || 'СТВОРЮЄМО\nКОМФОРТ'} />
            </h1>

            {(hero?.subtitle || true) && (
              <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-lg font-light tracking-wide">
                <TranslatedText dictKey="home.hero.subtitle" defaultText={hero?.subtitle || undefined} />
              </p>
            )}

            <div>
              <Link
                href={hero?.linkUrl || '/catalog'}
                className="inline-flex items-center gap-2 bg-black text-white text-sm font-medium px-7 py-3.5 rounded-full hover:bg-gray-900 transition-colors"
              >
                <TranslatedText dictKey="home.hero.button" defaultText={hero?.linkText || 'Дивитись все'} />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mb-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight fire-hover inline-block cursor-default transition-all duration-300">
            <TranslatedText dictKey="home.featured.title" defaultText={featuredTitle?.title || 'Хіти продажу'} />
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            <TranslatedText dictKey="home.featured.subtitle" defaultText={featuredTitle?.subtitle || 'Найбільш затребувані моделі сезону'} />
          </p>
        </div>

        <div className="mt-8">
          <ProductCarousel products={productsWithVariants} />
        </div>
      </section>

      {/* New Arrivals Products */}
      {newArrivalsProducts.length > 0 && (
        <section className="mb-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight inline-block cursor-default transition-all duration-300">
              <TranslatedText dictKey="home.new_arrivals.title" defaultText={newArrivalsTitle?.title || 'Новинки'} />
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              <TranslatedText dictKey="home.new_arrivals.subtitle" defaultText={newArrivalsTitle?.subtitle || 'Свіжі надходження сезону'} />
            </p>
          </div>

          <div className="mt-8">
            <ProductCarousel products={newArrivalsProducts} />
          </div>
        </section>
      )}

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Collections */}
      <section className="mb-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            <TranslatedText dictKey="home.collections.title" defaultText={collectionsTitle?.title || 'Колекції'} />
          </h2>
          {(collectionsTitle?.subtitle || true) && (
            <p className="text-gray-500 max-w-2xl mx-auto">
              <TranslatedText dictKey="home.collections.subtitle" defaultText={collectionsTitle?.subtitle || undefined} />
            </p>
          )}
        </div>

        <CollectionCarousel collections={collections} />
      </section>
    </div>
  );
}
