import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const METHODS = [
  { id: 'url',    icon: '🔗', label: 'Import from URL',   sub: 'Paste any recipe website link' },
  { id: 'photo',  icon: '📷', label: 'Scan a Photo',      sub: 'Take a photo of a handwritten or printed recipe' },
  { id: 'manual', icon: '✏️', label: 'Enter Manually',    sub: 'Type or dictate your own recipe' },
  { id: 'ai',     icon: '✨', label: 'Generate with AI',  sub: 'Describe a dish and Little Chef builds the recipe' },
];

const DIFFICULTIES = ['Beginner', 'Home cook', 'Confident cook'];

// Shared AI processing overlay
function AIProcessing({ label, onDone }) {
  const STEPS_DISPLAY = [
    'Reading recipe...',
    'Extracting ingredients...',
    'Structuring steps...',
    'Adding timers & tips...',
    'Done!',
  ];
  const [stepIdx, setStepIdx] = useState(0);

  useState(() => {
    let i = 0;
    const tick = setInterval(() => {
      i++;
      setStepIdx(i);
      if (i >= STEPS_DISPLAY.length - 1) {
        clearInterval(tick);
        setTimeout(onDone, 500);
      }
    }, 400);
    return () => clearInterval(tick);
  });

  return (
    <div className="flex flex-col items-center justify-center py-10 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-terra/15 flex items-center justify-center">
        <span className="text-3xl animate-pulse">✨</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-t1 font-semibold text-sm">{label}</p>
        <p className="text-terra text-xs font-semibold">{STEPS_DISPLAY[Math.min(stepIdx, STEPS_DISPLAY.length - 1)]}</p>
      </div>
      <div className="w-48 h-1.5 bg-s3 rounded-full overflow-hidden">
        <div
          className="h-full bg-terra rounded-full transition-all duration-300"
          style={{ width: `${((stepIdx + 1) / STEPS_DISPLAY.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

function UrlImport({ onDone }) {
  const [url, setUrl] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleImport = () => {
    if (!url.trim()) return;
    setProcessing(true);
  };

  if (processing) {
    return <AIProcessing label="Importing recipe" onDone={onDone} />;
  }

  return (
    <div className="flex flex-col gap-3 pt-2">
      <input
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="https://..."
        className="bg-s2 border border-s3 rounded-xl px-4 py-3 text-t1 text-sm placeholder-t3 focus:border-terra outline-none"
      />
      <p className="text-t3 text-xs">Works with AllRecipes, NYT Cooking, Serious Eats, and most recipe sites. Little Chef will clean up the formatting automatically.</p>
      <button
        onClick={handleImport}
        disabled={!url.trim()}
        className="w-full bg-terra text-white rounded-xl py-3.5 font-semibold text-sm
          active:scale-95 transition-transform disabled:opacity-40"
      >
        Import & clean up with AI
      </button>
    </div>
  );
}

function PhotoImport({ onDone }) {
  const [processing, setProcessing] = useState(false);

  if (processing) {
    return <AIProcessing label="Reading your photo" onDone={onDone} />;
  }

  return (
    <div className="flex flex-col gap-3 pt-2">
      <div className="bg-s2 border border-s3 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-t3">
          <span className="text-4xl">📷</span>
          <p className="text-xs text-center px-4">Position your recipe card, handwritten notes, or cookbook page in frame</p>
        </div>
      </div>
      <button
        onClick={() => setProcessing(true)}
        className="w-full bg-terra text-white rounded-xl py-3.5 font-semibold text-sm
          active:scale-95 transition-transform"
      >
        Scan & extract with AI
      </button>
    </div>
  );
}

function ManualImport({ onDone }) {
  const [title, setTitle]           = useState('');
  const [cuisine, setCuisine]       = useState('');
  const [difficulty, setDifficulty] = useState('Home cook');
  const [prepTime, setPrepTime]     = useState('');
  const [cookTime, setCookTime]     = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps]           = useState('');
  const [notes, setNotes]           = useState('');
  const [processing, setProcessing] = useState(false);

  const canSubmit = title.trim() && ingredients.trim() && steps.trim();

  if (processing) {
    return <AIProcessing label="Structuring your recipe" onDone={onDone} />;
  }

  return (
    <div className="flex flex-col gap-3 pt-2">
      <input value={title} onChange={e => setTitle(e.target.value)}
        placeholder="Recipe title *"
        className="bg-s2 border border-s3 rounded-xl px-4 py-3 text-t1 text-sm placeholder-t3 focus:border-terra outline-none" />

      <div className="flex gap-2">
        <input value={cuisine} onChange={e => setCuisine(e.target.value)}
          placeholder="Cuisine"
          className="flex-1 bg-s2 border border-s3 rounded-xl px-3 py-3 text-t1 text-sm placeholder-t3 focus:border-terra outline-none" />
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
          className="flex-1 bg-s2 border border-s3 rounded-xl px-3 py-3 text-t1 text-sm focus:border-terra outline-none appearance-none">
          {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      <div className="flex gap-2">
        <input value={prepTime} onChange={e => setPrepTime(e.target.value)}
          placeholder="Prep (min)"
          className="flex-1 bg-s2 border border-s3 rounded-xl px-3 py-3 text-t1 text-sm placeholder-t3 focus:border-terra outline-none" />
        <input value={cookTime} onChange={e => setCookTime(e.target.value)}
          placeholder="Cook (min)"
          className="flex-1 bg-s2 border border-s3 rounded-xl px-3 py-3 text-t1 text-sm placeholder-t3 focus:border-terra outline-none" />
      </div>

      <textarea value={ingredients} onChange={e => setIngredients(e.target.value)}
        placeholder={"Ingredients * (one per line)\ne.g. 2 cups flour\n1 tsp salt"} rows={4}
        className="bg-s2 border border-s3 rounded-xl px-4 py-3 text-t1 text-sm placeholder-t3 focus:border-terra outline-none resize-none" />

      <textarea value={steps} onChange={e => setSteps(e.target.value)}
        placeholder={"Instructions * (one step per line)\ne.g. Preheat oven to 350°F"} rows={4}
        className="bg-s2 border border-s3 rounded-xl px-4 py-3 text-t1 text-sm placeholder-t3 focus:border-terra outline-none resize-none" />

      <textarea value={notes} onChange={e => setNotes(e.target.value)}
        placeholder="Notes, backstory, or tips (optional)" rows={2}
        className="bg-s2 border border-s3 rounded-xl px-4 py-3 text-t1 text-sm placeholder-t3 focus:border-terra outline-none resize-none" />

      <button
        onClick={() => setProcessing(true)}
        disabled={!canSubmit}
        className="w-full bg-terra text-white rounded-xl py-3.5 font-semibold text-sm
          active:scale-95 transition-transform disabled:opacity-40"
      >
        Save & structure with AI
      </button>
    </div>
  );
}

function AIGenerate({ onDone }) {
  const [prompt, setPrompt] = useState('');
  const [processing, setProcessing] = useState(false);

  if (processing) {
    return <AIProcessing label="Creating your recipe" onDone={onDone} />;
  }

  return (
    <div className="flex flex-col gap-3 pt-2">
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder={"Describe what you want...\ne.g. 'A quick weeknight pasta with mushrooms and cream, serves 2'\ne.g. 'My grandma's apple cake, not too sweet'"}
        rows={4}
        className="bg-s2 border border-s3 rounded-xl px-4 py-3 text-t1 text-sm placeholder-t3 focus:border-terra outline-none resize-none"
      />
      <button
        onClick={() => setProcessing(true)}
        disabled={!prompt.trim()}
        className="w-full bg-terra text-white rounded-xl py-3.5 font-semibold text-sm
          active:scale-95 transition-transform disabled:opacity-40"
      >
        ✨ Generate recipe
      </button>
    </div>
  );
}

export default function ImportRecipe() {
  const navigate = useNavigate();
  const { addToast, cookbooks } = useApp();
  const [activeMethod, setActiveMethod] = useState(null);
  const [showCookbookPicker, setShowCookbookPicker] = useState(false);
  const [selectedCookbook, setSelectedCookbook] = useState(cookbooks[0]?.id ?? null);

  const handleDone = () => {
    setActiveMethod(null);
    setShowCookbookPicker(true);
  };

  const handleSave = () => {
    setShowCookbookPicker(false);
    addToast('Recipe added to your cookbook!', 'success');
  };

  // Cookbook picker overlay
  if (showCookbookPicker) {
    return (
      <div className="bg-bg min-h-full flex flex-col px-5 pt-8 pb-8">
        <div className="text-center mb-8">
          <span className="text-4xl">✅</span>
          <h2 className="font-serif text-2xl font-bold text-t1 mt-3 mb-1">Recipe ready!</h2>
          <p className="text-t2 text-sm">Which cookbook should it go in?</p>
        </div>

        <div className="flex flex-col gap-2 mb-6">
          {cookbooks.map(cb => (
            <button
              key={cb.id}
              onClick={() => setSelectedCookbook(cb.id)}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98]
                ${selectedCookbook === cb.id ? 'border-terra bg-terra/8' : 'border-s3 bg-s1'}`}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: cb.color || '#D4654A' }}>
                <span className="text-xl">{cb.emoji}</span>
              </div>
              <div className="flex-1">
                <p className={`font-semibold text-sm ${selectedCookbook === cb.id ? 'text-terra' : 'text-t1'}`}>
                  {cb.name}
                </p>
                <p className="text-t3 text-xs">{cb.recipeIds.length} recipes</p>
              </div>
              {selectedCookbook === cb.id && (
                <div className="w-5 h-5 rounded-full bg-terra flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-terra text-white rounded-2xl py-4 font-semibold text-base
            active:scale-95 transition-transform shadow-[0_0_20px_rgba(212,101,74,0.35)]"
        >
          Add to cookbook →
        </button>
        <button
          onClick={handleSave}
          className="w-full mt-3 text-t3 text-sm font-semibold py-2 active:opacity-70"
        >
          Skip for now
        </button>
      </div>
    );
  }

  return (
    <div className="bg-bg min-h-full pb-8">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-s3">
        <h1 className="font-serif text-2xl font-bold text-t1 mb-1">Add Recipe</h1>
        <p className="text-t3 text-xs">Little Chef will clean up and structure it automatically</p>
      </div>

      {/* Method cards */}
      <div className="px-5 pt-4 flex flex-col gap-3">
        {METHODS.map(method => (
          <div key={method.id}>
            <button
              onClick={() => setActiveMethod(activeMethod === method.id ? null : method.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all
                ${activeMethod === method.id
                  ? 'border-terra bg-terra/5'
                  : 'border-s3 bg-s1 active:bg-s2'}`}
            >
              <span className="text-2xl w-9 text-center flex-shrink-0">{method.icon}</span>
              <div className="flex-1">
                <p className={`font-semibold text-sm ${activeMethod === method.id ? 'text-terra' : 'text-t1'}`}>
                  {method.label}
                </p>
                <p className="text-t3 text-xs mt-0.5">{method.sub}</p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke={activeMethod === method.id ? '#D4654A' : '#6D6D72'} strokeWidth="2.5" strokeLinecap="round"
                style={{ transform: activeMethod === method.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {activeMethod === method.id && (
              <div className="mt-2 px-1 animate-fade-in">
                {method.id === 'url'    && <UrlImport    onDone={handleDone} />}
                {method.id === 'photo'  && <PhotoImport  onDone={handleDone} />}
                {method.id === 'manual' && <ManualImport onDone={handleDone} />}
                {method.id === 'ai'     && <AIGenerate   onDone={handleDone} />}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
