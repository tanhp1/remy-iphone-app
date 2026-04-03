import { createContext, useContext, useState, useCallback } from 'react';
import { RECIPES } from '../data/recipes';
import { PANTRY_INITIAL } from '../data/pantry';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user] = useState({
    name: 'Alex',
    skillLevel: 'Home cook',
    dietaryLifestyle: 'Keto',
    favoriteCuisines: ['Asian', 'Italian', 'Mexican'],
    timeBudget: 60,
    isPro: true,
  });

  const [recipes, setRecipes] = useState(RECIPES);
  const [pantry, setPantry] = useState(PANTRY_INITIAL);
  const [tweakedRecipes, setTweakedRecipes] = useState(new Set());
  const [recentlyCookedIds, setRecentlyCookedIds] = useState([]);
  const [servingsOverride, setServingsOverride] = useState({});
  const [toasts, setToasts] = useState([]);

  // Sheet state — rendered at PhoneShell level
  const [sheet, setSheet] = useState({ open: false, title: '', content: null });

  const openSheet  = useCallback((title, content) => setSheet({ open: true, title, content }), []);
  const closeSheet = useCallback(() => setSheet({ open: false, title: '', content: null }), []);

  const addToast = useCallback((message, type = 'default') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2800);
  }, []);

  const applyTweak = useCallback((recipeId) => {
    setTweakedRecipes(prev => new Set([...prev, recipeId]));
  }, []);

  const markRecentlyCooked = useCallback((recipeId) => {
    setRecentlyCookedIds(prev => [recipeId, ...prev.filter(id => id !== recipeId)].slice(0, 5));
  }, []);

  const updateServings = useCallback((recipeId, delta) => {
    setServingsOverride(prev => {
      const base = RECIPES.find(r => r.id === recipeId)?.servings ?? 4;
      const current = prev[recipeId] ?? base;
      const next = Math.max(1, current + delta);
      return { ...prev, [recipeId]: next };
    });
  }, []);

  const addPantryItems = useCallback((items) => {
    setPantry(prev => [...items, ...prev]);
  }, []);

  const removePantryItem = useCallback((id) => {
    setPantry(prev => prev.filter(p => p.id !== id));
  }, []);

  const value = {
    user,
    recipes,
    pantry,
    tweakedRecipes,
    recentlyCookedIds,
    servingsOverride,
    toasts,
    sheet,
    openSheet,
    closeSheet,
    addToast,
    applyTweak,
    markRecentlyCooked,
    updateServings,
    addPantryItems,
    removePantryItem,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
