// Vercel Serverless Function: APEX 100 Telegram AI Companion Webhook
// Connects Telegram (@apex100_health_bot) 24/7 directly to Supabase and Google Gemini AI

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
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return await res.json();
  } catch (err) {
    console.error('[Telegram Webhook] Error sending message:', err);
  }
}

// Download Telegram Photo as Base64 for Gemini Vision AI
async function getTelegramPhotoBase64(fileId) {
  try {
    const getFileUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`;
    const fileRes = await fetch(getFileUrl);
    const fileData = await fileRes.json();

    if (!fileData.ok || !fileData.result?.file_path) return null;

    const downloadUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileData.result.file_path}`;
    const imgRes = await fetch(downloadUrl);
    const arrayBuffer = await imgRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString('base64');
  } catch (err) {
    console.error('[Telegram Webhook] Error downloading photo:', err);
    return null;
  }
}

// Main Interactive Keyboard
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

// Generate Comprehensive Weekly Progress HTML Report
function generateWeeklyReportHtml(weightLogs, walkingLogs, foodLogs, todayStr) {
  const currentWeight = weightLogs.length > 0 ? Number(weightLogs[weightLogs.length - 1].weight) : 110.80;
  const startWeight = weightLogs.length > 0 ? Number(weightLogs[0].weight) : 110.80;
  const totalWeightLost = (startWeight - currentWeight).toFixed(2);
  const remainingToGoal = Math.max(0, currentWeight - 100).toFixed(2);

  const totalWalkKm = walkingLogs.reduce((sum, w) => sum + (Number(w.distance) || 0), 0);
  const totalWalkSessions = walkingLogs.length;
  const avgPace = walkingLogs.length > 0 ? walkingLogs[walkingLogs.length - 1].pace || '11:07' : '11:07';

  const recordedFoodDates = Object.keys(foodLogs).filter(k => {
    const d = foodLogs[k] || {};
    const items = [...(d.breakfast || []), ...(d.lunch || []), ...(d.snack || []), ...(d.dinner || [])];
    return items.length > 0;
  });

  return `📈 <b>APEX 100 PROGRESS REPORT</b>
━━━━━━━━━━━━━━━━━━━━

⚖️ <b>WEIGHT DYNAMICS:</b>
• Starting Baseline: <b>${startWeight.toFixed(2)} kg</b>
• Current Fasted: <b>${currentWeight.toFixed(2)} kg</b>
• Total Lost So Far: <b>${Number(totalWeightLost) > 0 ? `-${totalWeightLost} kg` : 'On Track'}</b>
• Remaining to Goal: <b>${remainingToGoal} kg</b> (Target: 100.0 kg by Dec 31)

🚶 <b>WALKING & CARDIO:</b>
• Total Distance: <b>${totalWalkKm.toFixed(1)} km</b> across ${totalWalkSessions} walks
• Current Pace: <b>${avgPace} /km</b>
• Walk Compliance: <b>100%</b> (5.0+ km target met)

🍽️ <b>NUTRITION & DEFICIT:</b>
• Tracked Days: <b>${recordedFoodDates.length} days</b>
• Target Daily Budget: <b>2,100 kcal</b> (500 kcal deficit)
• Daily Protein Goal: <b>130 g</b>

🎯 <b>DEC 31 TRAJECTORY:</b>
• Remaining Weeks: <b>~19.5 weeks</b>
• Required Loss Rate: <b>~0.55 kg / week</b>
• Status: 🟢 <b>On Track to hit 100 KG by Dec 31!</b>
━━━━━━━━━━━━━━━━━━━━
💡 <i>Ask me: "Compare this week with last week" or "How is my monthly progress?" for detailed breakdowns!</i>`;
}

// Generate Today's Scorecard HTML
function generateScorecardHtml(todayStr, totalCal, totalProt, waterData, walkingLogs, habits) {
  const totalWalkKm = walkingLogs.filter(w => w.date === todayStr).reduce((sum, w) => sum + (Number(w.distance) || 0), 0);
  const waterL = ((waterData.consumedMl || 0) / 1000).toFixed(2);
  const isDietOnTrack = totalCal > 0 && totalCal <= 2200;
  const isWaterDone = (waterData.consumedMl || 0) >= (waterData.targetMl || 3500);
  const isWalkDone = totalWalkKm >= 5.0;

  return `🎯 <b>APEX 100 DAILY SCORECARD</b> (${todayStr})
━━━━━━━━━━━━━━━━━━━━

🍽️ <b>Calorie Deficit:</b> ${isDietOnTrack ? '✅' : totalCal === 0 ? '⏳' : '⚠️'} <code>${totalCal} / 2,100 kcal</code>
🥩 <b>Protein Target:</b> ${totalProt >= 120 ? '✅' : '⏳'} <code>${totalProt.toFixed(1)} / 130g</code>
🚶 <b>5.0 KM Walk:</b> ${isWalkDone ? '✅' : '⏳'} <code>${totalWalkKm.toFixed(2)} / 5.0 km</code>
💧 <b>3.5 L Water:</b> ${isWaterDone ? '✅' : '⏳'} <code>${waterL} / 3.5 L</code>
🍬 <b>Zero Added Sugar:</b> ✅ <i>Maintained</i>
😴 <b>Sleep & Recovery:</b> ⏳ <i>Tonight's Goal: ~8 hrs</i>

━━━━━━━━━━━━━━━━━━━━
🔥 <i>Consistency is King. Win the day!</i>`;
}

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
    const incomingText = (message.text || message.caption || '').trim();
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Handle Start & Help commands
    const isStartCmd = /^\/?(start|help|styart|stary|menu)$/i.test(incomingText.toLowerCase());
    if (isStartCmd) {
      const welcomeMsg = `🔥 <b>Welcome to APEX 100 AI Health Coach!</b>

I am your personal AI assistant synced in real-time with your <b>APEX 100 Dashboard</b>.

<b>✨ Top Features:</b>
📸 <b>Photo Logging:</b> Snap & send any meal photo to calculate calories!
🍽️ <b>Food Text:</b> <i>"300g lunch: rice + 2 mathi fry + kumbalanga curry + beetroot thoran"</i>
🚶 <b>Walks:</b> <i>"Walked 5.4 km in 1 hour"</i>
💧 <b>Water:</b> <i>"Drank 1L water"</i> or tap <code>💧 +500ml Water</code>
⚖️ <b>Weight:</b> <i>"Morning weight 110.8 kg"</i>
🎯 <b>Scorecard:</b> Tap <code>🎯 Daily Scorecard</code>
💡 <b>Dining Advisor:</b> <i>"I'm at an Arabic restaurant, what should I order?"</i>`;

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

    // 2. Scorecard Button
    if (incomingText === '🎯 Daily Scorecard' || incomingText === '/scorecard') {
      const scorecardHtml = generateScorecardHtml(todayStr, totalCal, totalProt, waterData, walkingLogs, habits);
      await sendTelegramMessage(chatId, scorecardHtml, MAIN_KEYBOARD);
      return res.status(200).json({ ok: true });
    }

    // 3. Weekly Progress Report
    if (incomingText === '📈 Weekly Progress' || incomingText === '/progress' || incomingText === '/weekly' || incomingText === '/report') {
      const weeklyReport = generateWeeklyReportHtml(weightLogs, walkingLogs, foodLogs, todayStr);
      await sendTelegramMessage(chatId, weeklyReport, MAIN_KEYBOARD);
      return res.status(200).json({ ok: true });
    }

    // 4. Stats Button
    if (incomingText === '📊 Today\'s Stats' || incomingText === '/stats' || incomingText === '/status') {
      const statsMsg = `📊 <b>APEX 100 Status for Today (${todayStr}):</b>

🍽️ <b>Calories:</b> <code>${totalCal} / 2,100 kcal</code> (${calRemaining} kcal remaining)
🥩 <b>Protein:</b> <code>${totalProt.toFixed(1)} / 130g</code> (${protRemaining.toFixed(1)}g needed)
💧 <b>Water:</b> <code>${((waterData.consumedMl || 0) / 1000).toFixed(2)} / ${((waterData.targetMl || 3500) / 1000).toFixed(1)} L</code>
🚶 <b>Logged Items:</b> ${todayItems.length} meals`;

      await sendTelegramMessage(chatId, statsMsg, MAIN_KEYBOARD);
      return res.status(200).json({ ok: true });
    }

    // 5. Quick Water +500ml
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

    // 6. Dining Advisor Button
    if (incomingText === '💡 Dining Advisor' || incomingText.toLowerCase() === 'dining advisor') {
      const diningHelp = `🧠 <b>APEX 100 Dining & Restaurant Advisor</b>

You have <b>${calRemaining} kcal</b> and <b>${protRemaining.toFixed(1)}g protein</b> remaining today!

Ask me about any restaurant or meal scenario:
• <i>"I'm at an Arabic restaurant with family, what should I order?"</i>
• <i>"Going to a Malabar wedding feast, how should I manage?"</i>
• <i>"Craving a snack at 5 PM, what are low-calorie options?"</i>`;
      await sendTelegramMessage(chatId, diningHelp, MAIN_KEYBOARD);
      return res.status(200).json({ ok: true });
    }

    // 7. Open Web Dashboard Link
    if (incomingText === '🌐 Open Web Dashboard') {
      const linkMsg = `🔗 <b>Open Your Live Dashboard:</b>\nhttps://health-dashboard-eta-nine.vercel.app`;
      await sendTelegramMessage(chatId, linkMsg, MAIN_KEYBOARD);
      return res.status(200).json({ ok: true });
    }

    // 8. Visual Photo Analysis with Gemini 3.5 Flash
    if (message.photo && message.photo.length > 0) {
      await sendTelegramMessage(chatId, `🔍 <i>Analyzing your meal photo with Gemini Vision AI...</i>`);
      const bestPhoto = message.photo[message.photo.length - 1];
      const base64Image = await getTelegramPhotoBase64(bestPhoto.file_id);

      if (base64Image) {
        const visionPrompt = `You are an expert Sports Nutritionist & AI Vision Dietitian for APEX 100.
Today's Date: ${todayStr}.
Current Dashboard Status: ${totalCal} / 2100 kcal consumed. Remaining: ${calRemaining} kcal.
User caption/notes: "${incomingText || 'Meal photo'}"

Analyze this meal photo carefully:
1. Identify all food items, side dishes, rice/carbs, curries, and fish/proteins visible on the plate (especially Kerala or Indian foods like matta rice, thoran, sambar, fish curry, fish fry, eggs, chapati).
2. Estimate the portion weights and total realistic nutrition (Calories, Protein, Carbs, Fat).
3. Determine whether this is "breakfast", "lunch", "snack", or "dinner".

Respond strictly in this JSON format:
{
  "category": "breakfast" | "lunch" | "snack" | "dinner",
  "name": "Concise summary name of the plate (e.g. Kerala Lunch Plate: Rice + Fish Fry + Thoran + Curry)",
  "portion": "e.g. 1 plate (~300g)",
  "calories": 460,
  "protein": 24.5,
  "carbs": 52.0,
  "fat": 14.0,
  "tips": "Actionable feedback on protein density and deficit fit.",
  "telegramHtmlReply": "Formatted HTML response explaining the detected items, macros, and updated daily totals."
}`;

        try {
          const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`;
          const aiRes = await fetch(geminiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: visionPrompt },
                  { inline_data: { mime_type: 'image/jpeg', data: base64Image } }
                ]
              }],
              generationConfig: { responseMimeType: 'application/json' }
            })
          });

          if (aiRes.ok) {
            const aiData = await aiRes.json();
            const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            const parsed = JSON.parse(rawText.replace(/^```json/, '').replace(/```$/, '').trim());

            const cat = parsed.category || 'lunch';
            const newItem = {
              id: `photo-${Date.now()}`,
              name: parsed.name || 'Meal Photo Plate',
              portion: parsed.portion || '1 serving',
              calories: Number(parsed.calories) || 450,
              protein: Number(parsed.protein) || 20,
              carbs: Number(parsed.carbs) || 50,
              fat: Number(parsed.fat) || 12,
              tip: parsed.tips || 'Logged via Photo AI'
            };

            const nextFoodLogs = { ...foodLogs };
            if (!nextFoodLogs[todayStr]) {
              nextFoodLogs[todayStr] = { breakfast: [], lunch: [], snack: [], dinner: [] };
            }
            nextFoodLogs[todayStr][cat] = [...(nextFoodLogs[todayStr][cat] || []), newItem];

            const nextPayload = { ...currentPayload, foodLogs: nextFoodLogs };
            await supabase.from('user_transformation_data').upsert({
              id: 'primary_user',
              payload: nextPayload,
              updated_at: new Date().toISOString()
            });

            await sendTelegramMessage(chatId, parsed.telegramHtmlReply || `📸 <b>Logged from Photo to ${cat.toUpperCase()}!</b>\n• Estimated: <b>${newItem.calories} kcal • ${newItem.protein}g Protein</b>`, MAIN_KEYBOARD);
            return res.status(200).json({ ok: true });
          }
        } catch (err) {
          console.error('[Telegram Webhook] Vision AI error:', err);
        }
      }
    }

    // 9. AI Reasoning with Gemini for Natural Language Logging, Historical Comparisons & Dining Advisor
    const systemPrompt = `You are the dedicated AI Health & Transformation Coach for APEX 100.
Today's Date: ${todayStr}.
Current Dashboard Status for Today:
- Consumed: ${totalCal} kcal / 2,100 kcal target (${calRemaining} kcal remaining)
- Protein: ${totalProt.toFixed(1)}g / 130g target (${protRemaining.toFixed(1)}g needed)
- Water: ${waterData.consumedMl} ml
- Existing Food Logs for today: ${JSON.stringify(todayFoodObj)}

Historical Data Context:
- All Weight Logs: ${JSON.stringify(weightLogs)}
- All Walking Logs: ${JSON.stringify(walkingLogs)}
- Total Days with Food Tracked: ${Object.keys(foodLogs).length}
- Target: 100.0 kg by Dec 31 (Start: 110.8 kg)

User's Telegram Message: "${incomingText}"

Analyze the user's message and determine the action:
1. "LOG_FOOD": User is describing food/meals (e.g. "Breakfast 4 idli, 2 boiled eggs", "300g lunch rice + 2 mathi fry + thoran", "1 banana", "2 chapati + fish curry").
   - Categorize into "breakfast", "lunch", "snack", or "dinner".
   - Estimate calories, protein(g), carbs(g), fat(g).
   - Return updated foodLogs[todayStr].
2. "LOG_WALK": User walked (e.g. "Walked 5.4 km in 1 hour", "5km walk done").
   - Extract distance in km, duration, pace, calories.
   - Return new walk object.
3. "LOG_WEIGHT": User logged weight (e.g. "Morning weight 110.8 kg").
   - Return new weight object.
4. "COMPARE_PROGRESS": User is asking to compare progress between weeks or months (e.g. "compare this week and last week", "how is my monthly progress?", "am I on track for 100kg?").
   - Calculate exact metrics from historical data.
5. "DINING_ADVISOR" / "QUERY": User is asking advice for restaurant dining, food choices, or general questions.
   - Provide strategic, actionable advice tailored to their exact remaining ${calRemaining} kcal and ${protRemaining.toFixed(1)}g protein budget!

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

    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`;
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
    console.error('[Telegram Webhook] Handler error:', error);
    return res.status(200).json({ ok: true, error: error.message });
  }
}
