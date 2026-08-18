/**
 * Nutrition Safety & Sanity Validation Layer
 * Reconciles macros with energy, validates physical bounds, and flags hallucinations
 */

export function validateNutritionEntry(entry) {
  const warnings = [];
  let flaggedForReview = false;

  const calories = Number(entry.calories) || 0;
  const protein = Number(entry.protein) || 0;
  const carbs = Number(entry.carbs) || 0;
  const fat = Number(entry.fat) || 0;
  const weightGrams = Number(entry.weightGrams) || 0;
  const name = (entry.name || entry.canonicalName || '').toLowerCase();

  // 1. Macro Energy Reconciliation (Atwater factors: 4 kcal/g protein, 4 kcal/g carbs, 9 kcal/g fat)
  const expectedCalories = (protein * 4) + (carbs * 4) + (fat * 9);
  if (expectedCalories > 0 && calories > 0) {
    const diff = Math.abs(calories - expectedCalories);
    const percentageDiff = (diff / calories) * 100;

    if (percentageDiff > 30 && diff > 40) {
      warnings.push(`Macro energy mismatch: Stated ${calories} kcal vs calculated ${Math.round(expectedCalories)} kcal from P/C/F.`);
      flaggedForReview = true;
    }
  }

  // 2. Physical Density Bounds (Max possible caloric density is pure fat at 9 kcal/g)
  if (weightGrams > 0) {
    const density = calories / weightGrams;
    if (density > 9.0) {
      warnings.push(`Physically impossible caloric density: ${density.toFixed(1)} kcal/g exceeds pure fat (9 kcal/g).`);
      flaggedForReview = true;
    }
  }

  // 3. Domain Specific Sanity Checks
  // Rice sanity check (cooked rice density is ~1.3 kcal/g due to 65% water)
  if (name.includes('rice') && weightGrams > 0) {
    if (calories > weightGrams * 2.2) {
      warnings.push(`Cooked rice calorie density is suspiciously high (${calories} kcal for ${weightGrams}g).`);
      flaggedForReview = true;
    }
  }

  // Egg sanity check (whole egg is max ~13% protein)
  if (name.includes('egg') && !name.includes('powder')) {
    if (protein > 20 && (entry.quantity || 1) <= 2) {
      warnings.push(`Unrealistic protein count for ${entry.quantity || 1} eggs: ${protein}g.`);
      flaggedForReview = true;
    }
  }

  // Fruit sanity check (fruits are low-calorie and virtually zero fat)
  if ((name.includes('pomegranate') || name.includes('banana') || name.includes('apple') || name.includes('orange')) && weightGrams > 0) {
    if (calories > weightGrams * 1.5) {
      warnings.push(`Unrealistic calorie count for fresh fruit (${calories} kcal for ${weightGrams}g).`);
      flaggedForReview = true;
    }
  }

  return {
    isValid: !flaggedForReview,
    warnings,
    flaggedForReview,
    reviewMessage: flaggedForReview ? 'Nutrition estimate needs review.' : null
  };
}

/**
 * Validate an entire meal result
 */
export function validateMealTotals(mealResult) {
  const warnings = [];
  let flaggedForReview = false;

  for (const item of mealResult.items || []) {
    const validation = validateNutritionEntry(item);
    if (validation.flaggedForReview) {
      flaggedForReview = true;
      warnings.push(...validation.warnings);
    }
  }

  // Meal total sanity check
  const totalCal = Number(mealResult.totalCalories) || 0;
  const totalWeight = Number(mealResult.totalWeightGrams) || 0;

  if (totalWeight > 0 && totalCal > totalWeight * 3.5 && !mealResult.items?.some(i => (i.name || '').includes('oil') || (i.name || '').includes('nuts'))) {
    warnings.push(`Meal calorie total (${totalCal} kcal) is disproportionately high for ${totalWeight}g.`);
    flaggedForReview = true;
  }

  return {
    isValid: !flaggedForReview,
    warnings,
    flaggedForReview,
    reviewMessage: flaggedForReview ? 'Nutrition estimate needs review.' : null
  };
}
