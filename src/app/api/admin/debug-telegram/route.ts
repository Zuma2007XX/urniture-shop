import { NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';

export async function GET() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const adminId = process.env.TELEGRAM_ADMIN_ID;

    const diagnostics = {
        ENV_DETECTION: {
            hasToken: !!token,
            tokenLength: token?.length || 0,
            hasAdminId: !!adminId,
            adminIdLength: adminId?.length || 0,
        },
        TEST_RESULT: null as any
    };

    if (token && adminId) {
        try {
            const success = await sendTelegramMessage('<b>🔔 DIAGNOSTIC TEST</b>\nThis is a diagnostic message to verify production environment variables.');
            diagnostics.TEST_RESULT = success ? '✅ SUCCESS' : '❌ FAILED (Check server logs)';
        } catch (e: any) {
            diagnostics.TEST_RESULT = `❌ ERROR: ${e.message}`;
        }
    } else {
        diagnostics.TEST_RESULT = '❌ MISSING CREDENTIALS';
    }

    return NextResponse.json(diagnostics);
}
