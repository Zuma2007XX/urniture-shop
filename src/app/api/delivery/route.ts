```javascript
import { NextResponse } from 'next/server';
import { fetchNPCities, fetchNPWarehouses } from '@/lib/api/nova-poshta';

// Helper functions to abstract Nova Poshta calls
async function searchCities(query: string) {
    return await fetchNPCities(query);
}

async function getWarehouses(cityRef: string) {
    return await fetchNPWarehouses(cityRef);
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const query = searchParams.get('query') || '';
    const cityRef = searchParams.get('cityRef') || '';

    try {
        if (type === 'cities') {
            const cities = await searchCities(query);
            return NextResponse.json(cities);
        }

        if (type === 'warehouses') {
            const warehouses = await getWarehouses(cityRef);
            return NextResponse.json(warehouses);
        }

        return NextResponse.json({ message: 'Invalid type' }, { status: 400 });
    } catch (error) {
        console.error('Delivery API error:', error);
        return NextResponse.json({ message: 'Error fetching delivery data' }, { status: 500 });
    }
}
```
