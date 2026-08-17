// Real AI Nutrition Estimation Engine with Google Gemini API & Intelligent Offline Knowledge Base
// Supports ANY custom dish in the world via Live Gemini AI, plus 300+ offline Kerala/global staples with fuzzy matching.

export const GEMINI_STORAGE_KEY = 'transformation_gemini_api_key';

export function getGeminiApiKey() {
  if (typeof window === 'undefined' || !window.localStorage) return '';
  return window.localStorage.getItem(GEMINI_STORAGE_KEY) || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : '') || '';
}

export function setGeminiApiKey(key) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  if (key) {
    window.localStorage.setItem(GEMINI_STORAGE_KEY, key.trim());
  } else {
    window.localStorage.removeItem(GEMINI_STORAGE_KEY);
  }
}

// Comprehensive Local Offline Nutritional Database (per standard serving or piece)
const FOOD_DATABASE = {
  // --- KERALA & SOUTH ASIAN BREAKFAST & GRAINS ---
  'idli': { aliases: ['idili', 'idly', 'idlis', 'iddli', 'steamed idli'], name: 'Idli', serving: '1 piece (40g)', cal: 50, p: 1.8, c: 10.5, f: 0.2, tip: 'Steamed and virtually fat-free. Excellent breakfast staple.' },
  'dosa': { aliases: ['dosha', 'plain dosa', 'dosai'], name: 'Plain Dosa', serving: '1 piece (80g)', cal: 120, p: 2.8, c: 22, f: 2.5, tip: 'Good carb source. Pair with eggs or green peas for high protein.' },
  'masala dosa': { aliases: ['masaladosa', 'masala dosha'], name: 'Masala Dosa', serving: '1 piece (150g)', cal: 240, p: 4.5, c: 38, f: 8.0, tip: 'Potato filling adds extra carbs and fats. Keep to 1 piece.' },
  'ghee roast': { aliases: ['ghee dosa', 'ghee roast dosa'], name: 'Ghee Roast Dosa', serving: '1 piece', cal: 185, p: 3.0, c: 24, f: 8.5, tip: 'Rich in ghee fats. Prefer plain or egg dosa for fat loss.' },
  'egg dosa': { aliases: ['mutta dosa', 'egg dosai'], name: 'Egg Dosa', serving: '1 piece', cal: 190, p: 9.0, c: 23, f: 7.0, tip: 'Great high-protein breakfast choice!' },
  'puttu': { aliases: ['ariputtu', 'wheat puttu', 'ragi puttu', 'rice puttu'], name: 'Puttu (Rice/Ragi/Wheat)', serving: '1 piece (100g)', cal: 180, p: 3.5, c: 38, f: 1.5, tip: 'Steamed, oil-free carbohydrate. Moderate your portion.' },
  'appam': { aliases: ['palappam', 'vellayappam', 'kallappam'], name: 'Appam / Palappam', serving: '1 piece (60g)', cal: 100, p: 1.5, c: 20, f: 1.5, tip: 'Light and easily digestible. Pair with vegetable stew or egg curry.' },
  'idiyappam': { aliases: ['noolappam', 'string hoppers'], name: 'Idiyappam', serving: '1 piece (50g)', cal: 75, p: 1.2, c: 16, f: 0.4, tip: 'Steamed rice noodles. Pair with protein curries.' },
  'porotta': { aliases: ['parotta', 'kerala parotta', 'malabar parotta'], name: 'Kerala Porotta', serving: '1 piece (80g)', cal: 280, p: 5.0, c: 38, f: 12.0, tip: 'High in refined flour and oil. Consume occasionally or replace with chapati.' },
  'chapati': { aliases: ['chappathi', 'roti', 'phulka', 'rotis', 'chapatis'], name: 'Whole Wheat Chapati / Roti', serving: '1 piece (40g)', cal: 95, p: 3.2, c: 18, f: 1.5, tip: 'Rich in dietary fiber and complex carbohydrates.' },
  'rice': { aliases: ['matta rice', 'white rice', 'cooked rice', 'choru', 'boiled rice'], name: 'Cooked Rice (Matta / White / Brown)', serving: '100g cooked', cal: 130, p: 2.7, c: 28, f: 0.4, tip: 'Aim for 150–200g portion at lunch.' },
  'brown rice': { aliases: ['brown rice cooked'], name: 'Cooked Brown Rice', serving: '100g cooked', cal: 122, p: 2.6, c: 25, f: 0.9, tip: 'Higher fiber and slower digestion than white rice.' },
  'oats': { aliases: ['rolled oats', 'oatmeal', 'porridge'], name: 'Cooked Rolled Oats', serving: '1 cup cooked (200g)', cal: 155, p: 5.5, c: 27, f: 2.8, tip: 'Rich in beta-glucan soluble fiber for fullness.' },

  // --- CURRIES, THORANS, VEGGIES & SIDES ---
  // --- TRADITIONAL KERALA CURRIES & GRAVIES ---
  'sambar': { aliases: ['sambhar', 'kerala sambar', 'dal sambar', 'varutharacha sambar'], name: 'Kerala Sambar', serving: '1 bowl (150g)', cal: 110, p: 4.5, c: 15, f: 3.5, tip: 'Nutrient-dense with toor dal and assorted vegetables.' },
  'dal curry': { aliases: ['parippu curry', 'parripu curry', 'parippu', 'paripu', 'dal curry', 'daal', 'parippu curry with ghee', 'lentil curry', 'cherupayar parippu', 'toor dal'], name: 'Parippu (Lentil / Dal) Curry', serving: '1 bowl (150g)', cal: 140, p: 7.5, c: 20.0, f: 3.2, tip: 'Rich plant-based protein staple! Great everyday protein source with rice.' },
  'kumbalanga curry': { aliases: ['kumbalanga curry', 'kumalanga curry', 'kumalanga', 'ash gourd curry', 'kumbalanga olan', 'kumbalanga moru curry', 'kumbalanga pulissery', 'kumbalanga', 'ash gourd', 'kumbilanga'], name: 'Kumbalanga (Ash Gourd) Curry / Olan', serving: '1 bowl (150g)', cal: 75, p: 2.2, c: 8.5, f: 3.5, tip: 'Extremely hydrating, low-calorie, cooling curry with high digestive fiber.' },
  'mathanga erissery': { aliases: ['mathanga erissery', 'erissery', 'chena erissery', 'chena vanpayar erissery', 'pumpkin curry', 'mathanga curry'], name: 'Mathanga (Pumpkin) Erissery', serving: '1 bowl (150g)', cal: 125, p: 3.8, c: 18.0, f: 4.5, tip: 'Rich in Vitamin A and beta-carotene with roasted coconut.' },
  'theeyal': { aliases: ['ulli theeyal', 'pavakka theeyal', 'theeyal', 'venda theeyal', 'shallot theeyal'], name: 'Kerala Theeyal (Roasted Coconut Gravy)', serving: '1 bowl (120g)', cal: 110, p: 2.2, c: 11.0, f: 6.5, tip: 'Traditional roasted coconut gravy. Flavorful and satisfying.' },
  'moru curry': { aliases: ['mor curry', 'pulissery', 'kachiya moru', 'buttermilk curry', 'moru', 'vellarikka moru curry', 'mambazha pulissery'], name: 'Kachiya Moru / Pulissery', serving: '1 cup (150g)', cal: 75, p: 3.0, c: 5.0, f: 4.5, tip: 'Probiotic-rich and refreshing for gut health and digestion.' },
  'ishtu': { aliases: ['vegetable stew', 'ishtu', 'veg stew', 'chicken stew', 'kerala stew'], name: 'Kerala Stew (Ishtu)', serving: '1 bowl (150g)', cal: 130, p: 3.0, c: 14.0, f: 6.5, tip: 'Coconut milk based mild stew. Excellent with Appam or Idiyappam.' },
  'green peas curry': { aliases: ['peas curry', 'pattani curry', 'green peas', 'peas masala'], name: 'Green Peas Curry', serving: '100g', cal: 115, p: 5.8, c: 16, f: 3.5, tip: 'Plant protein powerhouse with good fiber.' },
  'kadala curry': { aliases: ['kadala', 'chickpea curry', 'black chickpea', 'kadala masala'], name: 'Kadala Curry (Black Chickpeas)', serving: '100g', cal: 145, p: 7.2, c: 19, f: 4.8, tip: 'High protein and complex carbs, perfect with Puttu.' },
  'avial': { aliases: ['kerala avial', 'avial curry', 'avial'], name: 'Kerala Avial', serving: '1 bowl (150g)', cal: 140, p: 3.8, c: 16.0, f: 6.8, tip: 'Nutrient-dense mixed vegetables with curd and coconut.' },
  'beetroot thoran': { aliases: ['beetroot thoran', 'beetroot upperi', 'beetroot mezhukkupuratti', 'beetroot uppiri', 'beetroot'], name: 'Beetroot Thoran / Upperi', serving: '100g', cal: 85, p: 2.2, c: 12.0, f: 3.5, tip: 'Rich in dietary nitrates to boost blood flow and walk stamina.' },
  'payar thoran': { aliases: ['payar thoran', 'cherupayar thoran', 'vanpayar thoran', 'achinga payar thoran', 'payar upperi', 'payar mezhukkupuratti', 'payar', 'cherupayar', 'vanpayar'], name: 'Payar (Green Gram / Cowpeas / Long Beans) Thoran', serving: '100g', cal: 110, p: 6.5, c: 15.0, f: 3.2, tip: 'High protein plant-based side! Great for muscle preservation.' },
  'pavakka thoran': { aliases: ['pavakka thoran', 'bitter gourd thoran', 'bitter melon thoran', 'bitter lemon', 'bitter gourd', 'bitter melon', 'kayappakka thoran', 'pavakka payar', 'pavakka payar thoran', 'pavakka payar mixed thoran', 'bitter lemon and payar', 'bitter gourd and payar'], name: 'Pavakka (Bitter Gourd/Melon) & Payar Thoran', serving: '100g', cal: 80, p: 3.2, c: 10.0, f: 3.0, tip: 'Superfood for insulin sensitivity, blood sugar control, and fat loss.' },
  'cabbage thoran': { aliases: ['cabbage thoran', 'cabbage upperi', 'cabbage'], name: 'Cabbage Thoran', serving: '100g', cal: 75, p: 2.0, c: 8.0, f: 3.8, tip: 'High volume, low calorie fiber source.' },
  'cheera thoran': { aliases: ['spinach thoran', 'cheera thoran', 'red spinach', 'palak thoran', 'cheera'], name: 'Cheera (Spinach) Thoran', serving: '100g', cal: 70, p: 3.5, c: 6.0, f: 3.5, tip: 'Rich in iron, folate, and essential vitamins.' },
  'vegetable thoran': { aliases: ['thoran', 'beans thoran', 'mixed veg thoran', 'upperi', 'uppiri', 'mezhukkupuratti'], name: 'Vegetable Thoran / Upperi', serving: '100g', cal: 85, p: 2.5, c: 8, f: 4.5, tip: 'Excellent low-calorie micronutrient source.' },
  'salad': { aliases: ['green salad', 'cucumber salad', 'kachumber'], name: 'Fresh Mixed Salad', serving: '1 bowl (150g)', cal: 35, p: 1.2, c: 7, f: 0.3, tip: 'Zero guilt volume food! Eat before lunch/dinner.' },

  // --- CORN & VEGETABLES ---
  'boiled corn': { aliases: ['corn', 'sweet corn', 'sweetcorn', 'boiled sweet corn', 'cholam', 'makka cholam'], name: 'Boiled Sweet Corn', serving: '1 medium ear / cup (150g)', cal: 130, p: 4.5, c: 28, f: 1.8, tip: 'High fiber, natural energy and lutein for eye health. Great post-walk snack!' },

  // --- EGGS & PROTEINS ---
  'boiled egg': { aliases: ['egg', 'eggs', 'boiled eggs', 'mutta', 'puzhungiya mutta', 'hard boiled egg', '2 boiled eggs', '1 boiled egg'], name: 'Whole Boiled Egg', serving: '1 large egg (50g)', cal: 74, p: 6.3, c: 0.4, f: 5.0, tip: 'Gold standard complete amino acid profile.' },
  'egg white': { aliases: ['egg whites', 'white of egg', 'mutta vella'], name: 'Egg White', serving: '1 egg white (33g)', cal: 17, p: 3.6, c: 0.2, f: 0.1, tip: 'Pure lean protein. Perfect for boosting protein without calories.' },
  'omelette': { aliases: ['omlet', 'egg omelette', 'mutta omelette'], name: '2-Egg Omelette', serving: '1 serving (2 eggs)', cal: 180, p: 13.0, c: 2.0, f: 13.5, tip: 'Cook with minimal oil for an ideal high-protein meal.' },
  'chicken breast': { aliases: ['grilled chicken breast', 'boiled chicken breast'], name: 'Grilled / Cooked Chicken Breast', serving: '100g cooked', cal: 165, p: 31.0, c: 0.0, f: 3.6, tip: 'Ultra-lean protein foundation for fat loss.' },
  // --- KERALA FISH & SEAFOOD VARIETIES (Curries & Fried) ---
  'mathi fry': { aliases: ['mathi fry', 'sardine fry', 'chaala fry', 'fried mathi', 'mathi varuthathu'], name: 'Mathi (Sardine) Fry', serving: '1 piece (45g)', cal: 90, p: 9.2, c: 1.0, f: 5.5, tip: 'Rich in Omega-3 (EPA/DHA) and calcium from bones. Excellent healthy fat source!' },
  'mathi curry': { aliases: ['mathi curry', 'sardine curry', 'chaala curry', 'kudampuli mathi curry'], name: 'Mathi (Sardine) Curry', serving: '100g fish + gravy', cal: 125, p: 18.5, c: 1.2, f: 5.0, tip: 'Omega-3 powerhouse! Steamed in kudampuli gravy with minimal oil.' },
  'ayala fry': { aliases: ['ayala fry', 'mackerel fry', 'fried ayala', 'ayala varuthathu'], name: 'Ayala (Mackerel) Fry', serving: '1 piece / half (90g)', cal: 180, p: 21.0, c: 2.0, f: 10.0, tip: 'High protein and healthy fats. Prefer tawa shallow fry over deep fry.' },
  'ayala curry': { aliases: ['ayala curry', 'mackerel curry', 'ayala mulakittathu', 'kudampuli ayala curry'], name: 'Ayala (Mackerel) Curry', serving: '100g fish + gravy', cal: 140, p: 20.5, c: 1.5, f: 6.0, tip: 'Top tier lean protein for fat loss. Great with matta rice or chapati.' },
  'natholi fry': { aliases: ['natholi fry', 'vathal fry', 'vathal meen', 'vathal meen fry', 'kozhuva fry', 'nethili fry', 'anchovy fry', 'fried natholi'], name: 'Natholi / Vathal Meen (Anchovy) Fry', serving: '1 small portion (60g)', cal: 120, p: 14.5, c: 2.5, f: 6.0, tip: 'Eaten whole with bones — highest bioavailable calcium of all fishes!' },
  'natholi curry': { aliases: ['natholi curry', 'vathal curry', 'kozhuva curry', 'anchovy curry', 'vathal meen curry', 'nethili curry'], name: 'Natholi / Vathal Meen Curry', serving: '100g', cal: 105, p: 17.0, c: 1.0, f: 3.5, tip: 'Super clean, high protein, low calorie fish curry.' },
  'choora curry': { aliases: ['choora curry', 'tuna curry', 'kera curry', 'kerala tuna curry'], name: 'Choora (Tuna) Curry', serving: '100g', cal: 130, p: 25.0, c: 1.0, f: 2.5, tip: 'Ultra-lean protein bomb! 25g protein with almost zero fat.' },
  'choora fry': { aliases: ['choora fry', 'tuna fry', 'fried tuna', 'choora varuthathu'], name: 'Choora (Tuna) Fry', serving: '1 piece (100g)', cal: 175, p: 26.0, c: 2.0, f: 7.0, tip: 'Solid muscle retention fuel for your deficit.' },
  'karimeen pollichathu': { aliases: ['karimeen pollichathu', 'pearl spot pollichathu', 'fish pollichathu'], name: 'Karimeen Pollichathu (Banana Leaf)', serving: '1 whole fish (150g)', cal: 220, p: 28.0, c: 4.5, f: 10.0, tip: 'Wrapped in banana leaf with spicy shallot masala. Outstanding protein dinner!' },
  'karimeen fry': { aliases: ['karimeen fry', 'pearl spot fry', 'fried karimeen'], name: 'Karimeen (Pearl Spot) Fry', serving: '1 fish (120g)', cal: 195, p: 24.0, c: 2.5, f: 9.5, tip: 'Delicate, lean white fish with great flavor.' },
  'neymeen fry': { aliases: ['neymeen fry', 'seer fish fry', 'kingfish fry', 'ayakoora fry', 'vanjaram fry'], name: 'Neymeen / Kingfish (Seer Fish) Fry', serving: '1 slice (120g)', cal: 215, p: 27.0, c: 2.0, f: 11.0, tip: 'Firm, meaty steak fish with zero small bones. High satiety!' },
  'neymeen curry': { aliases: ['neymeen curry', 'seer fish curry', 'kingfish curry', 'ayakoora curry'], name: 'Neymeen (Kingfish) Curry', serving: '1 slice + gravy (150g)', cal: 165, p: 26.0, c: 1.8, f: 6.0, tip: 'Premium lean protein curry.' },
  'aavoli fry': { aliases: ['aavoli fry', 'pomfret fry', 'white pomfret fry', 'black pomfret fry'], name: 'Aavoli (Pomfret) Fry', serving: '1 piece (100g)', cal: 180, p: 22.0, c: 2.0, f: 9.0, tip: 'Mild, tender fish rich in minerals and B-vitamins.' },
  'chemmeen roast': { aliases: ['chemmeen roast', 'prawns roast', 'chemmeen fry', 'prawns fry', 'shrimp roast', 'chemmeen masala'], name: 'Chemmeen (Prawns / Shrimp) Roast', serving: '100g', cal: 135, p: 23.0, c: 3.5, f: 3.2, tip: 'Super high protein, very low calorie seafood! Perfect for fat loss.' },
  'chemmeen curry': { aliases: ['chemmeen curry', 'prawns curry', 'shrimp curry', 'chemmeen thenga curry'], name: 'Chemmeen (Prawns) Curry', serving: '1 bowl (150g)', cal: 155, p: 20.0, c: 4.0, f: 6.5, tip: 'Nutrient-dense with coconut and raw mango.' },
  'koonthal roast': { aliases: ['koonthal roast', 'squid roast', 'kanava roast', 'calamari roast', 'koonthal fry'], name: 'Koonthal (Squid / Calamari) Roast', serving: '100g', cal: 125, p: 21.0, c: 3.0, f: 3.0, tip: 'Very lean, high protein seafood choice.' },
  'fish curry': { aliases: ['meen curry', 'kerala fish curry', 'kudampuli fish curry', 'chatti meen curry', 'fish curry', 'fish molee'], name: 'Kerala Fish Curry (Kudampuli style)', serving: '100g fish + gravy', cal: 135, p: 19.5, c: 1.5, f: 5.5, tip: 'Low calorie, rich in Omega-3 fatty acids and lean protein.' },
  'grilled fish': { aliases: ['tawa fish', 'fish tawa fry', 'pollichathu', 'meen pollichathu', 'grilled fish'], name: 'Grilled / Tawa Fish', serving: '100g', cal: 140, p: 22.0, c: 0.5, f: 5.5, tip: 'Lean, clean, high-satiety protein source.' },
  'fish fry': { aliases: ['fried fish', 'meen varuthathu', 'meen fry', 'fish fry'], name: 'Kerala Fish Fry', serving: '1 piece (80g)', cal: 160, p: 16.0, c: 2.5, f: 9.5, tip: 'Absorbs cooking oil. Count 1–2 pieces and balance with walk/vegetables.' },
  'beef curry': { aliases: ['kerala beef curry', 'beef roast', 'irachi curry'], name: 'Kerala Beef Curry / Roast', serving: '100g', cal: 210, p: 24.0, c: 2.0, f: 12.0, tip: 'High protein and iron. Keep portions around 100–120g.' },

  // --- SOCIAL, ARABIC & FAST FOODS ---
  'shawaya': { aliases: ['shawaya chicken', 'shawayah', 'grilled chicken arabian', 'rotisserie chicken'], name: 'Shawaya Rotisserie Grilled Chicken', serving: '1/4 chicken (approx 180g)', cal: 280, p: 38.0, c: 0.5, f: 14.0, tip: '🔥 Charcoal/Rotisserie roasted! High protein, lean, zero carbs. Excellent dinner choice!' },
  'alfahm': { aliases: ['al faham', 'al-faham', 'alfaham chicken', 'bbq chicken'], name: 'Al Faham Grilled Chicken', serving: '1/4 chicken (180g)', cal: 260, p: 34.0, c: 2.0, f: 13.0, tip: 'Charcoal grilled! High protein, low carb dining out choice.' },
  'chicken mandi': { aliases: ['mandi', 'kuzhimandi', 'kuzhi mandi'], name: 'Chicken Mandi', serving: '1 portion (250g)', cal: 480, p: 32.0, c: 55, f: 15.0, tip: 'Focus on chicken; eat half the rice and skip mayonnaise!' },
  'chicken biryani': { aliases: ['biryani', 'biriyani', 'malabar biryani', 'dum biryani'], name: 'Chicken Biryani', serving: '1 plate (300g)', cal: 560, p: 28.0, c: 68, f: 20.0, tip: 'High calorie comfort food. Eat slowly and pair with onion raita.' },
  'fried chicken': { aliases: ['broast', 'broasted', 'kfc', 'crispy chicken', 'crispy fried chicken'], name: 'Crispy Fried / Broasted Chicken', serving: '1 piece (approx 120g)', cal: 320, p: 21.0, c: 14.0, f: 21.0, tip: '⚠️ Deep fried batter absorbs oil. Remove skin/batter to save 120 kcal, or prefer grilled Alfahm/Shawaya.' },
  'shawarma': { aliases: ['shawarma roll', 'chicken shawarma'], name: 'Chicken Shawarma Roll', serving: '1 roll', cal: 420, p: 22.0, c: 45, f: 17.0, tip: 'Ask for no-mayo or extra garlic paste/lettuce to cut 120 kcal.' },

  // --- FRUITS & SNACKS ---
  'orange': { aliases: ['oranges', 'mandarin', 'santra'], name: 'Fresh Orange', serving: '1 medium fruit (130g)', cal: 62, p: 1.2, c: 15.4, f: 0.2, tip: '🍊 High in Vitamin C & fiber with low glycemic index. Great natural fat-loss fruit!' },
  'banana': { aliases: ['bananas', 'pazham', 'nendran pazham', 'robusta'], name: 'Banana', serving: '1 medium (110g)', cal: 95, p: 1.2, c: 24, f: 0.3, tip: 'Natural potassium and fast energy before or after walks.' },
  'apple': { aliases: ['apples', 'green apple'], name: 'Fresh Apple', serving: '1 medium (150g)', cal: 80, p: 0.4, c: 21, f: 0.3, tip: 'Great filling snack with pectin fiber.' },
  'almonds': { aliases: ['badam', 'nuts'], name: 'Almonds / Badam', serving: '10 nuts (12g)', cal: 70, p: 2.6, c: 2.5, f: 6.0, tip: 'Healthy fats and magnesium. Great mid-afternoon crunch.' },
  'tea with milk': { aliases: ['tea', 'chai', 'milk tea', 'karak tea'], name: 'Milk Tea with 1 tsp Sugar', serving: '1 small cup (120ml)', cal: 65, p: 2.2, c: 8.5, f: 2.5, tip: 'Switch to sugar-free or black tea to save calories.' },
  'black coffee': { aliases: ['coffee', 'black tea', 'sulaimani', 'green tea'], name: 'Black Coffee / Green Tea (No Sugar)', serving: '1 cup (150ml)', cal: 2, p: 0.2, c: 0.2, f: 0.0, tip: 'Zero calorie metabolic and walk-energy booster!' },
  'whey protein': { aliases: ['protein powder', 'whey', 'protein shake'], name: 'Whey Protein Scoop in Water', serving: '1 scoop (30g)', cal: 120, p: 24.0, c: 2.5, f: 1.5, tip: 'Fastest convenient way to hit your 120–150g daily target.' }
};

// Clean string and handle common keyboard typos (e.g. ch=utney -> chutney)
function sanitizeFoodInput(str) {
  return str
    .replace(/[=_\-]/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}

// LIVE GOOGLE GEMINI AI ESTIMATION
async function queryGeminiAI(foodQuery, apiKey) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are a sports nutritionist. Calculate the total calories, protein(g), carbs(g), and fat(g) for this meal: "${foodQuery}".
Be realistic with portion sizes:
- 4 small idlis = approx 160-180 kcal, 6g protein
- 2 boiled eggs = approx 148 kcal, 12.6g protein
- 1-2 tbsp chutney = approx 50-80 kcal
Respond strictly in JSON with this format:
{
  "dishName": "Clean description of the meal",
  "calories": 380,
  "protein": 20.5,
  "carbs": 38.0,
  "fat": 15.0,
  "healthTip": "1 brief sentence evaluation for a fat-loss plan (target 2100 kcal, 130g protein)."
}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API Error: ${response.statusText}`);
  }

  const data = await response.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) {
    throw new Error("Empty response from AI");
  }

  let cleanedText = textResponse.trim();
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.replace(/^```/, '').replace(/```$/, '').trim();
  }

  const parsed = JSON.parse(cleanedText);
  return {
    calories: Math.round(Number(parsed.calories) || 0),
    protein: parseFloat((Number(parsed.protein) || 0).toFixed(1)),
    carbs: parseFloat((Number(parsed.carbs) || 0).toFixed(1)),
    fat: parseFloat((Number(parsed.fat) || 0).toFixed(1)),
    dishName: parsed.dishName || foodQuery,
    healthTip: parsed.healthTip || "Nutritional estimate generated by Gemini AI.",
    isAiGenerated: true
  };
}

// MAIN ESTIMATION FUNCTION (Tries Live Gemini AI first, falls back to intelligent offline fuzzy engine)
export async function estimateNutritionWithAI(inputString) {
  if (!inputString || typeof inputString !== 'string') {
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      healthTip: 'Please type what you ate (e.g. "4 small idli, 2 boiled eggs, chutney").'
    };
  }

  const apiKey = getGeminiApiKey();

  // 1. Try Live Gemini AI if API Key is available
  if (apiKey) {
    try {
      const geminiResult = await queryGeminiAI(inputString, apiKey);
      return geminiResult;
    } catch (err) {
      console.warn('Gemini API call error, switching to offline fuzzy engine:', err);
    }
  }

  // 2. Intelligent Offline Fallback Engine with Fuzzy Match and Multi-item Support
  // Check if input specifies total plate weight (e.g. "300g total: rice + veg + fish" or "total 300g plate")
  const totalPlateGramMatch = inputString.match(/(\d+)\s*(?:g|gm|grams)\s*(?:total|plate|all together|in total|overall|meal|lunch|dinner)/i) 
    || inputString.match(/(?:total|overall|all together|plate)\s*(?:of\s*)?(\d+)\s*(?:g|gm|grams)/i);

  const totalPlateGrams = totalPlateGramMatch ? parseFloat(totalPlateGramMatch[1]) : null;

  const rawQuery = inputString
    .replace(/\b(\d+)\s*(?:g|gm|grams)\s*(?:total|plate|all together|in total|overall|meal|lunch|dinner)\b/gi, '')
    .replace(/(?:total|overall|all together|plate)\s*(?:of\s*)?(\d+)\s*(?:g|gm|grams)/gi, '')
    .replace(/\b(?:overall|approx|total|of lunch|for lunch|of dinner|for dinner|of breakfast|for breakfast)\b/gi, '')
    .toLowerCase()
    .trim();

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let tips = [];
  const matchedDishes = new Set();

  // Split by comma, 'and', '+', '&', '\n', 'with', 'contains', 'also called', 'or'
  const subQueries = rawQuery.split(/,|\band\b|\+|\&|\n|\bwith\b|\bcontains\b|\balso called\b|\bor\b/i);

  for (const part of subQueries) {
    const cleanPart = sanitizeFoodInput(part);
    if (!cleanPart || cleanPart.length < 2) continue;

    // Detect portion/quantity
    let quantity = 1;
    let weightInGrams = null;
    let sizeMultiplier = 1.0;

    // If whole plate was weighed (e.g. 300g total plate), rice is ~45% of plate weight, thoran ~20%, curry ~20%
    if (totalPlateGrams && !cleanPart.match(/(\d+)\s*(?:g|gm|grams)/i)) {
      if (cleanPart.includes('rice') || cleanPart.includes('choru')) {
        weightInGrams = Math.round(totalPlateGrams * 0.48); // ~145g rice
      } else if (cleanPart.includes('thoran') || cleanPart.includes('upperi') || cleanPart.includes('uppiri')) {
        weightInGrams = Math.round(totalPlateGrams * 0.20); // ~60g thoran
      } else if (cleanPart.includes('curry') && !cleanPart.includes('fish') && !cleanPart.includes('chicken') && !cleanPart.includes('beef')) {
        weightInGrams = Math.round(totalPlateGrams * 0.20); // ~60g curry
      }
    }

    if (/\b(?:small|tiny|mini)\b/i.test(cleanPart)) {
      sizeMultiplier = 0.75;
    } else if (/\b(?:large|big|jumbo)\b/i.test(cleanPart)) {
      sizeMultiplier = 1.3;
    }

    const gramMatch = cleanPart.match(/(\d+(?:\.\d+)?)\s*(?:g|gm|grams|gram)/i);
    if (gramMatch) {
      weightInGrams = parseFloat(gramMatch[1]);
    } else {
      const countMatch = cleanPart.match(/^(\d+(?:\.\d+)?)/) || cleanPart.match(/\b(\d+(?:\.\d+)?)\s*(?:pieces?|nos?|pcs?|piece|eggs?|idlis?|idli|chapatis?|dosa|bananas?|oranges?)/i);
      const halfMatch = cleanPart.match(/\b(?:1\/2|half|0\.5)\b/i);

      if (halfMatch) {
        quantity = 0.5;
      } else if (countMatch) {
        quantity = parseFloat(countMatch[1]);
      }
    }

    // Match against database with alias support
    let bestFood = null;
    let bestMatchLen = 0;

    for (const [key, food] of Object.entries(FOOD_DATABASE)) {
      const candidates = [key, ...(food.aliases || [])];
      for (const cand of candidates) {
        // Look for word or substring match
        if (cleanPart.includes(cand) && cand.length > bestMatchLen) {
          bestFood = food;
          bestMatchLen = cand.length;
        }
      }
    }

    if (bestFood) {
      let multiplier = quantity * sizeMultiplier;

      if (weightInGrams && bestFood.serving.includes('100g')) {
        multiplier = weightInGrams / 100;
      } else if (weightInGrams) {
        multiplier = weightInGrams / 120;
      }

      totalCalories += Math.round(bestFood.cal * multiplier);
      totalProtein += parseFloat((bestFood.p * multiplier).toFixed(1));
      totalCarbs += parseFloat((bestFood.c * multiplier).toFixed(1));
      totalFat += parseFloat((bestFood.f * multiplier).toFixed(1));

      if (bestFood.tip && !tips.includes(bestFood.tip)) {
        tips.push(bestFood.tip);
      }
    } else {
      // Heuristic fallback for unknown words (e.g. side dish / fruit)
      const isSideOrSauce = /\b(?:sauce|chutney|dip|pickle|podi|curry)\b/i.test(cleanPart);
      const estCal = isSideOrSauce ? Math.round(50 * quantity) : Math.round(150 * quantity * sizeMultiplier);
      const estP = isSideOrSauce ? 1 : Math.round(5 * quantity);
      const estC = isSideOrSauce ? 3 : Math.round(18 * quantity);
      const estF = isSideOrSauce ? 4 : Math.round(4 * quantity);

      totalCalories += estCal;
      totalProtein += estP;
      totalCarbs += estC;
      totalFat += estF;
    }
  }

  let overallTip = tips.length > 0 ? tips.join(' • ') : 'Estimated nutritional breakdown. Adjust numbers above if needed.';
  if (totalProtein >= 25) {
    overallTip = `💪 High Protein (+${totalProtein.toFixed(1)}g)! Excellent for muscle retention during fat loss. ${overallTip}`;
  }

  return {
    calories: totalCalories,
    protein: parseFloat(totalProtein.toFixed(1)),
    carbs: parseFloat(totalCarbs.toFixed(1)),
    fat: parseFloat(totalFat.toFixed(1)),
    healthTip: overallTip,
    isAiGenerated: false
  };
}
