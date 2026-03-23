import crypto from 'crypto';

export interface LiqPayParams {
    public_key: string;
    version: number;
    action: 'pay' | 'hold' | 'auth' | 'subscribe' | 'paydonate';
    amount: number;
    currency: 'UAH' | 'USD' | 'EUR';
    description: string;
    order_id: string;
    server_url: string;
    result_url: string;
}

export function generateLiqPayDataAndSignature(params: LiqPayParams, privateKey: string) {
    const data = Buffer.from(JSON.stringify(params)).toString('base64');
    const signature = crypto
        .createHash('sha1')
        .update(privateKey + data + privateKey)
        .digest('base64');

    return { data, signature };
}

export function verifyLiqPaySignature(data: string, signature: string, privateKey: string) {
    const expectedSignature = crypto
        .createHash('sha1')
        .update(privateKey + data + privateKey)
        .digest('base64');

    return expectedSignature === signature;
}

export function decodeLiqPayData(data: string) {
    return JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
}
