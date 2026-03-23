import { NextResponse } from 'next/server';
import { fetchNPCities, fetchNPWarehouses } from '@/lib/api/nova-poshta';
import { fetchMeestBranches } from '@/lib/api/meest';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'cities' or 'warehouses'
    const service = searchParams.get('service'); // 'nova-poshta' or 'meest'
    const query = searchParams.get('query');
    const cityRef = searchParams.get('cityRef');

    try {
        if (service === 'nova-poshta') {
            if (type === 'cities' && query) {
                const cities = await fetchNPCities(query);
                return NextResponse.json(cities);
            }
            if (type === 'warehouses' && cityRef) {
                const warehouses = await fetchNPWarehouses(cityRef);
                return NextResponse.json(warehouses);
            }
        }

        if (service === 'meest') {
            if (type === 'warehouses' && cityRef) {
                const branches = await fetchMeestBranches(cityRef);
                return NextResponse.json(branches);
            }
        }

        return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
    } catch (error) {
        console.error('Delivery API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
