// Vercel Serverless Function: Telegram AI Health Coach Webhook
// Connects Telegram (@apex100_health_bot) directly to Supabase and Google Gemini AI

import { createClient } from '@supabase/supabase-js';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

// Helper to send Telegram message
async function sendTelegramMessage(chatId, text, replyMarkup = null) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML'
  };
  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (err) {
    console.error('Error sending Telegram message:', err);
  }
}

// Quick action reply keyboard for Telegram
const MAIN_KEYBOARD = {
  keyboard: [
    [{ text: '📊 Today\'s Stats' }, { text: '💧 +500ml Water' }],
    [{ text: '🚶 Log 5.4km Walk' }, { text: '⚖️ Log Weight' }],
    [{ text: '🍽️ Log Meal' }, { text: '🌐 Open Web Dashboard' }]
  ],
  resize_keyboard: true,
  is_persistent: true
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'APEX 100 Telegram Bot Webhook Active', bot: '@apex100_health_bot' });
  }

  try {
    const update = req.body || {};
    const message = update.message || update.edited_message;

    if (!message || !message.chat) {
      return res.status(200).json({ ok: true });
    }

    const chatId = message.chat.id;
    const incomingText = (message.text || '').trim();
    const todayStr = new Date().toISOString().split('T')[0];

    // Handle Start & Help commands
    if (incomingText === '/start' || incomingText === '/help') {
      const welcomeMsg = `🔥 <b>Welcome to APEX 100 AI Health Coach!</b>

I am your personal AI assistant synced directly to your <b>APEX 100 Dashboard</b>.

<b>What you can do:</b>
• <b>Log Food:</b> <i>"Breakfast 4 small idli, 2 boiled eggs and chutney"</i> or <i>"300g lunch: rice + 2 mathi fry + kumbalanga curry + beetroot thoran"</i>
• <b>Log Walking:</b> <i>"5.4 km walk in 1 hour, avg HR 133 bpm"</i>
• <b>Log Water:</b> <i>"Drank 1L water"</i> or tap the button below
• <b>Log Weight:</b> <i>"Morning weight 110.8 kg"</i>
• <b>Ask Questions:</b> <i>"What are my remaining calories for dinner?"</i>

Everything syncs instantly with your web dashboard! 🚀`;

      await sendTelegramMessage(chatId, welcomeMsg, MAIN_KEYBOARD);
      return res.status(200).json({ ok: true });
    }

    // Connect to Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Fetch current dashboard state from Supabase
    const { data: cloudRow } = await supabase
      .from('user_transformation_data')
      .select('payload')
      .eq('id', 'primary_user')
      .single();

    const currentPayload = cloudRow?.payload || {};
    const foodLogs = currentPayload.foodLogs || {};
    const walkingLogs = currentPayload.walkingLogs || [];
    const weightLogs = currentPayload.weightLogs || [];
    const habits = currentPayload.habits || [];
    const waterData = currentPayload.waterData || { consumedMl: 0, targetMl: 3500 };

    // Calculate today's current totals
    const todayFoodObj = foodLogs[todayStr] || { breakfast: [], lunch: [], snack: [], dinner: [] };
    const todayItems = [
      ...(todayFoodObj.breakfast || []),
      ...(todayFoodObj.lunch || []),
      ...(todayFoodObj.snack || []),
      ...(todayFoodObj.dinner || [])
    ];
    const totalCal = todayItems.reduce((sum, i) => sum + (Number(i.calories) || 0), 0);
    const totalProt = todayItems.reduce((sum, i) => sum + (Number(i.protein) || 0), 0);
    const calRemaining = Math.max(0, 2100 - totalCal);
    const protRemaining = Math.max(0, 130 - totalProt);

    // Quick Button: Today's Stats
    if (incomingText === '📊 Today\'s Stats' || incomingText === '/stats' || incomingText === '/status') {
      const statsMsg = `📊 <b>APEX 100 Status for Today (${todayStr}):</b>

🍽️ <b>Calories:</b> <code>${totalCal} / 2,100 kcal</code> (${calRemaining} kcal remaining)
🥩 <b>Protein:</b> <code>${totalProt.toFixed(1)} / 130g</code> (${protRemaining.toFixed(1)}g needed)
💧 <b>Water:</b> <code>${((waterData.consumedMl || 0) / 1000).toFixed(2)} / ${((waterData.targetMl || 3500) / 1000).toFixed(1)} L</code>
🚶 <b>Today's Logged Items:</b> ${todayItems.length} meals/dishes

💡 <i>Target: 100 KG by Dec 31. Consistency beats intensity!</i>`;

      await sendTelegramMessage(chatId, statsMsg, MAIN_KEYBOARD);
      return res.status(200).json({ ok: true });
    }

    // Quick Button: +500ml Water
    if (incomingText === '💧 +500ml Water') {
      const newWater = (waterData.consumedMl || 0) + 500;
      const updatedPayload = {
        ...currentPayload,
        waterData: { ...waterData, consumedMl: newWater }
      };

      await supabase.from('user_transformation_data').upsert({
        id: 'primary_user',
        payload: updatedPayload,
        updated_at: new Date().toISOString()
      });

      const waterMsg = `💧 <b>Logged +500ml Water!</b>\nTotal today: <b>${(newWater / 1000).toFixed(2)} L</b> / ${(waterData.targetMl / 1000).toFixed(1)} L`;
      await sendTelegramMessage(chatId, waterMsg, MAIN_KEYBOARD);
      return res.status(200).json({ ok: true });
    }

    // Quick Button: Open Web Dashboard Link
    if (incomingText === '🌐 Open Web Dashboard') {
      const linkMsg = `🔗 <b>Open Your Live Dashboard:</b>\nhttps://health-dashboard-eta-nine.vercel.app`;
      await sendTelegramMessage(chatId, linkMsg, MAIN_KEYBOARD);
      return res.status(200).json({ ok: true });
    }

    // AI Reasoning with Gemini for Natural Language Logging
    const systemPrompt = `You are the dedicated AI Health & Transformation Coach for APEX 100.
Today's Date: ${todayStr}.

Current State for Today (${todayStr}):
- Consumed: ${totalCal} kcal / 2,100 kcal target
- Protein: ${totalProt.toFixed(1)}g / 130g target
- Water: ${waterData.consumedMl} ml
- Existing Food Logs for ${todayStr}: ${JSON.stringify(todayFoodObj)}

User's Telegram Message: "${incomingText}"

Analyze the user's message and determine the action:
1. "LOG_FOOD": User is describing what they ate (e.g. "Breakfast 4 idli, 2 boiled eggs", "300g lunch rice + 2 mathi fry + kumbalanga curry", "1 banana", "2 chapati + fish curry").
   - Categorize into "breakfast", "lunch", "snack", or "dinner".
   - Estimate realistic calories, protein(g), carbs(g), fat(g).
   - Return updated foodLogs[todayStr] object with the new item added.
2. "LOG_WALK": User walked (e.g. "5.4 km walk in 1 hour", "Walked 5km").
   - Extract distance, duration, pace, calories.
   - Return new walk object.
3. "LOG_WEIGHT": User logged weight (e.g. "Morning weight 110.8 kg").
   - Return new weight object.
4. "QUERY": User is asking a question or status (e.g. "what should I eat?", "calories left?").
   - Reply with helpful coach advice based on today's remaining calories.

Format your reply in clean HTML (use <b>, <i>, <code> tags, no markdown backticks).

Respond strictly in this JSON format:
{
  "action": "LOG_FOOD" | "LOG_WALK" | "LOG_WEIGHT" | "QUERY",
  "updatedFoodLogs": null or full updated foodLogs object,
  "newWalkLog": null or { "id": "w-${Date.now()}", "date": "${todayStr}", "distance": 5.4, "duration": "1:00:00", "pace": "11:07", "calories": 492, "avgHeartRate": 133, "elevation": 50 },
  "newWeightLog": null or { "id": "wt-${Date.now()}", "date": "${todayStr}", "weight": 110.8, "time": "Morning", "note": "Logged via Telegram" },
  "waterToAddMl": 0,
  "telegramHtmlReply": "The encouraging, beautifully formatted HTML message to send back to the user."
}`;

    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const aiResponse = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    let nextPayload = { ...currentPayload };
    let replyHtml = "✅ Update received!";

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const parsedAI = JSON.parse(rawText.replace(/^```json/, '').replace(/```$/, '').trim());

      replyHtml = parsedAI.telegramHtmlReply || "✅ Logged to your dashboard!";

      if (parsedAI.updatedFoodLogs) {
        nextPayload.foodLogs = parsedAI.updatedFoodLogs;
      }
      if (parsedAI.newWalkLog) {
        nextPayload.walkingLogs = [parsedAI.newWalkLog, ...(nextPayload.walkingLogs || [])];
        if (nextPayload.habits) {
          nextPayload.habits = nextPayload.habits.map(h => h.id === 'h-1' ? { ...h, completed: true } : h);
        }
      }
      if (parsedAI.newWeightLog) {
        nextPayload.weightLogs = [...(nextPayload.weightLogs || []), parsedAI.newWeightLog];
      }
      if (parsedAI.waterToAddMl > 0) {
        nextPayload.waterData = {
          ...waterData,
          consumedMl: (waterData.consumedMl || 0) + parsedAI.waterToAddMl
        };
      }

      // Save to Supabase Cloud
      await supabase
        .from('user_transformation_data')
        .upsert({
          id: 'primary_user',
          payload: nextPayload,
          updated_at: new Date().toISOString()
        });
    }

    await sendTelegramMessage(chatId, replyHtml, MAIN_KEYBOARD);
    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error('Telegram webhook handler error:', error);
    return res.status(200).json({ ok: true, error: error.message });
  }
}
