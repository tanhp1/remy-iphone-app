import { useNavigate } from 'react-router-dom';
import TagPill from './TagPill';

const SOURCE_COLORS = {
  'Little Chef Original': 'bg-terra',
  'Imported':      'bg-sage-dark',
  'Family Recipe': 'bg-amber',
};

export default function RecipeCard({ recipe }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/recipes/${recipe.id}`)}
      className="bg-s1 rounded-2xl border border-s3 overflow-hidden active:scale-95 transition-transform duration-100 cursor-pointer"
    >
      {/* Color hero */}
      <div
        className="h-28 flex items-center justify-center relative"
        style={{ backgroundColor: recipe.color }}
      >
        <span className="text-5xl filter drop-shadow-lg">{recipe.emoji}</span>
        <span className={`absolute top-2 left-2 ${SOURCE_COLORS[recipe.source] ?? 'bg-s3'} text-white text-[10px] font-semibold px-2 py-0.5 rounded-full`}>
          {recipe.source}
        </span>
        <span className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {recipe.matchScore}%
        </span>
      </div>
      {/* Body */}
      <div className="p-3">
        <p className="text-t1 font-semibold text-sm leading-snug mb-1">{recipe.title}</p>
        <p className="text-t3 text-xs mb-2">{recipe.cookTime + recipe.prepTime} min · {recipe.cuisine}</p>
        <div className="flex flex-wrap gap-1">
          {recipe.dietaryTags.slice(0, 2).map(tag => (
            <TagPill key={tag} label={tag} />
          ))}
        </div>
      </div>
    </div>
  );
}
