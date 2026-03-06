const BOT_TOKEN = '6216362367:AAGlQw32X2PA1rb_qka34WWggNrW6gdyssw';
const CHAT_ID = '7632086796';

async function testTelegram() {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const text = '🛠️ Test Mesajı\n\nBu mesaj botun yeni chat ID (7632086796) ile bağlantısını test etmek için gönderilmiştir.';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: text,
                parse_mode: 'HTML'
            })
        });
        const data = await response.json();
        if (data.ok) {
            console.log(`✅ Test başarılı: Mesaj ${CHAT_ID} ID'sine başarıyla gönderildi.`);
        } else {
            console.error(`❌ Test başarısız: Telegram API Hatası - ${data.description}`);
        }
    } catch (e) {
        console.error('❌ Hata:', e);
    }
}

testTelegram();
