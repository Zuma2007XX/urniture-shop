const BASE_URL = 'https://api.novaposhta.ua/v2.0/json/';

export interface NPSearchCityResponse {
    success: boolean;
    data: Array<{
        Addresses: Array<{
            Present: string;
            DeliveryCity: string;
        }>;
    }>;
}

export interface NPWarehouse {
    Description: string;
    ShortAddress: string;
    Number: string;
    Ref: string;
}

export async function fetchNPCities(query: string) {
    if (!query || query.length < 2) return [];

    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            apiKey: process.env.NOVA_POSHTA_API_KEY,
            modelName: 'Address',
            calledMethod: 'searchSettlements',
            methodProperties: {
                CityName: query,
                Limit: '10',
                Page: '1'
            }
        })
    });

    const result = await response.json();
    if (!result.success) return [];

    return result.data[0]?.Addresses || [];
}

export async function fetchNPWarehouses(cityRef: string) {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            apiKey: process.env.NOVA_POSHTA_API_KEY,
            modelName: 'Address',
            calledMethod: 'getWarehouses',
            methodProperties: {
                CityRef: cityRef,
                Limit: '100'
            }
        })
    });

    const result = await response.json();
    if (!result.success) return [];

    return result.data as NPWarehouse[];
}

export async function createNPEW(params: {
    cityRef: string;
    warehouseRef: string;
    recipientPhone: string;
    recipientName: string;
    weight: number;
    cost: number;
}) {
    // Implementation for creating an Express Waybill
    // Requires sender info usually stored in .env or settings
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            apiKey: process.env.NOVA_POSHTA_API_KEY,
            modelName: 'InternetDocument',
            calledMethod: 'save',
            methodProperties: {
                PayerType: 'Recipient',
                PaymentMethod: 'NonCash',
                DateTime: new Date().toLocaleDateString('uk-UA').replace(/\./g, '-'),
                CargoType: 'Cargo',
                Weight: params.weight.toString(),
                ServiceType: 'WarehouseWarehouse',
                SeatsAmount: '1',
                Description: 'Меблі',
                Cost: params.cost.toString(),
                CityRecipient: params.cityRef,
                RecipientAddress: params.warehouseRef,
                RecipientType: 'PrivatePerson',
                RecipientsPhone: params.recipientPhone,
                Recipient: params.recipientName,
            }
        })
    });

    return await response.json();
}
