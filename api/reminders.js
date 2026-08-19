// Vercel Serverless Function: Scheduled Telegram Push Reminders
// Triggered via Vercel Cron Jobs or external cron ping

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DEFAULT_CHAT_IDS = ['8629428593'];

const MAIN_KEYBOARD = {
  keyboard: [
    [{ text: '📊 Today\'s Stats' }, { text: '🎯 Daily Scorecard' }],
    [{ text: '📈 Weekly Progress' }, { text: '🚶 Log Walk' }],
    [{ text: '💧 +500ml Water' }, { text: '⚖️ Log Weight' }],
    [{ text: '💡 Dining Advisor' }, { text: '🌐 Open Web Dashboard' }]
  ],
  resize_keyboard: true,
  is_persistent: true
};

async function sendTelegramMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: MAIN_KEYBOARD
      })
    });
    return await res.json();
  } catch (err) {
    console.error('Error sending reminder:', err);
  }
}

export default async function handler(req, res) {
  const now = new Date();
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  const hours = istTime.getUTCHours();
  const minutes = istTime.getUTCMinutes();

  let reminderText = '';

  // 7:30 AM IST (approx 7-8 AM window)
  if (hours >= 7 && hours < 9) {
    reminderText = `🌅 <b>Good Morning Nadeer!</b>\n⚖️ Remember to log your morning fasted weight to track progress toward 100 KG!\n\nJust type: <i>"Morning weight 110.5 kg"</i>`;
  }
  // 2:00 PM IST (approx 13-15 window)
  else if (hours >= 13 && hours < 16) {
    reminderText = `💧 <b>Hydration & Lunch Check-in!</b>\nStay hydrated this afternoon. Tap <code>💧 +500ml Water</code> or log your lunch!`;
  }
  // 6:00 PM IST (approx 17-19 window)
  else if (hours >= 17 && hours < 20) {
    reminderText = `🚶 <b>Evening Walk Time!</b>\nReady to crush today's 5.0 KM walk? Just show up and get those steps in! 🔥`;
  }
  // 10:00 PM IST (approx 21-23 window)
  else if (hours >= 21 || hours < 2) {
    reminderText = `🌙 <b>Night Scorecard Check-in!</b>\nTap <code>🎯 Daily Scorecard</code> to see your accomplishments today. Aim for 8 hours of restorative sleep tonight! 😴`;
  } else {
    reminderText = `🔥 <b>APEX 100 Health Check-in!</b>\nStay disciplined and win the day! Tap <code>📊 Today's Stats</code> to check your progress.`;
  }

  for (const cid of DEFAULT_CHAT_IDS) {
    await sendTelegramMessage(cid, reminderText);
  }

  return res.status(200).json({
    status: 'Reminder dispatched',
    istHour: hours,
    istMinute: minutes,
    recipients: DEFAULT_CHAT_IDS.length
  });
}
