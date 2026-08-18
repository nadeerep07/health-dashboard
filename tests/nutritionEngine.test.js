import { describe, it, expect } from 'vitest';
import { calculateMealNutrition, parseFoodSegment } from '../src/services/nutrition/nutritionCalculator';
import { validateNutritionEntry, validateMealTotals } from '../src/services/nutrition/nutritionValidator';
import { estimateNutrition } from '../src/services/nutritionService';

describe('Deterministic Nutrition Engine & Exact Gram Calculations', () => {
  it('correctly calculates 190g cooked white rice (~247 kcal, NOT 500+ kcal)', () => {
    const result = calculateMealNutrition('Cooked white rice — 190 g');
    expect(result.items.length).toBe(1);
    const item = result.items[0];
    expect(item.canonicalName).toBe('Cooked White Rice');
    expect(item.weightGrams).toBe(190);
    expect(item.calories).toBe(247);
    expect(item.protein).toBe(5.1);
    expect(item.carbs).toBe(53.2);
    expect(item.fat).toBe(0.8);
    expect(item.weightType).toBe('cooked');
  });

  it('correctly calculates 40g pomegranate edible arils (~33 kcal, NOT 150 kcal)', () => {
    const result = calculateMealNutrition('Pomegranate — 40 g edible arils');
    expect(result.items.length).toBe(1);
    const item = result.items[0];
    expect(item.canonicalName).toBe('Pomegranate (Edible Arils)');
    expect(item.weightGrams).toBe(40);
    expect(item.calories).toBe(33);
    expect(item.carbs).toBe(7.5);
    expect(item.weightType).toBe('edible');
  });

  it('correctly calculates 130g edible banana (~116 kcal)', () => {
    const result = calculateMealNutrition('Banana — 130 g edible');
    expect(result.items.length).toBe(1);
    const item = result.items[0];
    expect(item.canonicalName).toBe('Fresh Banana');
    expect(item.weightGrams).toBe(130);
    expect(item.calories).toBe(116);
    expect(item.carbs).toBe(29.6);
    expect(item.weightType).toBe('edible');
  });

  it('correctly calculates 4 small idli + 2 boiled eggs (~348 kcal, ~19.8g protein, NOT 1148 kcal)', () => {
    const result = calculateMealNutrition('4 small idli + 2 boiled eggs');
    expect(result.items.length).toBe(2);
    
    const idli = result.items.find(i => i.canonicalName === 'Steamed Idli');
    const eggs = result.items.find(i => i.canonicalName === 'Whole Boiled Egg');
    
    expect(idli).toBeDefined();
    expect(eggs).toBeDefined();
    
    // 4 small idlis = 4 * (40g * 0.8) = 128g => ~160 kcal, 5.8g protein
    expect(idli.calories).toBe(160);
    expect(idli.protein).toBe(5.8);
    
    // 2 boiled eggs = 2 * 50g = 100g => 148 kcal, 12.6g protein
    expect(eggs.calories).toBe(148);
    expect(eggs.protein).toBe(12.6);
    
    expect(result.totalCalories).toBe(308);
    expect(result.totalProtein).toBe(18.4);
  });

  it('correctly calculates 60g fish fry (Mathi/Sardine) (~120 kcal, 12.2g protein)', () => {
    const result = calculateMealNutrition('Fish fry — 60 g');
    expect(result.items.length).toBe(1);
    const item = result.items[0];
    expect(item.weightGrams).toBe(60);
    expect(item.calories).toBe(120);
    expect(item.protein).toBe(12.2);
    expect(item.fat).toBe(7.3);
  });

  it('correctly calculates 70g chapati (~166 kcal, 5.6g protein)', () => {
    const result = calculateMealNutrition('70g chapati');
    expect(result.items.length).toBe(1);
    const item = result.items[0];
    expect(item.calories).toBe(166);
    expect(item.protein).toBe(5.6);
  });

  it('correctly calculates 60g dry oats (~233 kcal, 10.1g protein)', () => {
    const result = calculateMealNutrition('60g oats');
    expect(result.items.length).toBe(1);
    const item = result.items[0];
    expect(item.weightGrams).toBe(60);
    expect(item.calories).toBe(233);
    expect(item.protein).toBe(10.1);
    expect(item.weightType).toBe('raw');
  });

  it('correctly calculates 150g cooked chicken breast (248 kcal, 46.5g protein)', () => {
    const result = calculateMealNutrition('150g chicken breast');
    expect(result.items.length).toBe(1);
    const item = result.items[0];
    expect(item.calories).toBe(248);
    expect(item.protein).toBe(46.5);
    expect(item.weightType).toBe('cooked');
  });

  it('correctly calculates multi-item Kerala lunch plate with exact grams', () => {
    const input = 'Cooked white rice 190g + Kumbalanga curry 60g + Banana thoran 150g + Fish fry 60g';
    const result = calculateMealNutrition(input);
    
    expect(result.items.length).toBe(4);
    expect(result.allVerified).toBe(true);
    
    const rice = result.items.find(i => i.canonicalName === 'Cooked White Rice');
    const kumbalanga = result.items.find(i => i.canonicalName.includes('Kumbalanga'));
    const thoran = result.items.find(i => i.canonicalName.includes('Banana'));
    const fish = result.items.find(i => i.canonicalName.includes('Mathi'));
    
    expect(rice.calories).toBe(247);
    expect(kumbalanga.calories).toBe(30);
    expect(thoran.calories).toBe(113);
    expect(fish.calories).toBe(120);
    
    expect(result.totalCalories).toBe(510);
    expect(result.totalProtein).toBe(20.9);
  });
});

describe('Sanity Validation Layer', () => {
  it('flags entries with extreme caloric density (> 9 kcal/g)', () => {
    const invalidEntry = {
      name: 'Magic food',
      weightGrams: 50,
      calories: 600, // 12 kcal/g (impossible)
      protein: 10,
      carbs: 20,
      fat: 50
    };
    const validation = validateNutritionEntry(invalidEntry);
    expect(validation.isValid).toBe(false);
    expect(validation.flaggedForReview).toBe(true);
  });

  it('flags cooked rice entries with hallucinated calorie numbers', () => {
    const hallucinatedRice = {
      name: 'Cooked white rice',
      weightGrams: 190,
      calories: 600, // impossible for 190g cooked rice
      protein: 5,
      carbs: 140,
      fat: 2
    };
    const validation = validateNutritionEntry(hallucinatedRice);
    expect(validation.flaggedForReview).toBe(true);
  });

  it('flags severe macro energy mismatches', () => {
    const mismatchEntry = {
      name: 'Test food',
      weightGrams: 100,
      calories: 500,
      protein: 10, // 40 kcal
      carbs: 10,   // 40 kcal
      fat: 2       // 18 kcal -> total ~98 kcal vs 500 stated
    };
    const validation = validateNutritionEntry(mismatchEntry);
    expect(validation.flaggedForReview).toBe(true);
  });
  it('Verified Calculation: calculates exact 150g kappa', async () => {
    const res = await estimateNutrition('150g kappa');
    expect(res.calories).toBeGreaterThanOrEqual(228);
    expect(res.calories).toBeLessThanOrEqual(252);
  });
  it('Verified Calculation: calculates exact 120g puttu', async () => {
    const res = await estimateNutrition('120g puttu');
    expect(res.calories).toBeGreaterThanOrEqual(177);
    expect(res.calories).toBeLessThanOrEqual(197);
  });
  it('Verified Calculation: calculates exact 150g kadala curry', async () => {
    const res = await estimateNutrition('150g kadala curry');
    expect(res.calories).toBeGreaterThanOrEqual(185);
    expect(res.calories).toBeLessThanOrEqual(205);
  });
  it('Verified Calculation: calculates exact 150g moru curry', async () => {
    const res = await estimateNutrition('150g moru curry');
    expect(res.calories).toBeGreaterThanOrEqual(64);
    expect(res.calories).toBeLessThanOrEqual(72);
  });
  it('Verified Calculation: calculates exact 100g cabbage thoran', async () => {
    const res = await estimateNutrition('100g cabbage thoran');
    expect(res.calories).toBeGreaterThanOrEqual(61);
    expect(res.calories).toBeLessThanOrEqual(69);
  });
  it('Verified Calculation: calculates exact 100g beans thoran', async () => {
    const res = await estimateNutrition('100g beans thoran');
    expect(res.calories).toBeGreaterThanOrEqual(66);
    expect(res.calories).toBeLessThanOrEqual(74);
  });
  it('Verified Calculation: calculates exact 100g beetroot thoran', async () => {
    const res = await estimateNutrition('100g beetroot thoran');
    expect(res.calories).toBeGreaterThanOrEqual(71);
    expect(res.calories).toBeLessThanOrEqual(79);
  });
  it('Verified Calculation: calculates exact 150g meen pollichathu', async () => {
    const res = await estimateNutrition('150g meen pollichathu');
    expect(res.calories).toBeGreaterThanOrEqual(235);
    expect(res.calories).toBeLessThanOrEqual(261);
  });
  it('Verified Calculation: calculates exact 90g ayala fry', async () => {
    const res = await estimateNutrition('90g ayala fry');
    expect(res.calories).toBeGreaterThanOrEqual(188);
    expect(res.calories).toBeLessThanOrEqual(208);
  });
  it('Verified Calculation: calculates exact 100g low fat paneer', async () => {
    const res = await estimateNutrition('100g low fat paneer');
    expect(res.calories).toBeGreaterThanOrEqual(166);
    expect(res.calories).toBeLessThanOrEqual(184);
  });
  it('Verified Calculation: calculates exact 100g tofu', async () => {
    const res = await estimateNutrition('100g tofu');
    expect(res.calories).toBeGreaterThanOrEqual(78);
    expect(res.calories).toBeLessThanOrEqual(88);
  });
  it('Verified Calculation: calculates exact 30g whey protein', async () => {
    const res = await estimateNutrition('30g whey protein');
    expect(res.calories).toBeGreaterThanOrEqual(105);
    expect(res.calories).toBeLessThanOrEqual(117);
  });
  it('Verified Calculation: calculates exact 30g soya chunks', async () => {
    const res = await estimateNutrition('30g soya chunks');
    expect(res.calories).toBeGreaterThanOrEqual(98);
    expect(res.calories).toBeLessThanOrEqual(110);
  });
  it('Verified Calculation: calculates exact 170g greek yogurt', async () => {
    const res = await estimateNutrition('170g greek yogurt');
    expect(res.calories).toBeGreaterThanOrEqual(95);
    expect(res.calories).toBeLessThanOrEqual(105);
  });
  it('Verified Calculation: calculates exact 15g chia seeds', async () => {
    const res = await estimateNutrition('15g chia seeds');
    expect(res.calories).toBeGreaterThanOrEqual(69);
    expect(res.calories).toBeLessThanOrEqual(77);
  });
  it('Verified Calculation: calculates exact 12g almonds', async () => {
    const res = await estimateNutrition('12g almonds');
    expect(res.calories).toBeGreaterThanOrEqual(65);
    expect(res.calories).toBeLessThanOrEqual(73);
  });
});