import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const METHODS = [
  { id: 'url',    icon: '🔗', label: 'Import from URL',   sub: 'Paste any recipe website link' },
  { id: 'photo',  icon: '📷', label: 'Scan a Photo',      sub: 'Take a photo of a recipe card' },
  { id: 'manual', icon: '✏️', label: 'Enter Manually',    sub: 'Type your own recipe' },
];

const DIFFICULTIES = ['Beginner', 'Home cook', 'Confident cook'];

function UrlImport({ onDone }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImport = () => {
    if (!url.trim()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onDone(); }, 1400);
  };

  return (
    <div className="flex flex-col gap-3 pt-2">
      <input
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="https://..."
        className="bg-s2 border border-s3 rounded-xl px-4 py-3 text-t1 text-sm placeholder-t3 focus:border-terra outline-none"
      />
      <p className="text-t3 text-xs">Works with AllRecipes, NYT Cooking, Serious Eats, and most recipe sites.</p>
      <button
        onClick={handleImport}
        disabled={!url.trim() || loading}
        className="w-full bg-terra text-white rounded-xl py-3.5 font-semibold text-sm
          active:scale-95 transition-transform disabled:opacity-40"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Importing...
          </span>
        ) : 'Import Recipe'}
      </button>
    </div>
  );
}

function PhotoImport({ onDone }) {
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => { setScanning(false); onDone(); }, 2000);
  };

  return (
    <div className="flex flex-col gap-3 pt-2">
      <div className="bg-s2 border border-s3 rounded-xl overflow-hidden aspect-video flex items-center justify-center relative">
        {scanning ? (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4/5 h-4/5 relative">
                <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-terra rounded-tl" />
                <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-terra rounded-tr" />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-terra rounded-bl" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-terra rounded-br" />
                <div className="absolute left-0 right-0 h-0.5 bg-terra/70"
                  style={{ top: '50%', animation: 'scan 1.5s ease-in-out infinite alternate' }} />
              </div>
            </div>
            <p className="text-terra text-xs font-semibold mt-24">Scanning...</p>
            <style>{`@keyframes scan { from { top: 10%; } to { top: 90%; } }`}</style>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-t3">
            <span className="text-4xl">📷</span>
            <p className="text-xs">Position recipe in frame</p>
          </div>
        )}
      </div>
      <button
        onClick={handleScan}
        disabled={scanning}
        className="w-full bg-terra text-white rounded-xl py-3.5 font-semibold text-sm
          active:scale-95 transition-transform disabled:opacity-60"
      >
        {scanning ? 'Scanning...' : 'Scan Recipe'}
      </button>
    </div>
  );
}

function ManualImport({ onDone }) {
  const [title, setTitle] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [difficulty, setDifficulty] = useState('Home cook');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');

  const canSubmit = title.trim() && ingredients.trim() && steps.trim();

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
        placeholder={"Instructions * (one step per line)\ne.g. Preheat oven to 350°F\nMix dry ingredients"} rows={4}
        className="bg-s2 border border-s3 rounded-xl px-4 py-3 text-t1 text-sm placeholder-t3 focus:border-terra outline-none resize-none" />

      <textarea value={description} onChange={e => setDescription(e.target.value)}
        placeholder="Notes or backstory (optional)" rows={2}
        className="bg-s2 border border-s3 rounded-xl px-4 py-3 text-t1 text-sm placeholder-t3 focus:border-terra outline-none resize-none" />

      <button
        onClick={onDone}
        disabled={!canSubmit}
        className="w-full bg-terra text-white rounded-xl py-3.5 font-semibold text-sm
          active:scale-95 transition-transform disabled:opacity-40"
      >
        Save to Library
      </button>
    </div>
  );
}

export default function ImportRecipe() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const [activeMethod, setActiveMethod] = useState(null);

  const handleDone = () => {
    setActiveMethod(null);
    addToast('Recipe saved to your library!', 'success');
  };

  return (
    <div className="bg-bg min-h-full pb-6">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-s3">
        <h1 className="font-serif text-2xl font-bold text-t1 mb-1">Import Recipe</h1>
        <p className="text-t3 text-xs">Add a new recipe to your personal library</p>
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

            {/* Inline expanded form */}
            {activeMethod === method.id && (
              <div className="mt-2 px-1 animate-fade-in">
                {method.id === 'url'    && <UrlImport    onDone={handleDone} />}
                {method.id === 'photo'  && <PhotoImport  onDone={handleDone} />}
                {method.id === 'manual' && <ManualImport onDone={handleDone} />}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Library shortcut */}
      <div className="px-5 mt-6">
        <button
          onClick={() => navigate('/recipes')}
          className="w-full flex items-center justify-between bg-s1 border border-s3 rounded-xl px-4 py-3.5"
        >
          <div>
            <p className="text-t1 text-sm font-semibold">Browse your library</p>
            <p className="text-t3 text-xs mt-0.5">View all saved recipes</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6D6D72" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
