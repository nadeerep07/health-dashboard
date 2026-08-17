// AI Nutrition Estimation Engine for Health & Fat Loss Tracker
// Handles natural language queries, portion parsing, Kerala & South Asian foods, and global ingredients.

// Comprehensive Nutritional Database (per 100g or per standard serving)
const FOOD_DATABASE = {
  // --- KERALA & SOUTH ASIAN BREAKFAST & GRAINS ---
  'dosa': { name: 'Plain Dosa', serving: '1 piece (approx 80g)', cal: 120, p: 2.8, c: 22, f: 2.5, tip: 'Good carb source. Pair with eggs or green peas for high protein.' },
  'masala dosa': { name: 'Masala Dosa', serving: '1 piece (150g)', cal: 240, p: 4.5, c: 38, f: 8.0, tip: 'Potato filling adds extra carbs and fats. Keep to 1 piece.' },
  'ghee roast': { name: 'Ghee Roast Dosa', serving: '1 piece', cal: 185, p: 3.0, c: 24, f: 8.5, tip: 'Rich in ghee fats. Prefer plain or egg dosa for fat loss.' },
  'egg dosa': { name: 'Egg Dosa', serving: '1 piece', cal: 190, p: 9.0, c: 23, f: 7.0, tip: 'Great high-protein breakfast choice!' },
  'puttu': { name: 'Puttu (Rice/Ragi/Wheat)', serving: '1 small piece (approx 100g)', cal: 180, p: 3.5, c: 38, f: 1.5, tip: 'Steamed, oil-free carbohydrate. Moderate your portion.' },
  'appam': { name: 'Appam / Palappam', serving: '1 piece (60g)', cal: 100, p: 1.5, c: 20, f: 1.5, tip: 'Light and easily digestible. Pair with vegetable stew or egg curry.' },
  'idli': { name: 'Idli', serving: '1 piece (40g)', cal: 55, p: 1.8, c: 11, f: 0.2, tip: 'Steamed and virtually fat-free. Excellent breakfast staple.' },
  'idiyappam': { name: 'Idiyappam / String Hoppers', serving: '1 piece (50g)', cal: 75, p: 1.2, c: 16, f: 0.4, tip: 'Steamed rice noodles. Pair with protein curries.' },
  'porotta': { name: 'Kerala Porotta (Maida)', serving: '1 piece (80g)', cal: 280, p: 5.0, c: 38, f: 12.0, tip: 'High in refined flour and oil. Consume occasionally or replace with chapati.' },
  'chapati': { name: 'Whole Wheat Chapati / Roti', serving: '1 piece (40g)', cal: 95, p: 3.2, c: 18, f: 1.5, tip: 'Rich in dietary fiber and complex carbohydrates.' },
  'rice': { name: 'Cooked Rice (Matta / White / Brown)', serving: '100g cooked (approx 1/2 cup)', cal: 130, p: 2.7, c: 28, f: 0.4, tip: 'Aim for 150–200g portion at lunch.' },
  'brown rice': { name: 'Cooked Brown Rice', serving: '100g cooked', cal: 122, p: 2.6, c: 25, f: 0.9, tip: 'Higher fiber and slower digestion than white rice.' },
  'oats': { name: 'Cooked Rolled Oats', serving: '1 cup cooked (200g)', cal: 155, p: 5.5, c: 27, f: 2.8, tip: 'Rich in beta-glucan soluble fiber for fullness.' },

  // --- CURRIES & VEGETARIAN SIDES ---
  'green peas curry': { name: 'Green Peas Curry', serving: '100g (approx 1/2 cup)', cal: 115, p: 5.8, c: 16, f: 3.5, tip: 'Plant protein powerhouse with good fiber.' },
  'kadala curry': { name: 'Kadala Curry (Black Chickpeas)', serving: '100g', cal: 145, p: 7.2, c: 19, f: 4.8, tip: 'High protein and complex carbs, perfect with Puttu.' },
  'sambar': { name: 'Kerala Sambar with Vegetables', serving: '1 bowl (150g)', cal: 110, p: 4.5, c: 15, f: 3.5, tip: 'Nutrient-dense with toor dal and assorted vegetables.' },
  'coconut chutney': { name: 'Coconut Chutney', serving: '1 tbsp (20g)', cal: 45, p: 0.6, c: 1.5, f: 4.2, tip: 'Healthy fats, but calorie-dense. Stick to 1–2 tbsp.' },
  'dal curry': { name: 'Parippu / Dal Tadka', serving: '1 cup (150g)', cal: 150, p: 8.0, c: 22, f: 3.5, tip: 'Good everyday plant protein source.' },
  'vegetable thoran': { name: 'Vegetable Thoran (Cabbage/Beans/Beetroot)', serving: '100g', cal: 85, p: 2.5, c: 8, f: 4.5, tip: 'Excellent low-calorie micronutrient source.' },
  'salad': { name: 'Fresh Mixed Salad (Cucumber, Tomato, Carrot)', serving: '1 bowl (150g)', cal: 35, p: 1.2, c: 7, f: 0.3, tip: 'Zero guilt volume food! Eat before lunch/dinner.' },

  // --- PROTEINS & MEATS ---
  'boiled egg': { name: 'Whole Boiled Egg', serving: '1 large egg (50g)', cal: 74, p: 6.3, c: 0.4, f: 5.0, tip: 'Gold standard complete amino acid profile with healthy choline.' },
  'egg white': { name: 'Egg White', serving: '1 egg white (33g)', cal: 17, p: 3.6, c: 0.2, f: 0.1, tip: 'Pure lean protein. Perfect for boosting protein without calories.' },
  'omelette': { name: '2-Egg Omelette (with onion, chili)', serving: '1 serving (2 eggs)', cal: 180, p: 13.0, c: 2.0, f: 13.5, tip: 'Cook with minimal oil for an ideal high-protein meal.' },
  'chicken breast': { name: 'Grilled / Cooked Chicken Breast', serving: '100g cooked', cal: 165, p: 31.0, c: 0.0, f: 3.6, tip: 'Ultra-lean protein foundation for fat loss.' },
  'chicken curry': { name: 'Kerala Chicken Curry', serving: '100g (approx 2-3 pieces with gravy)', cal: 175, p: 18.0, c: 3.0, f: 10.0, tip: 'Focus on chicken pieces; moderate the oily gravy.' },
  'fish curry': { name: 'Kerala Fish Curry (Kudampuli style)', serving: '100g fish + light gravy', cal: 135, p: 19.5, c: 1.5, f: 5.5, tip: 'Low calorie, rich in Omega-3 fatty acids. Best daily protein!' },
  'grilled fish': { name: 'Grilled / Tawa Fish (Ayala/Kera/Pomfret)', serving: '100g', cal: 140, p: 22.0, c: 0.5, f: 5.5, tip: 'Lean, clean, high-satiety protein source.' },
  'fried fish': { name: 'Deep Fried Fish', serving: '1 piece (100g)', cal: 220, p: 20.0, c: 4.0, f: 14.0, tip: 'Absorbs cooking oil. Prefer shallow tawa fry or curry.' },
  'beef curry': { name: 'Kerala Beef Curry', serving: '100g', cal: 210, p: 24.0, c: 2.0, f: 12.0, tip: 'High protein and iron. Keep portions around 100–120g.' },
  'beef roast': { name: 'Kerala Beef Roast / Fry', serving: '100g', cal: 250, p: 25.0, c: 3.0, f: 15.5, tip: 'Cooked with coconut oil/pieces. Enjoy in moderation.' },

  // --- SOCIAL & SPECIAL MEALS ---
  'chicken mandi': { name: 'Chicken Mandi (Rice + Meat)', serving: '1 portion (approx 250g)', cal: 480, p: 32.0, c: 55, f: 15.0, tip: 'Focus on chicken; eat half the rice and skip mayonnaise!' },
  'chicken biryani': { name: 'Kerala / Thalassery Chicken Biryani', serving: '1 plate (approx 300g)', cal: 560, p: 28.0, c: 68, f: 20.0, tip: 'High calorie comfort food. Eat slowly and pair with onion raita.' },
  'mutton biryani': { name: 'Mutton Biryani', serving: '1 plate (approx 300g)', cal: 680, p: 30.0, c: 70, f: 30.0, tip: 'Very calorie dense. Limit to special cheat meals.' },
  'shawarma': { name: 'Chicken Shawarma Roll', serving: '1 roll', cal: 420, p: 22.0, c: 45, f: 17.0, tip: 'Ask for no-mayo or extra garlic paste/lettuce to cut 120 kcal.' },
  'alfahm': { name: 'Al Faham Grilled Chicken', serving: '1/4 chicken (leg/breast piece)', cal: 260, p: 34.0, c: 2.0, f: 13.0, tip: 'Charcoal grilled! Excellent high-protein dining out option.' },

  // --- FRUITS & SNACKS ---
  'banana': { name: 'Banana', serving: '1 medium banana (110g)', cal: 95, p: 1.2, c: 24, f: 0.3, tip: 'Natural potassium and fast energy before or after walks.' },
  'pomegranate': { name: 'Pomegranate Seeds', serving: '100g', cal: 83, p: 1.7, c: 19, f: 1.2, tip: 'Rich in polyphenols and potent antioxidants.' },
  'apple': { name: 'Apple', serving: '1 medium (150g)', cal: 80, p: 0.4, c: 21, f: 0.3, tip: 'Great filling snack with pectin fiber.' },
  'grapes': { name: 'Fresh Grapes', serving: '100g', cal: 69, p: 0.7, c: 18, f: 0.2, tip: 'Refreshing natural sweet craving crusher.' },
  'almonds': { name: 'Almonds / Badam', serving: '10 nuts (approx 12g)', cal: 70, p: 2.6, c: 2.5, f: 6.0, tip: 'Healthy fats and magnesium. Great mid-afternoon crunch.' },
  'peanuts': { name: 'Roasted Peanuts', serving: '30g handful', cal: 170, p: 7.5, c: 5.0, f: 14.0, tip: 'Affordable protein and healthy fats.' },
  'tea with milk': { name: 'Milk Tea / Chai with 1 tsp Sugar', serving: '1 small cup (120ml)', cal: 65, p: 2.2, c: 8.5, f: 2.5, tip: 'Switch to sugar-free or black tea to save calories.' },
  'black coffee': { name: 'Black Coffee (No Sugar)', serving: '1 cup (150ml)', cal: 2, p: 0.2, c: 0.2, f: 0.0, tip: 'Zero calorie metabolic and walk-energy booster!' },
  'whey protein': { name: 'Whey Protein Scoop in Water', serving: '1 scoop (30g)', cal: 120, p: 24.0, c: 2.5, f: 1.5, tip: 'Fastest convenient way to hit your 120–150g daily target.' }
};

// Smart Parser to estimate calories & macros from user input string
export function estimateNutritionWithAI(inputString) {
  if (!inputString || typeof inputString !== 'string') {
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      itemsFound: [],
      notes: 'No items recognized',
      healthTip: 'Please type the name of the food and quantity (e.g. 2 Dosa and 2 Boiled Eggs).'
    };
  }

  const query = inputString.toLowerCase().trim();
  
  // Try matching against our intelligent database
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let matchedItems = [];
  let tips = [];

  // Match multiple foods joined by 'and', '+', ',', '&'
  const subQueries = query.split(/,|\band\b|\+|\&|\n/);

  for (const part of subQueries) {
    const cleanPart = part.trim();
    if (!cleanPart) continue;

    // Extract quantity multiplier
    let quantity = 1;
    let weightInGrams = null;

    // Check for grams e.g. "150g", "200 grams"
    const gramMatch = cleanPart.match(/(\d+(?:\.\d+)?)\s*(?:g|gm|grams|gram)/i);
    if (gramMatch) {
      weightInGrams = parseFloat(gramMatch[1]);
    } else {
      // Check for count e.g. "2", "3 pieces", "1/2", "half"
      const halfMatch = cleanPart.match(/\b(?:1\/2|half|0\.5)\b/i);
      const countMatch = cleanPart.match(/^(\d+(?:\.\d+)?)/);
      if (halfMatch) {
        quantity = 0.5;
      } else if (countMatch) {
        quantity = parseFloat(countMatch[1]);
      }
    }

    // Find best match in database
    let bestKey = null;
    let longestMatchLen = 0;

    for (const key of Object.keys(FOOD_DATABASE)) {
      if (cleanPart.includes(key) && key.length > longestMatchLen) {
        bestKey = key;
        longestMatchLen = key.length;
      }
    }

    if (bestKey) {
      const food = FOOD_DATABASE[bestKey];
      let multiplier = quantity;

      if (weightInGrams && food.serving.includes('100g')) {
        multiplier = weightInGrams / 100;
      } else if (weightInGrams && food.serving.includes('piece')) {
        multiplier = weightInGrams / 80; // approximate standard
      }

      const itemCal = Math.round(food.cal * multiplier);
      const itemP = parseFloat((food.p * multiplier).toFixed(1));
      const itemC = parseFloat((food.c * multiplier).toFixed(1));
      const itemF = parseFloat((food.f * multiplier).toFixed(1));

      totalCalories += itemCal;
      totalProtein += itemP;
      totalCarbs += itemC;
      totalFat += itemF;

      matchedItems.push({
        name: `${quantity > 1 || weightInGrams ? (weightInGrams ? `${weightInGrams}g` : `${quantity}x`) : ''} ${food.name}`.trim(),
        cal: itemCal,
        p: itemP,
        c: itemC,
        f: itemF,
      });

      if (food.tip && !tips.includes(food.tip)) {
        tips.push(food.tip);
      }
    } else {
      // Fallback heuristics for unrecognized foods
      // Check if user gave explicit calories e.g. "300 kcal", "250 cal"
      const explicitCal = cleanPart.match(/(\d+)\s*(?:kcal|cal|calories)/i);
      const explicitProtein = cleanPart.match(/(\d+(?:\.\d+)?)\s*(?:g|gm)?\s*protein/i);

      if (explicitCal) {
        const calVal = parseInt(explicitCal[1]);
        const pVal = explicitProtein ? parseFloat(explicitProtein[1]) : Math.round(calVal * 0.05);
        totalCalories += calVal;
        totalProtein += pVal;
        totalCarbs += Math.round(calVal * 0.12);
        totalFat += Math.round(calVal * 0.04);
        matchedItems.push({ name: cleanPart, cal: calVal, p: pVal, c: Math.round(calVal * 0.12), f: Math.round(calVal * 0.04) });
      } else {
        // Generic food heuristic estimation (~180 kcal per standard dish)
        const estCal = Math.round(180 * quantity);
        const estP = Math.round(8 * quantity);
        const estC = Math.round(22 * quantity);
        const estF = Math.round(6 * quantity);
        totalCalories += estCal;
        totalProtein += estP;
        totalCarbs += estC;
        totalFat += estF;
        matchedItems.push({ name: cleanPart, cal: estCal, p: estP, c: estC, f: estF });
      }
    }
  }

  // General weight loss feedback
  let overallTip = tips.length > 0 ? tips.join(' • ') : 'Balanced meal. Track daily to stay within your 2,000–2,200 kcal budget.';
  if (totalProtein >= 30) {
    overallTip = `💪 High Protein Meal (+${totalProtein.toFixed(1)}g)! Excellent for muscle retention and fat burning. ${overallTip}`;
  } else if (totalCalories > 700) {
    overallTip = `⚠️ Higher Calorie Meal (~${totalCalories} kcal). Balance with a lighter dinner or an active evening walk.`;
  }

  return {
    calories: totalCalories,
    protein: parseFloat(totalProtein.toFixed(1)),
    carbs: parseFloat(totalCarbs.toFixed(1)),
    fat: parseFloat(totalFat.toFixed(1)),
    matchedItems,
    healthTip: overallTip
  };
}
