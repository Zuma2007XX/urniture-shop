'use client';

import { useEffect, useState } from 'react';

interface Message {
    id: string;
    name: string;
    email: string;
    message: string;
    read: boolean;
    createdAt: string;
}

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/admin/messages');
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleRead = async (msg: Message) => {
        try {
            await fetch('/api/admin/messages', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: msg.id, read: !msg.read }),
            });
            setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: !m.read } : m));
            if (selectedMessage?.id === msg.id) {
                setSelectedMessage({ ...msg, read: !msg.read });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteMessage = async (id: string) => {
        if (!confirm('Видалити це повідомлення?')) return;
        try {
            await fetch(`/api/admin/messages?id=${id}`, { method: 'DELETE' });
            setMessages(prev => prev.filter(m => m.id !== id));
            if (selectedMessage?.id === id) setSelectedMessage(null);
        } catch (err) {
            console.error(err);
        }
    };

    const markAsRead = async (msg: Message) => {
        if (!msg.read) {
            await fetch('/api/admin/messages', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: msg.id, read: true }),
            });
            setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
        }
        setSelectedMessage({ ...msg, read: true });
    };

    const filteredMessages = messages.filter(m => {
        if (filter === 'unread') return !m.read;
        if (filter === 'read') return m.read;
        return true;
    });

    const unreadCount = messages.filter(m => !m.read).length;

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('uk-UA', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-black rounded-full" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">Повідомлення</h1>
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <p className="text-gray-500 text-sm">
                    Повідомлення з форми зворотного зв&apos;язку на сторінці «Контакти»
                </p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                {(['all', 'unread', 'read'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {f === 'all' ? `Усі (${messages.length})` :
                            f === 'unread' ? `Непрочитані (${unreadCount})` :
                                `Прочитані (${messages.length - unreadCount})`}
                    </button>
                ))}
            </div>

            {messages.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-gray-300 mx-auto mb-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 0 1-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 0 0 1.183 1.981l6.478 3.488m8.839 2.51-4.66-2.51m0 0-1.023-.55a2.25 2.25 0 0 0-2.134 0l-1.022.55m0 0-4.661 2.51m16.5 1.615a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V8.844a2.25 2.25 0 0 1 1.183-1.981l7.5-4.039a2.25 2.25 0 0 1 2.134 0l7.5 4.039a2.25 2.25 0 0 1 1.183 1.98V19.5Z" />
                    </svg>
                    <p className="text-gray-400 text-lg font-medium">Поки що немає повідомлень</p>
                    <p className="text-gray-300 text-sm mt-1">Коли хтось заповнить форму — воно з&apos;явиться тут</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Messages list */}
                    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                        {filteredMessages.map(msg => (
                            <div
                                key={msg.id}
                                onClick={() => markAsRead(msg)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${selectedMessage?.id === msg.id
                                        ? 'border-black bg-gray-50 shadow-sm'
                                        : msg.read
                                            ? 'border-gray-100 hover:border-gray-200 bg-white'
                                            : 'border-blue-200 bg-blue-50/50 hover:border-blue-300'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {!msg.read && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                            )}
                                            <span className={`font-semibold text-sm truncate ${!msg.read ? 'text-black' : 'text-gray-700'}`}>
                                                {msg.name}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mb-2">{msg.email}</p>
                                        <p className="text-sm text-gray-600 line-clamp-2">{msg.message}</p>
                                    </div>
                                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                                        {formatDate(msg.createdAt)}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {filteredMessages.length === 0 && (
                            <p className="text-center text-gray-400 py-8 text-sm">
                                Немає повідомлень з цим фільтром
                            </p>
                        )}
                    </div>

                    {/* Message detail */}
                    <div className="lg:sticky lg:top-4">
                        {selectedMessage ? (
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold">{selectedMessage.name}</h3>
                                        <a href={`mailto:${selectedMessage.email}`} className="text-sm text-blue-600 hover:underline">
                                            {selectedMessage.email}
                                        </a>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => toggleRead(selectedMessage)}
                                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                            title={selectedMessage.read ? 'Позначити як непрочитане' : 'Позначити як прочитане'}
                                        >
                                            {selectedMessage.read ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 0 1-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 0 0 1.183 1.981l6.478 3.488m8.839 2.51-4.66-2.51m0 0-1.023-.55a2.25 2.25 0 0 0-2.134 0l-1.022.55m0 0-4.661 2.51m16.5 1.615a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V8.844a2.25 2.25 0 0 1 1.183-1.981l7.5-4.039a2.25 2.25 0 0 1 2.134 0l7.5 4.039a2.25 2.25 0 0 1 1.183 1.98V19.5Z" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                                </svg>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => deleteMessage(selectedMessage.id)}
                                            className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                                            title="Видалити"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        </button>
                                        <a
                                            href={`mailto:${selectedMessage.email}?subject=Re: Повідомлення з сайту&body=%0A%0A--- Оригінальне повідомлення ---%0AВід: ${selectedMessage.name}%0A${selectedMessage.message}`}
                                            className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                            title="Відповісти"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400 mb-4">
                                    {formatDate(selectedMessage.createdAt)}
                                </div>
                                <div className="bg-gray-50 rounded-xl p-5 text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                                    {selectedMessage.message}
                                </div>
                            </div>
                        ) : (
                            <div className="border border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-gray-300 mb-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
                                </svg>
                                <p className="text-gray-400 text-sm">Оберіть повідомлення для перегляду</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
