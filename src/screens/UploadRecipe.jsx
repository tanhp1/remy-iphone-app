import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} onClick={() => onChange(i)} className="active:scale-90 transition-transform">
          <svg width="28" height="28" viewBox="0 0 24 24"
            fill={i <= value ? '#D4654A' : 'none'}
            stroke={i <= value ? '#D4654A' : '#6D6D72'} strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

function RatingSection({ label, emoji, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-s3">
      <div>
        <p className="text-t1 text-sm font-semibold">{emoji} {label}</p>
        <p className="text-t3 text-xs mt-0.5">{value > 0 ? `${value} / 5` : 'Not rated'}</p>
      </div>
      <StarPicker value={value} onChange={onChange} />
    </div>
  );
}

function IngredientRow({ item, onRemove }) {
  return (
    <div className="flex items-center gap-2 bg-s2 border border-s3 rounded-xl px-3 py-2.5">
      <span className="text-t1 text-sm flex-1">{item.qty} {item.item}</span>
      <button onClick={onRemove} className="text-t3 active:text-danger transition-colors text-lg leading-none">×</button>
    </div>
  );
}

function StepRow({ index, text, onRemove }) {
  return (
    <div className="flex gap-2 bg-s2 border border-s3 rounded-xl px-3 py-2.5">
      <span className="text-terra font-bold text-sm w-5 flex-shrink-0">{index + 1}</span>
      <p className="text-t1 text-sm flex-1 leading-snug">{text}</p>
      <button onClick={onRemove} className="text-t3 active:text-danger transition-colors text-lg leading-none flex-shrink-0">×</button>
    </div>
  );
}

const EMPTY_FORM = {
  title: '', cuisine: '', servings: '', difficulty: 'Easy',
  prepTime: '', cookTime: '', description: '', cost: '$',
};

export default function UploadRecipe() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [form, setForm] = useState(EMPTY_FORM);
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [newIngredient, setNewIngredient] = useState({ qty: '', item: '' });
  const [newStep, setNewStep] = useState('');
  const [ratings, setRatings] = useState({ presentation: 0, quality: 0, recommendation: 0 });
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const addIngredient = () => {
    if (!newIngredient.item) return;
    setIngredients(prev => [...prev, { ...newIngredient }]);
    setNewIngredient({ qty: '', item: '' });
  };

  const addStep = () => {
    if (!newStep.trim()) return;
    setSteps(prev => [...prev, newStep.trim()]);
    setNewStep('');
  };

  const handleSubmit = () => {
    if (!form.title || ingredients.length === 0 || steps.length === 0) {
      addToast('Please fill in title, ingredients, and steps', 'error');
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-bg min-h-full flex flex-col items-center justify-center px-6 gap-6">
        <div className="text-center">
          <div className="text-7xl mb-4">🎉</div>
          <h2 className="font-serif text-2xl font-bold text-t1 mb-2">Recipe Submitted!</h2>
          <p className="text-t2 text-sm leading-relaxed">
            <strong className="text-terra">{form.title}</strong> has been submitted to the Remy community.
            It'll go live after a quick review.
          </p>
        </div>

        {/* Rating summary */}
        <div className="w-full bg-s1 border border-s3 rounded-2xl p-4">
          <p className="text-t2 text-xs font-semibold uppercase tracking-wider mb-3 text-center">Your Ratings</p>
          {[
            { label: 'Presentation', emoji: '🎨', val: ratings.presentation },
            { label: 'Quality', emoji: '⭐', val: ratings.quality },
            { label: 'Recommendation', emoji: '👍', val: ratings.recommendation },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between py-2 border-b border-s3 last:border-0">
              <span className="text-t2 text-sm">{row.emoji} {row.label}</span>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} width="12" height="12" viewBox="0 0 24 24"
                    fill={i <= row.val ? '#D4654A' : 'none'}
                    stroke="#D4654A" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={() => { setSubmitted(false); setForm(EMPTY_FORM); setIngredients([]); setSteps([]); setRatings({ presentation: 0, quality: 0, recommendation: 0 }); setComments(''); }}
            className="flex-1 bg-s2 border border-s3 text-t2 rounded-xl py-3.5 font-semibold text-sm active:scale-95 transition-transform"
          >
            Upload Another
          </button>
          <button
            onClick={() => navigate('/discover')}
            className="flex-[2] bg-terra text-white rounded-xl py-3.5 font-semibold text-sm active:scale-95 transition-transform shadow-[0_0_16px_rgba(212,101,74,0.35)]"
          >
            Try Recipes →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg min-h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-s3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center active:scale-90 transition-transform">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#AEAEB2" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div>
          <h1 className="font-serif text-xl font-bold text-t1">Upload Recipe</h1>
          <p className="text-t3 text-xs">Share with the Remy community</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-5 py-5 pb-24 flex flex-col gap-6">
        {/* Basic info */}
        <section>
          <p className="text-t2 text-xs font-semibold uppercase tracking-wider mb-3">Basic Info</p>
          <div className="flex flex-col gap-3">
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="Recipe title *"
              className="bg-s2 border border-s3 rounded-xl px-4 py-3 text-t1 text-sm placeholder-t3 focus:border-terra outline-none" />
            <div className="flex gap-3">
              <input value={form.cuisine} onChange={e => set('cuisine', e.target.value)}
                placeholder="Cuisine"
                className="flex-1 bg-s2 border border-s3 rounded-xl px-4 py-3 text-t1 text-sm placeholder-t3 focus:border-terra outline-none" />
              <input value={form.servings} onChange={e => set('servings', e.target.value)}
                placeholder="Servings"
                className="w-28 bg-s2 border border-s3 rounded-xl px-4 py-3 text-t1 text-sm placeholder-t3 focus:border-terra outline-none" />
            </div>
            <div className="flex gap-3">
              <input value={form.prepTime} onChange={e => set('prepTime', e.target.value)}
                placeholder="Prep (min)"
                className="flex-1 bg-s2 border border-s3 rounded-xl px-4 py-3 text-t1 text-sm placeholder-t3 focus:border-terra outline-none" />
              <input value={form.cookTime} onChange={e => set('cookTime', e.target.value)}
                placeholder="Cook (min)"
                className="flex-1 bg-s2 border border-s3 rounded-xl px-4 py-3 text-t1 text-sm placeholder-t3 focus:border-terra outline-none" />
            </div>
            <div className="flex gap-3">
              <select value={form.difficulty} onChange={e => set('difficulty', e.target.value)}
                className="flex-1 bg-s2 border border-s3 rounded-xl px-4 py-3 text-t1 text-sm focus:border-terra outline-none appearance-none">
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
              <select value={form.cost} onChange={e => set('cost', e.target.value)}
                className="flex-1 bg-s2 border border-s3 rounded-xl px-4 py-3 text-t1 text-sm focus:border-terra outline-none appearance-none">
                <option value="$">$ Budget</option><option value="$$">$$ Mid</option><option value="$$$">$$$ Premium</option>
              </select>
            </div>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Short description (optional)"
              rows={2}
              className="bg-s2 border border-s3 rounded-xl px-4 py-3 text-t1 text-sm placeholder-t3 focus:border-terra outline-none resize-none" />
          </div>
        </section>

        {/* Ingredients */}
        <section>
          <p className="text-t2 text-xs font-semibold uppercase tracking-wider mb-3">
            Ingredients {ingredients.length > 0 && <span className="text-terra">({ingredients.length})</span>}
          </p>
          <div className="flex flex-col gap-2 mb-3">
            {ingredients.map((ing, i) => (
              <IngredientRow key={i} item={ing} onRemove={() => setIngredients(prev => prev.filter((_, j) => j !== i))} />
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newIngredient.qty} onChange={e => setNewIngredient(v => ({ ...v, qty: e.target.value }))}
              placeholder="Qty"
              className="w-20 bg-s2 border border-s3 rounded-xl px-3 py-2.5 text-t1 text-sm placeholder-t3 focus:border-terra outline-none" />
            <input value={newIngredient.item} onChange={e => setNewIngredient(v => ({ ...v, item: e.target.value }))}
              placeholder="Ingredient name"
              onKeyDown={e => e.key === 'Enter' && addIngredient()}
              className="flex-1 bg-s2 border border-s3 rounded-xl px-3 py-2.5 text-t1 text-sm placeholder-t3 focus:border-terra outline-none" />
            <button onClick={addIngredient}
              className="bg-terra text-white rounded-xl px-4 py-2.5 text-sm font-semibold active:scale-95 transition-transform">
              +
            </button>
          </div>
        </section>

        {/* Steps */}
        <section>
          <p className="text-t2 text-xs font-semibold uppercase tracking-wider mb-3">
            Steps {steps.length > 0 && <span className="text-terra">({steps.length})</span>}
          </p>
          <div className="flex flex-col gap-2 mb-3">
            {steps.map((step, i) => (
              <StepRow key={i} index={i} text={step} onRemove={() => setSteps(prev => prev.filter((_, j) => j !== i))} />
            ))}
          </div>
          <div className="flex gap-2">
            <textarea value={newStep} onChange={e => setNewStep(e.target.value)}
              placeholder="Describe this step..."
              rows={2}
              className="flex-1 bg-s2 border border-s3 rounded-xl px-3 py-2.5 text-t1 text-sm placeholder-t3 focus:border-terra outline-none resize-none" />
            <button onClick={addStep}
              className="bg-terra text-white rounded-xl px-4 text-sm font-semibold active:scale-95 transition-transform self-stretch">
              +
            </button>
          </div>
        </section>

        {/* Ratings */}
        <section>
          <p className="text-t2 text-xs font-semibold uppercase tracking-wider mb-2">Rate Your Recipe</p>
          <div className="bg-s1 border border-s3 rounded-2xl px-4">
            <RatingSection label="Presentation" emoji="🎨" value={ratings.presentation}
              onChange={v => setRatings(r => ({ ...r, presentation: v }))} />
            <RatingSection label="Quality" emoji="⭐" value={ratings.quality}
              onChange={v => setRatings(r => ({ ...r, quality: v }))} />
            <RatingSection label="Recommendation" emoji="👍" value={ratings.recommendation}
              onChange={v => setRatings(r => ({ ...r, recommendation: v }))} />
          </div>
        </section>

        {/* Comments */}
        <section>
          <p className="text-t2 text-xs font-semibold uppercase tracking-wider mb-3">Notes / Comments</p>
          <textarea value={comments} onChange={e => setComments(e.target.value)}
            placeholder="Any tips, variations, or backstory for this recipe..."
            rows={3}
            className="w-full bg-s2 border border-s3 rounded-xl px-4 py-3 text-t1 text-sm placeholder-t3 focus:border-terra outline-none resize-none" />
        </section>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full bg-terra text-white rounded-xl py-4 font-semibold text-base
            active:scale-95 transition-transform shadow-[0_0_20px_rgba(212,101,74,0.35)]"
        >
          Submit Recipe
        </button>
      </div>
    </div>
  );
}
