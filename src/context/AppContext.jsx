import { createContext, useContext, useState, useCallback } from 'react';
import { RECIPES } from '../data/recipes';

const AppContext = createContext(null);

const DEFAULT_COOKBOOKS = [
  {
    id: 'cb1',
    name: 'My Recipes',
    emoji: '📖',
    color: '#D4654A',
    recipeIds: RECIPES.map(r => r.id),
  },
];

export function AppProvider({ children }) {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [user, setUser] = useState({ name: 'Alex' });

  // allRecipes is the master list; recipes can be added/edited over time
  const [allRecipes, setAllRecipes] = useState(RECIPES);
  const [cookbooks, setCookbooks] = useState(DEFAULT_COOKBOOKS);

  const [servingsOverride, setServingsOverride] = useState({});
  const [recentlyCookedIds, setRecentlyCookedIds] = useState([]);
  const [toasts, setToasts] = useState([]);

  const completeOnboarding = useCallback(({ name, firstCookbookName }) => {
    setUser({ name: name || 'Chef' });
    setCookbooks([{
      id: 'cb1',
      name: firstCookbookName || 'My Recipes',
      emoji: '📖',
      color: '#D4654A',
      recipeIds: RECIPES.map(r => r.id),
    }]);
    setOnboardingComplete(true);
  }, []);

  const addToast = useCallback((message, type = 'default') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2800);
  }, []);

  // Add a new recipe and optionally assign it to a cookbook
  const addRecipe = useCallback((recipe, cookbookId) => {
    const newRecipe = { ...recipe, id: `r${Date.now()}`, source: 'Imported' };
    setAllRecipes(prev => [newRecipe, ...prev]);
    if (cookbookId) {
      setCookbooks(prev => prev.map(cb =>
        cb.id === cookbookId
          ? { ...cb, recipeIds: [newRecipe.id, ...cb.recipeIds] }
          : cb
      ));
    }
    return newRecipe.id;
  }, []);

  // Update an existing recipe (AI edit, manual edit)
  const updateRecipe = useCallback((recipeId, changes) => {
    setAllRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, ...changes } : r));
  }, []);

  // Create a new cookbook
  const addCookbook = useCallback((name, emoji = '📖', color = '#D4654A') => {
    const id = `cb${Date.now()}`;
    setCookbooks(prev => [...prev, { id, name, emoji, color, recipeIds: [] }]);
    return id;
  }, []);

  const markRecentlyCooked = useCallback((recipeId) => {
    setRecentlyCookedIds(prev => [recipeId, ...prev.filter(id => id !== recipeId)].slice(0, 5));
  }, []);

  const updateServings = useCallback((recipeId, delta) => {
    setServingsOverride(prev => {
      const base = allRecipes.find(r => r.id === recipeId)?.servings ?? 4;
      const current = prev[recipeId] ?? base;
      return { ...prev, [recipeId]: Math.max(1, current + delta) };
    });
  }, [allRecipes]);

  const value = {
    user,
    onboardingComplete,
    completeOnboarding,
    allRecipes,
    cookbooks,
    servingsOverride,
    recentlyCookedIds,
    toasts,
    addToast,
    addRecipe,
    updateRecipe,
    addCookbook,
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
