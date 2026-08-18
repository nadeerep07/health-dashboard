/**
 * AI Entity Extractor for Unidentified/Custom Foods
 * Uses Gemini AI only to structure unknown foods into per-100g bases,
 * then validates through the deterministic validation layer.
 */

import { validateNutritionEntry } from './nutritionValidator.js';

export async function parseUnknownFoodsWithAI(unidentifiedSegments, apiKey) {
  if (!unidentifiedSegments || unidentifiedSegments.length === 0 || !apiKey) {
    return [];
  }

  const queryText = unidentifiedSegments.map(s => s.rawInput).join('; ');
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are an expert sports dietitian. Convert these unidentified foods into structured nutritional data per 100g: "${queryText}".
Rules:
1. Always normalize nutrition to a 100g basis.
2. Determine weightType: "raw", "cooked", or "edible".
3. If portion weight was provided in input (e.g. 150g), extract it in "statedWeightGrams". Otherwise estimate realistic single serving weight.
4. Keep values physically realistic (cooked veggies/curries: 40-100 kcal/100g, lean meats: 120-180 kcal/100g, oils/nuts: 600-900 kcal/100g).

Respond strictly in JSON format:
{
  "items": [
    {
      "name": "Standard canonical name",
      "weightType": "cooked" | "raw" | "edible",
      "statedWeightGrams": 150,
      "caloriesPer100g": 90,
      "proteinPer100g": 3.0,
      "carbsPer100g": 12.0,
      "fatPer100g": 3.5,
      "fiberPer100g": 2.0,
      "healthTip": "Brief diet tip"
    }
  ]
}`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!res.ok) {
      throw new Error(`AI Gateway Error: ${res.statusText}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsed = JSON.parse(rawText.replace(/^```json/, '').replace(/```$/, '').trim());

    const resultItems = [];
    for (const rawItem of (parsed.items || [])) {
      const weightGrams = Number(rawItem.statedWeightGrams) || 100;
      const ratio = weightGrams / 100;
      const calories = Math.round((Number(rawItem.caloriesPer100g) || 100) * ratio);
      const protein = parseFloat(((Number(rawItem.proteinPer100g) || 3) * ratio).toFixed(1));
      const carbs = parseFloat(((Number(rawItem.carbsPer100g) || 15) * ratio).toFixed(1));
      const fat = parseFloat(((Number(rawItem.fatPer100g) || 3) * ratio).toFixed(1));
      const fiber = parseFloat(((Number(rawItem.fiberPer100g) || 1) * ratio).toFixed(1));

      const entry = {
        id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: rawItem.name || 'Custom Food',
        canonicalName: rawItem.name || 'Custom Food',
        quantity: 1,
        unit: 'g',
        weightGrams,
        weightType: rawItem.weightType || 'cooked',
        calories,
        protein,
        carbs,
        fat,
        fiber,
        confidence: 'ai_estimated',
        source: 'gemini_ai',
        healthTip: rawItem.healthTip || 'AI estimated breakdown',
        isAiGenerated: true
      };

      // Run sanity check
      const validation = validateNutritionEntry(entry);
      if (validation.flaggedForReview) {
        entry.flaggedForReview = true;
        entry.reviewMessage = validation.reviewMessage;
      }

      resultItems.push(entry);
    }

    return resultItems;
  } catch (err) {
    console.warn('AI entity parsing error, using heuristic fallback:', err);
    // Safe heuristic fallback for unidentified segments
    return unidentifiedSegments.map((s, idx) => {
      const weight = s.weightGrams || (100 * (s.quantity || 1));
      const ratio = weight / 100;
      return {
        id: `fallback-${Date.now()}-${idx}`,
        name: s.rawInput || 'Side dish',
        canonicalName: s.rawInput || 'Side dish',
        quantity: s.quantity || 1,
        unit: 'g',
        weightGrams: weight,
        weightType: 'cooked',
        calories: Math.round(90 * ratio),
        protein: parseFloat((2.5 * ratio).toFixed(1)),
        carbs: parseFloat((12.0 * ratio).toFixed(1)),
        fat: parseFloat((3.0 * ratio).toFixed(1)),
        fiber: parseFloat((1.5 * ratio).toFixed(1)),
        confidence: 'needs_review',
        source: 'heuristic_fallback',
        healthTip: 'Please verify portions and macros.',
        isAiGenerated: false
      };
    });
  }
}
