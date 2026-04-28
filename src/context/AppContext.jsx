import { createContext, useContext, useState, useCallback } from 'react';
import { RECIPES, MY_RECIPES } from '../data/recipes';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [user, setUser] = useState({
    name: 'Alex',
    skillLevel: 'Home cook',
    dietaryLifestyle: 'None',
    isPro: true,
  });

  const completeOnboarding = useCallback(({ skillLevel, dietaryLifestyle }) => {
    setUser(prev => ({ ...prev, skillLevel, dietaryLifestyle }));
    setOnboardingComplete(true);
  }, []);

  const [recipes] = useState(MY_RECIPES);
  const allRecipes = RECIPES;

  const [tweakedRecipes, setTweakedRecipes] = useState(new Set());
  const [recentlyCookedIds, setRecentlyCookedIds] = useState([]);
  const [servingsOverride, setServingsOverride] = useState({});
  const [toasts, setToasts] = useState([]);
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
      return { ...prev, [recipeId]: Math.max(1, current + delta) };
    });
  }, []);

  const value = {
    user,
    onboardingComplete,
    completeOnboarding,
    recipes,
    allRecipes,
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
