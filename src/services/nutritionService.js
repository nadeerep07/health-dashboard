/**
 * Master Nutrition Domain Service
 * Enforces: User Input -> Exact Gram Parser -> Verified DB -> AI Only for Unknown Foods -> Validation Layer
 */

import { calculateMealNutrition } from './nutrition/nutritionCalculator.js';
import { parseUnknownFoodsWithAI } from './nutrition/aiNutritionParser.js';
import { validateMealTotals } from './nutrition/nutritionValidator.js';

export const GEMINI_STORAGE_KEY = 'transformation_gemini_api_key';

export function getStoredGeminiKey() {
  if (typeof window === 'undefined' || !window.localStorage) return '';
  return window.localStorage.getItem(GEMINI_STORAGE_KEY) || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : '') || '';
}

export function setStoredGeminiKey(key) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  if (key) {
    window.localStorage.setItem(GEMINI_STORAGE_KEY, key.trim());
  } else {
    window.localStorage.removeItem(GEMINI_STORAGE_KEY);
  }
}

/**
 * Main function to estimate nutrition for any input string
 * Prioritizes deterministic verified database first.
 */
export async function estimateNutrition(inputString, customApiKey = null) {
  if (!inputString || typeof inputString !== 'string') {
    return {
      items: [],
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      totalWeightGrams: 0,
      healthTip: 'Please enter what you ate (e.g. "190g cooked white rice + 60g fish fry + 2 boiled eggs").',
      confidence: 'verified',
      isAiGenerated: false,
      flaggedForReview: false
    };
  }

  // 1. Run deterministic parser against verified database
  const deterministicResult = calculateMealNutrition(inputString);
  let finalItems = [...deterministicResult.items];

  // 2. If there are unknown/unidentified food tokens, query AI extractor only for those tokens
  if (deterministicResult.unidentifiedSegments.length > 0) {
    const apiKey = customApiKey || getStoredGeminiKey();
    const aiItems = await parseUnknownFoodsWithAI(deterministicResult.unidentifiedSegments, apiKey);
    finalItems.push(...aiItems);
  }

  // 3. Compute final aggregate sums
  const calories = finalItems.reduce((sum, item) => sum + item.calories, 0);
  const protein = parseFloat(finalItems.reduce((sum, item) => sum + item.protein, 0).toFixed(1));
  const carbs = parseFloat(finalItems.reduce((sum, item) => sum + item.carbs, 0).toFixed(1));
  const fat = parseFloat(finalItems.reduce((sum, item) => sum + item.fat, 0).toFixed(1));
  const fiber = parseFloat(finalItems.reduce((sum, item) => sum + (item.fiber || 0), 0).toFixed(1));
  const totalWeightGrams = parseFloat(finalItems.reduce((sum, item) => sum + (item.weightGrams || 0), 0).toFixed(1));

  // Determine overall confidence
  const hasAi = finalItems.some(i => i.isAiGenerated);
  const hasNeedsReview = finalItems.some(i => i.confidence === 'needs_review');
  const confidence = hasNeedsReview ? 'needs_review' : (hasAi ? 'ai_estimated' : 'verified');

  // Build helpful summary tip
  let tips = finalItems.map(i => i.healthTip).filter(Boolean);
  let healthTip = tips.length > 0 ? tips.slice(0, 2).join(' • ') : 'Verified nutritional calculation.';
  if (protein >= 25) {
    healthTip = `💪 High Protein (+${protein.toFixed(1)}g)! Excellent for muscle retention during fat loss. ${healthTip}`;
  }

  const mealSummary = {
    items: finalItems,
    name: finalItems.map(i => i.name).join(' + ') || inputString,
    dishName: finalItems.map(i => i.name).join(' + ') || inputString,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    totalWeightGrams,
    weightGrams: totalWeightGrams,
    weightType: finalItems.length === 1 ? finalItems[0].weightType : 'cooked',
    confidence,
    healthTip,
    isAiGenerated: hasAi
  };

  // 4. Run through sanity validation layer
  const validation = validateMealTotals({
    items: finalItems,
    totalCalories: calories,
    totalWeightGrams
  });

  if (validation.flaggedForReview) {
    mealSummary.flaggedForReview = true;
    mealSummary.reviewMessage = validation.reviewMessage;
    mealSummary.warnings = validation.warnings;
  }

  return mealSummary;
}
