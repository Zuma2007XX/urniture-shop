'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
// Image import removed; using native img for logo to avoid caching

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError('Невірний email або пароль');
            setLoading(false);
        } else {
            router.push('/admin');
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                    <img src={`/logo.png?v=${Date.now()}`} alt="Serious Mebel" style={{ height: 80, width: 'auto' }} className="object-contain mx-auto" />
                    <p className="text-[11px] text-gray-500 uppercase tracking-[0.3em] mt-2">Адмін-панель</p>
                </div>

                <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
                    {error && (
                        <div className="mb-6 text-red-400 text-sm text-center bg-red-900/20 rounded-lg py-2">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
                                placeholder="admin@unik.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">
                                Пароль
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
                                placeholder="••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black font-bold text-sm uppercase tracking-widest py-3.5 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Вхід...' : 'Увійти'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
