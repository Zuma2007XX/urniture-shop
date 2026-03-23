export interface OneCProduct {
    sku: string;
    name: string;
    price: number;
    stock: number;
}

export interface OneCOrder {
    orderNumber: string;
    clientName: string;
    clientPhone: string;
    items: Array<{ sku: string; qty: number; price: number }>;
}

export async function syncProductsFrom1C() {
    // This could be a REST call to a 1C OData service
    // or processing a CommerceML XML file
    const response = await fetch(`${process.env.ONE_C_API_URL}/products`, {
        headers: {
            'Authorization': 'Basic ' + Buffer.from(process.env.ONE_C_USER + ':' + process.env.ONE_C_PASSWORD).toString('base64')
        }
    });

    if (!response.ok) return null;
    return await response.json() as OneCProduct[];
}

export async function pushOrderTo1C(order: OneCOrder) {
    const response = await fetch(`${process.env.ONE_C_API_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from(process.env.ONE_C_USER + ':' + process.env.ONE_C_PASSWORD).toString('base64')
        },
        body: JSON.stringify(order)
    });

    return response.ok;
}
