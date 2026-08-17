// Vercel Serverless Function: WhatsApp AI Health Coach Webhook
// Connects WhatsApp (Twilio / Meta Cloud API) directly to Supabase and Google Gemini AI

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

export default async function handler(req, res) {
  // Allow only POST requests from WhatsApp Webhooks
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'APEX 100 WhatsApp Webhook Active', endpoint: '/api/whatsapp' });
  }

  try {
    // 1. Extract message from Twilio or Meta WhatsApp Webhook body
    const body = req.body || {};
    const incomingText = (body.Body || body.message || body.text || '').trim();
    const sender = body.From || 'primary_user';

    if (!incomingText) {
      return res.status(200).send('<Response><Message>Hi! Send your meal, walk, or weight update to log it to APEX 100.</Message></Response>');
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // 2. Connect to Supabase
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return res.status(200).send(`<Response><Message>⚠️ Supabase is not configured on Vercel. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel Environment Variables.</Message></Response>`);
    }

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

    // 3. AI System Prompt with Google Gemini
    const systemPrompt = `You are the dedicated AI Health Coach for APEX 100 Personal Transformation Dashboard.
Today's Date: ${todayStr}.

Current Dashboard Status:
- Today's Food Logs for ${todayStr}: ${JSON.stringify(foodLogs[todayStr] || { breakfast: [], lunch: [], snack: [], dinner: [] })}
- Total Water Consumed: ${waterData.consumedMl} ml / ${waterData.targetMl} ml
- Daily Calorie Target: 2,100 kcal | Daily Protein Goal: 130g | Daily Walk Target: 5.0 km

User's WhatsApp Message: "${incomingText}"

Your Task:
Analyze the user's message and determine the action:
1. "LOG_FOOD": User is describing what they ate (e.g. "Breakfast 4 idli, 2 boiled eggs", "300g lunch rice + fish fry + thoran", "Snack 1 orange").
   - Extract meal category (breakfast, lunch, snack, dinner)
   - Calculate realistic calories, protein(g), carbs(g), fat(g)
   - Add new item to foodLogs[todayStr][category]
2. "LOG_WALK": User walked (e.g. "Walked 5.4 km in 1 hour", "5 km walk done").
   - Extract distance in km, duration in mins, pace, calories
   - Add to walkingLogs array
   - Mark "walk" habit as true
3. "LOG_WATER": User drank water (e.g. "Drank 500ml water", "1 bottle water").
   - Add amount to waterData.consumedMl
4. "LOG_WEIGHT": User logged morning/evening weight (e.g. "Weight 110.8 kg").
   - Add to weightLogs array
5. "QUERY": User is asking a question (e.g. "How many calories left?", "What should I eat for dinner?").
   - Answer based on remaining calories/protein for today.

Respond strictly in this JSON structure with no markdown backticks:
{
  "action": "LOG_FOOD" | "LOG_WALK" | "LOG_WATER" | "LOG_WEIGHT" | "QUERY",
  "updatedFoodLogs": null or updated foodLogs object,
  "newWalkLog": null or new walk object,
  "newWeightLog": null or new weight object,
  "waterToAddMl": 0,
  "whatsappReply": "A clean, motivating WhatsApp message formatted with emojis and clear stats summarizing what was logged and what is remaining for the day."
}`;

    let replyMessage = "";
    let nextPayload = { ...currentPayload };

    if (GEMINI_API_KEY) {
      // Call Gemini 1.5 Flash
      const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const aiResponse = await fetch(geminiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const parsedAI = JSON.parse(rawText.replace(/^```json/, '').replace(/```$/, '').trim());

        replyMessage = parsedAI.whatsappReply;

        // Apply state updates
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

        // Save updated state to Supabase
        await supabase
          .from('user_transformation_data')
          .upsert({
            id: 'primary_user',
            payload: nextPayload,
            updated_at: new Date().toISOString()
          });
      } else {
        replyMessage = `✅ Message received: "${incomingText}". (Gemini AI parsing fallback)`;
      }
    } else {
      replyMessage = `✅ APEX 100 Bot: Add your GEMINI_API_KEY in Vercel Environment Variables to enable live AI reasoning.`;
    }

    // Return TwiML XML format (Twilio WhatsApp) & plain text
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>${replyMessage}</Message>
</Response>`);

  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>⚠️ Error processing update: ${error.message}</Message>
</Response>`);
  }
}
