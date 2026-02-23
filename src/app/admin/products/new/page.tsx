'use client';

import ProductForm from '@/components/admin/ProductForm';

export default function NewProduct() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Новий товар</h1>
                <p className="text-sm text-gray-500 mt-1">Заповніть інформацію про новий товар</p>
            </div>
            <ProductForm />
        </div>
    );
}
