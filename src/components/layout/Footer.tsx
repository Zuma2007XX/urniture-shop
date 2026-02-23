import Link from 'next/link';
// Image import removed; using native img for logo to avoid caching

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 mt-20">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <img src={`/logo.png?v=${Date.now()}`} alt="Serious Mebel" style={{ height: 62, width: 'auto' }} className="object-contain mb-3" />
                        <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                            Створюємо меблі, що стають частиною вашої історії. Увага до матеріалів та повага до простору.
                        </p>
                    </div>



                    {/* Company */}
                    <div>
                        <h4 className="text-[11px] uppercase tracking-[0.2em] font-bold mb-5">Компанія</h4>
                        <ul className="space-y-3">
                            <li><Link href="/about" className="text-sm text-gray-500 hover:text-black transition-colors">Про бренд</Link></li>
                            <li><Link href="/about" className="text-sm text-gray-500 hover:text-black transition-colors">Виробництво</Link></li>
                            <li><Link href="/contacts" className="text-sm text-gray-500 hover:text-black transition-colors">Контакти</Link></li>
                        </ul>
                    </div>

                    {/* Help */}
                    <div>
                        <h4 className="text-[11px] uppercase tracking-[0.2em] font-bold mb-5">Допомога</h4>
                        <ul className="space-y-3">
                            <li><Link href="/delivery" className="text-sm text-gray-500 hover:text-black transition-colors">Доставка</Link></li>
                            <li><Link href="/payment" className="text-sm text-gray-500 hover:text-black transition-colors">Оплата</Link></li>
                            <li><Link href="/returns" className="text-sm text-gray-500 hover:text-black transition-colors">Повернення</Link></li>
                            <li><Link href="/faq" className="text-sm text-gray-500 hover:text-black transition-colors">FAQ</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-100 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-[11px] text-gray-400 uppercase tracking-widest">
                    <p>© 2024 SM FURNITURE STORE. ВСІ ПРАВА ЗАХИЩЕНІ.</p>
                    <div className="flex gap-6 mt-3 md:mt-0">
                        <Link href="/privacy" className="hover:text-black transition-colors">Політика конфіденційності</Link>
                        <Link href="/terms" className="hover:text-black transition-colors">Умови використання</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
