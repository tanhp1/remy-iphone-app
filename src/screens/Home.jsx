import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const COOKBOOK_COLORS = [
  '#D4654A', '#BA7517', '#4A7C59', '#4A6FA5', '#8B5E83', '#5E8B7E',
];

function CookbookCard({ cookbook, recipes, onPress }) {
  const count = cookbook.recipeIds.length;
  const previews = cookbook.recipeIds
    .slice(0, 3)
    .map(id => recipes.find(r => r.id === id))
    .filter(Boolean);

  return (
    <button
      onClick={onPress}
      className="bg-s1 border border-s3 rounded-2xl overflow-hidden active:scale-[0.97] transition-transform text-left"
    >
      {/* Cover */}
      <div className="h-28 relative flex items-end px-3 pb-3"
        style={{ backgroundColor: cookbook.color || '#D4654A' }}>
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)'
        }} />
        {/* Recipe emoji previews */}
        <div className="absolute top-3 right-3 flex gap-1">
          {previews.map(r => (
            <span key={r.id} className="text-xl drop-shadow">{r.emoji}</span>
          ))}
        </div>
        <span className="text-3xl relative z-10">{cookbook.emoji}</span>
      </div>
      {/* Info */}
      <div className="px-3 py-2.5">
        <p className="text-t1 font-bold text-sm leading-tight">{cookbook.name}</p>
        <p className="text-t3 text-xs mt-0.5">{count} {count === 1 ? 'recipe' : 'recipes'}</p>
      </div>
    </button>
  );
}

function RecentRecipeRow({ recipe, onPress }) {
  return (
    <button
      onClick={onPress}
      className="flex items-center gap-3 bg-s1 border border-s3 rounded-xl p-3 active:bg-s2 transition-colors text-left w-full"
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: recipe.color }}>
        <span className="text-xl">{recipe.emoji}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-t1 font-semibold text-sm truncate">{recipe.title}</p>
        <p className="text-t3 text-xs">{recipe.prepTime + recipe.cookTime} min · {recipe.cuisine}</p>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6D6D72" strokeWidth="2.5" strokeLinecap="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { user, allRecipes, cookbooks, recentlyCookedIds } = useApp();

  const recentRecipes = recentlyCookedIds.length > 0
    ? recentlyCookedIds.map(id => allRecipes.find(r => r.id === id)).filter(Boolean)
    : allRecipes.slice(0, 4);

  return (
    <div className="bg-bg min-h-full flex flex-col">

      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <p className="text-t3 text-xs font-semibold uppercase tracking-wider">Little Chef</p>
          <h1 className="font-serif text-2xl font-bold text-t1 leading-tight">
            {user.name}'s Kitchen
          </h1>
        </div>
        <button
          onClick={() => navigate('/import')}
          className="w-10 h-10 rounded-full bg-terra flex items-center justify-center
            shadow-[0_0_16px_rgba(212,101,74,0.4)] active:scale-90 transition-transform"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      {/* Cookbooks */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-t3 text-xs font-semibold uppercase tracking-wider">📚 Cookbooks</p>
          <button
            onClick={() => navigate('/recipes')}
            className="text-terra text-xs font-semibold active:opacity-70"
          >
            See all
          </button>
        </div>

        {cookbooks.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {cookbooks.map(cb => (
              <CookbookCard
                key={cb.id}
                cookbook={cb}
                recipes={allRecipes}
                onPress={() => navigate(`/recipes?cookbook=${cb.id}`)}
              />
            ))}
            {/* New cookbook card */}
            <button
              onClick={() => navigate('/import')}
              className="border-2 border-dashed border-s3 rounded-2xl h-[140px] flex flex-col items-center
                justify-center gap-2 active:border-terra active:bg-terra/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-s2 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6D6D72" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              <p className="text-t3 text-xs font-semibold">Add recipe</p>
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/import')}
            className="w-full border-2 border-dashed border-s3 rounded-2xl py-12 flex flex-col items-center
              gap-3 active:border-terra transition-colors"
          >
            <span className="text-4xl">📖</span>
            <p className="text-t2 font-semibold text-sm">Create your first cookbook</p>
            <p className="text-t3 text-xs">Import or add a recipe to get started</p>
          </button>
        )}
      </div>

      {/* Recent recipes */}
      <div className="px-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-t3 text-xs font-semibold uppercase tracking-wider">
            {recentlyCookedIds.length > 0 ? '🕐 Recently cooked' : '📋 Recently added'}
          </p>
          <button onClick={() => navigate('/recipes')} className="text-terra text-xs font-semibold active:opacity-70">
            See all
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {recentRecipes.slice(0, 4).map(r => (
            <RecentRecipeRow
              key={r.id}
              recipe={r}
              onPress={() => navigate(`/recipes/${r.id}`)}
            />
          ))}
        </div>
      </div>

      {/* Import CTA */}
      <div className="px-5 mb-6">
        <button
          onClick={() => navigate('/import')}
          className="w-full bg-s1 border border-s3 rounded-2xl px-4 py-4 flex items-center gap-4
            active:bg-s2 transition-colors"
        >
          <div className="w-10 h-10 bg-terra/15 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4654A" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          <div className="flex-1 text-left">
            <p className="text-t1 text-sm font-semibold">Add a recipe</p>
            <p className="text-t3 text-xs mt-0.5">From a URL, photo, or type it in</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6D6D72" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

    </div>
  );
}
