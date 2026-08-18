/**
 * Deterministic Nutrition Calculator & Exact Gram Parser
 * Interprets user gram weights and quantities strictly without artificial inflation
 */

import { FOOD_DATABASE } from './foodDatabase.js';

/**
 * Sanitize food text and normalize special characters
 */
export function sanitizeInput(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/[=_\-—–]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}

/**
 * Match a text token against FOOD_DATABASE
 * Returns the matched food object and the canonical key, or null
 */
export function findFoodInDatabase(rawToken) {
  const cleaned = sanitizeInput(rawToken);
  if (!cleaned || cleaned.length < 2) return null;

  let bestFood = null;
  let bestKey = null;
  let maxMatchLength = 0;

  for (const [key, food] of Object.entries(FOOD_DATABASE)) {
    const candidates = [key, ...(food.aliases || [])];
    for (const cand of candidates) {
      const cleanCand = sanitizeInput(cand);
      // Word boundary or containment check
      const regex = new RegExp(`\\b${cleanCand.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      if (regex.test(cleaned) || cleaned.includes(cleanCand)) {
        if (cleanCand.length > maxMatchLength) {
          bestFood = food;
          bestKey = key;
          maxMatchLength = cleanCand.length;
        }
      }
    }
  }

  return bestFood ? { key: bestKey, food: bestFood } : null;
}

/**
 * Parse an individual food item segment
 * Handles exact gram weights, piece counts, and size modifiers
 */
export function parseFoodSegment(segmentText) {
  const text = sanitizeInput(segmentText);
  if (!text) return null;

  // 1. Check for exact gram weights (e.g. "190g", "190 g", "40 grams", "130 gm edible")
  const gramMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:g|gm|grams|gram)\b/i);
  let weightGrams = gramMatch ? parseFloat(gramMatch[1]) : null;

  // 2. Check for count/quantity (e.g. "4 small idli", "2 eggs", "1.5 chapatis", "half banana")
  let quantity = 1;
  const halfMatch = /\b(?:1\/2|half|0\.5)\b/i.test(text);
  const countMatch = text.match(/\b(\d+(?:\.\d+)?)\s*(?:pieces?|nos?|pcs?|piece|eggs?|idlis?|idli|chapatis?|dosa|bananas?|oranges?|apples?|scoops?)?\b/i);

  if (halfMatch) {
    quantity = 0.5;
  } else if (countMatch && !gramMatch) {
    const parsedNum = parseFloat(countMatch[1]);
    if (!isNaN(parsedNum) && parsedNum > 0 && parsedNum < 100) {
      quantity = parsedNum;
    }
  }

  // 3. Check for size modifier
  let sizeMultiplier = 1.0;
  if (/\b(?:small|tiny|mini)\b/i.test(text)) {
    sizeMultiplier = 0.8;
  } else if (/\b(?:large|big|jumbo)\b/i.test(text)) {
    sizeMultiplier = 1.25;
  }

  // 4. Match against verified database
  const matchResult = findFoodInDatabase(text);

  if (matchResult) {
    const { food } = matchResult;
    let computedWeight = weightGrams;

    // If gram weight wasn't explicitly given, use standard edible weight per unit
    if (!computedWeight) {
      const unitWeight = food.edibleWeightPerUnit || 100;
      computedWeight = quantity * unitWeight * sizeMultiplier;
    }

    // Exact deterministic calculation based on 100g basis
    const ratio = computedWeight / 100;
    const calories = Math.round(food.caloriesPer100g * ratio);
    const protein = parseFloat((food.proteinPer100g * ratio).toFixed(1));
    const carbs = parseFloat((food.carbsPer100g * ratio).toFixed(1));
    const fat = parseFloat((food.fatPer100g * ratio).toFixed(1));
    const fiber = parseFloat(((food.fiberPer100g || 0) * ratio).toFixed(1));

    return {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: food.canonicalName,
      canonicalName: food.canonicalName,
      rawInput: segmentText.trim(),
      quantity,
      unit: weightGrams ? 'g' : (food.edibleWeightPerUnit ? 'piece' : 'serving'),
      weightGrams: parseFloat(computedWeight.toFixed(1)),
      weightType: food.weightType || 'cooked',
      calories,
      protein,
      carbs,
      fat,
      fiber,
      confidence: food.confidence || 'verified',
      source: 'verified_db',
      healthTip: food.healthTip || '',
      isAiGenerated: false
    };
  }

  // If not matched in database, return structured unidentified token for AI parser
  return {
    rawInput: segmentText.trim(),
    weightGrams,
    quantity,
    sizeMultiplier,
    isUnidentified: true
  };
}

/**
 * Parse a multi-item meal string into structured items and aggregate totals
 * e.g. "Cooked white rice 190g + 60g fish fry + kumbalanga curry 60g + 2 boiled eggs"
 */
export function calculateMealNutrition(inputString) {
  if (!inputString || typeof inputString !== 'string') {
    return {
      items: [],
      unidentifiedSegments: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      totalWeightGrams: 0,
      allVerified: true
    };
  }

  // Split on delimiter tokens: '+', ',', 'and', '&', '\n', 'with'
  const rawSegments = inputString.split(/,|\band\b|\+|\&|\n|\bwith\b/i);
  const items = [];
  const unidentifiedSegments = [];

  for (const rawSeg of rawSegments) {
    const trimmed = rawSeg.trim();
    if (!trimmed || trimmed.length < 2) continue;

    const parsed = parseFoodSegment(trimmed);
    if (parsed) {
      if (parsed.isUnidentified) {
        unidentifiedSegments.push(parsed);
      } else {
        items.push(parsed);
      }
    }
  }

  const totalCalories = items.reduce((sum, i) => sum + i.calories, 0);
  const totalProtein = parseFloat(items.reduce((sum, i) => sum + i.protein, 0).toFixed(1));
  const totalCarbs = parseFloat(items.reduce((sum, i) => sum + i.carbs, 0).toFixed(1));
  const totalFat = parseFloat(items.reduce((sum, i) => sum + i.fat, 0).toFixed(1));
  const totalFiber = parseFloat(items.reduce((sum, i) => sum + (i.fiber || 0), 0).toFixed(1));
  const totalWeightGrams = parseFloat(items.reduce((sum, i) => sum + (i.weightGrams || 0), 0).toFixed(1));

  return {
    items,
    unidentifiedSegments,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    totalFiber,
    totalWeightGrams,
    allVerified: unidentifiedSegments.length === 0
  };
}
