const BASE_URL = 'https://p-api.meest.com'; // Production API

export async function fetchMeestBranches(cityID: string) {
    const response = await fetch(`${BASE_URL}/v3.0/branches?city_id=${cityID}`, {
        headers: {
            'token': process.env.MEEST_API_KEY || ''
        }
    });

    if (!response.ok) return [];
    const result = await response.json();
    return result.data || [];
}

export async function createMeestShipment(params: {
    recipientName: string;
    recipientPhone: string;
    cityID: string;
    branchID: string;
    weight: number;
}) {
    // Meest shipment creation implementation
    const response = await fetch(`${BASE_URL}/v3.0/shipments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'token': process.env.MEEST_API_KEY || ''
        },
        body: JSON.stringify({
            // Meest specific fields
            sender_id: process.env.MEEST_SENDER_ID,
            recipient_name: params.recipientName,
            recipient_phone: params.recipientPhone,
            city_id: params.cityID,
            branch_id: params.branchID,
            weight: params.weight,
        })
    });

    return await response.json();
}
