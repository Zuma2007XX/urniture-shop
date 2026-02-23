'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';

export default function EditProduct() {
    const params = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/admin/products/${params.id}`)
            .then(r => r.json())
            .then(data => {
                setProduct(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!product) {
        return <div className="text-center py-20 text-gray-500">Товар не знайдено</div>;
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Редагування товару</h1>
                <p className="text-sm text-gray-500 mt-1">Змініть інформацію про товар</p>
            </div>
            <ProductForm initialData={product} />
        </div>
    );
}
