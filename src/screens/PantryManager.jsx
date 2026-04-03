import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const CATS = ['All', 'Produce', 'Proteins', 'Dairy', 'Pantry staples'];

const SCAN_ITEMS = [
  { id: `scan-${Date.now()}-1`, name: 'Greek yogurt',   qty: '2 cups',  category: 'Dairy',    expiringSoon: false },
  { id: `scan-${Date.now()}-2`, name: 'Spinach',         qty: '1 bag',   category: 'Produce',  expiringSoon: true  },
  { id: `scan-${Date.now()}-3`, name: 'Cheddar cheese',  qty: '200g',    category: 'Dairy',    expiringSoon: false },
];

const CAT_COLORS = {
  Produce:         'bg-sage/80',
  Proteins:        'bg-terra/80',
  Dairy:           'bg-blue-400',
  'Pantry staples':'bg-amber/80',
};

export default function PantryManager() {
  const navigate = useNavigate();
  const { pantry, addPantryItems, removePantryItem, addToast } = useApp();
  const [activeTab, setActiveTab] = useState('All');
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [swipedId, setSwipedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editQty, setEditQty] = useState('');
  const [newItemMode, setNewItemMode] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', qty: '' });

  const filtered = pantry.filter(i => activeTab === 'All' || i.category === activeTab);

  const handleScan = () => {
    setScanning(true);
    setScanDone(false);
    setTimeout(() => {
      setScanning(false);
      setScanDone(true);
      addPantryItems(SCAN_ITEMS);
      setTimeout(() => setScanDone(false), 3000);
      addToast('3 items added from your fridge scan', 'success');
    }, 2000);
  };

  const handleSuggest = () => {
    navigate('/discover');
  };

  const handleDelete = (id) => {
    removePantryItem(id);
    setSwipedId(null);
  };

  const handleEditSave = (id) => {
    setEditingId(null);
  };

  const handleAddItem = () => {
    if (!newItem.name) return;
    addPantryItems([{ id: `manual-${Date.now()}`, name: newItem.name, qty: newItem.qty || '1', category: 'Pantry staples', expiringSoon: false }]);
    setNewItem({ name: '', qty: '' });
    setNewItemMode(false);
    addToast(`${newItem.name} added to pantry`, 'success');
  };

  return (
    <div className="bg-bg min-h-full flex flex-col pb-24">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-s3">
        <h1 className="font-serif text-2xl font-bold text-t1">Your kitchen</h1>
        <p className="text-t3 text-xs mt-0.5">Updated just now · {pantry.length} items</p>
      </div>

      {/* Action row */}
      <div className="flex gap-3 px-5 py-3 border-b border-s3">
        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex-1 bg-terra text-white rounded-xl py-2.5 text-sm font-semibold
            active:scale-95 transition-transform disabled:opacity-70"
        >
          {scanning ? '🔄 Scanning...' : '📷 Scan fridge'}
        </button>
        <button
          onClick={() => setNewItemMode(true)}
          className="flex-1 bg-s2 border border-s3 text-t2 rounded-xl py-2.5 text-sm font-medium
            active:scale-95 transition-transform"
        >
          + Add item
        </button>
      </div>

      {/* Scan animation */}
      {scanning && (
        <div className="mx-5 my-3 bg-s1 border border-s3 rounded-xl overflow-hidden relative h-20">
          <div className="absolute inset-0 flex items-center justify-center gap-2">
            <span className="text-t3 text-sm">Scanning fridge contents</span>
            <span className="w-4 h-4 border-2 border-s3 border-t-terra rounded-full animate-spin" />
          </div>
          <div className="absolute left-0 right-0 h-px bg-terra/60 animate-bounce top-1/2" />
        </div>
      )}
      {scanDone && (
        <div className="mx-5 my-3 bg-success/10 border border-success/30 rounded-xl px-4 py-3 animate-fade-in">
          <p className="text-success text-sm font-semibold">✓ Scan complete — 3 new items found</p>
        </div>
      )}

      {/* Add item form */}
      {newItemMode && (
        <div className="mx-5 my-3 bg-s1 border border-s3 rounded-xl p-4 animate-fade-in flex flex-col gap-2">
          <input
            value={newItem.name}
            onChange={e => setNewItem(v => ({ ...v, name: e.target.value }))}
            placeholder="Item name..."
            className="bg-s2 border border-s3 rounded-lg px-3 py-2.5 text-t1 text-sm placeholder-t3 focus:border-terra outline-none"
          />
          <input
            value={newItem.qty}
            onChange={e => setNewItem(v => ({ ...v, qty: e.target.value }))}
            placeholder="Quantity (e.g. 2 cups)..."
            className="bg-s2 border border-s3 rounded-lg px-3 py-2.5 text-t1 text-sm placeholder-t3 focus:border-terra outline-none"
          />
          <div className="flex gap-2">
            <button onClick={() => setNewItemMode(false)}
              className="flex-1 border border-s3 rounded-lg py-2.5 text-t2 text-sm active:bg-s2">Cancel</button>
            <button onClick={handleAddItem}
              className="flex-1 bg-terra text-white rounded-lg py-2.5 text-sm font-semibold active:scale-95">Add</button>
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex overflow-x-auto scrollbar-none border-b border-s3">
        {CATS.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`flex-shrink-0 px-4 py-3 text-xs font-semibold border-b-2 transition-colors duration-150
              ${activeTab === cat ? 'text-terra border-terra' : 'text-t3 border-transparent'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items list */}
      <div className="flex flex-col gap-2 px-4 py-3 flex-1">
        {filtered.map(item => (
          <div key={item.id} className="relative overflow-hidden rounded-xl">
            {/* Delete action (behind) */}
            {swipedId === item.id && (
              <button
                onClick={() => handleDelete(item.id)}
                className="absolute right-0 top-0 bottom-0 w-16 bg-danger flex items-center justify-center rounded-r-xl z-0"
              >
                <span className="text-white text-lg">🗑</span>
              </button>
            )}
            {/* Item row */}
            <div
              className={`bg-s1 border border-s3 rounded-xl px-4 py-3 flex items-center gap-3 relative z-10
                transition-transform duration-200 ${swipedId === item.id ? '-translate-x-16' : 'translate-x-0'}`}
              onTouchStart={(e) => { e._startX = e.touches[0].clientX; }}
              onTouchEnd={(e) => {
                const dx = e.changedTouches[0].clientX - (e._startX ?? 0);
                if (dx < -40) setSwipedId(item.id);
                else if (dx > 10) setSwipedId(null);
              }}
            >
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${CAT_COLORS[item.category] ?? 'bg-s3'}`} />
              <div className="flex-1 min-w-0">
                {editingId === item.id ? (
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      value={editQty}
                      onChange={e => setEditQty(e.target.value)}
                      className="bg-s2 border border-terra rounded-lg px-2 py-1 text-t1 text-xs w-24 outline-none"
                    />
                    <button onClick={() => handleEditSave(item.id)}
                      className="text-terra text-xs font-semibold">Save</button>
                  </div>
                ) : (
                  <>
                    <p className="text-t1 font-medium text-sm">{item.name}</p>
                    <p className="text-t3 text-xs">{item.qty}</p>
                  </>
                )}
              </div>
              {item.expiringSoon && (
                <span className="bg-amber/15 border border-amber/30 text-amber text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                  Use soon
                </span>
              )}
              {!item.expiringSoon && (
                <button
                  onClick={() => { setEditingId(item.id); setEditQty(item.qty); }}
                  className="text-t3 text-xs active:text-t1"
                >
                  Edit
                </button>
              )}
              <button onClick={() => setSwipedId(swipedId === item.id ? null : item.id)}
                className="text-t3 text-xs pl-1 active:text-t1">
                ···
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky CTA */}
      <div className="absolute bottom-16 left-0 right-0 px-4 py-3 bg-bg/90 backdrop-blur-sm border-t border-s3">
        <button
          onClick={handleSuggest}
          className="w-full bg-terra text-white rounded-xl py-4 font-semibold text-base
            active:scale-95 transition-transform shadow-[0_0_20px_rgba(212,101,74,0.35)]"
        >
          🤖 What can I make tonight?
        </button>
      </div>
    </div>
  );
}
