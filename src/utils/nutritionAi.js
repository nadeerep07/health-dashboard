/**
 * Legacy Adapter & Nutrition Service Exporter
 * Maintains full backward compatibility with existing imports across the app
 */

import { FOOD_DATABASE } from '../services/nutrition/foodDatabase.js';
import { 
  estimateNutrition, 
  getStoredGeminiKey, 
  setStoredGeminiKey, 
  GEMINI_STORAGE_KEY 
} from '../services/nutritionService.js';

export {
  FOOD_DATABASE,
  GEMINI_STORAGE_KEY,
  getStoredGeminiKey as getGeminiApiKey,
  setStoredGeminiKey as setGeminiApiKey,
  estimateNutrition,
  estimateNutrition as estimateNutritionWithAI
};
