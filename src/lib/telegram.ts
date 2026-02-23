export async function sendTelegramMessage(text: string, parseMode: 'Markdown' | 'HTML' = 'HTML') {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_ADMIN_ID;

    if (!token || !chatId) {
        console.log('Telegram Bot Token or Admin ID is missing. Notifications disabled.');
        return false;
    }

    try {
        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: parseMode,
                disable_web_page_preview: true,
            }),
        });

        if (!response.ok) {
            const data = await response.json();
            console.error('Failed to send Telegram message:', data);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
        return false;
    }
}
