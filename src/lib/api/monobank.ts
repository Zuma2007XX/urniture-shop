const BASE_URL = 'https://api.monobank.ua';

export async function createMonobankInvoice(params: {
    amount: number;
    orderId: string;
    orderNumber: string;
    items: Array<{ name: string; qty: number; sum: number }>;
    redirectUrl: string;
}) {
    const response = await fetch(`${BASE_URL}/api/merchant/invoice/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Token': process.env.MONOBANK_API_TOKEN || ''
        },
        body: JSON.stringify({
            amount: Math.round(params.amount * 100), // convert to cents
            ccy: 980, // UAH
            merchantPaymInfo: {
                reference: params.orderNumber,
                destination: `Оплата замовлення #${params.orderNumber}`,
                basketOrder: params.items.map(i => ({
                    name: i.name,
                    qty: i.qty,
                    sum: Math.round(i.sum * 100),
                    icon: '',
                    unit: 'шт.'
                }))
            },
            redirectUrl: params.redirectUrl,
            webHookUrl: process.env.MONOBANK_CALLBACK_URL,
            validity: 3600 // 1 hour
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Monobank API error: ${err}`);
    }

    return await response.json();
}

export async function checkMonobankPaymentStatus(invoiceId: string) {
    const response = await fetch(`${BASE_URL}/api/merchant/invoice/status?invoiceId=${invoiceId}`, {
        headers: {
            'X-Token': process.env.MONOBANK_API_TOKEN || ''
        }
    });

    return await response.json();
}
