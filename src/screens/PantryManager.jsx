import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const CATS = ['All', 'Produce', 'Proteins', 'Dairy', 'Pantry staples'];

const SCAN_ITEMS = [
  { id: `scan-${Date.now()}-1`, name: 'Greek yogurt',  qty: '2 cups', category: 'Dairy',    expiringSoon: false },
  { id: `scan-${Date.now()}-2`, name: 'Spinach',        qty: '1 bag',  category: 'Produce',  expiringSoon: true  },
  { id: `scan-${Date.now()}-3`, name: 'Cheddar cheese', qty: '200g',   category: 'Dairy',    expiringSoon: false },
];

const CAT_COLORS = {
  Produce:          'bg-sage/80',
  Proteins:         'bg-terra/80',
  Dairy:            'bg-blue-400',
  'Pantry staples': 'bg-amber/80',
};

// ─── Grocery List ─────────────────────────────────────────
function GroceryList({ addPantryItems, addToast, groceryList, updateGroceryList }) {
  const items = groceryList;
  const setItems = updateGroceryList;
  const [newItem, setNewItem] = useState({ name: '', qty: '' });
  const [addMode, setAddMode] = useState(false);

  const toggle = (id) => setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  const remove = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const add = () => {
    if (!newItem.name.trim()) return;
    setItems(prev => [...prev, { id: `g-${Date.now()}`, name: newItem.name.trim(), qty: newItem.qty || '1', checked: false }]);
    setNewItem({ name: '', qty: '' });
    setAddMode(false);
  };

  const moveToPantry = () => {
    const checked = items.filter(i => i.checked);
    if (!checked.length) return;
    addPantryItems(checked.map(i => ({
      id: `from-grocery-${i.id}`, name: i.name, qty: i.qty, category: 'Pantry staples', expiringSoon: false,
    })));
    setItems(prev => prev.filter(i => !i.checked));
    addToast(`${checked.length} item${checked.length > 1 ? 's' : ''} moved to pantry`, 'success');
  };

  const clearChecked = () => setItems(prev => prev.filter(i => !i.checked));

  const checkedCount = items.filter(i => i.checked).length;
  const unchecked = items.filter(i => !i.checked);
  const checked = items.filter(i => i.checked);

  return (
    <div className="flex flex-col flex-1 overflow-y-auto scrollbar-none pb-36">
      {/* Add row */}
      <div className="px-5 pt-3 pb-2">
        {addMode ? (
          <div className="bg-s1 border border-s3 rounded-xl p-3 flex flex-col gap-2 animate-fade-in">
            <input
              autoFocus
              value={newItem.name}
              onChange={e => setNewItem(v => ({ ...v, name: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && add()}
              placeholder="Item name..."
              className="bg-s2 border border-s3 rounded-lg px-3 py-2.5 text-t1 text-sm placeholder-t3 focus:border-terra outline-none"
            />
            <input
              value={newItem.qty}
              onChange={e => setNewItem(v => ({ ...v, qty: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && add()}
              placeholder="Quantity (e.g. 2 bags)..."
              className="bg-s2 border border-s3 rounded-lg px-3 py-2.5 text-t1 text-sm placeholder-t3 focus:border-terra outline-none"
            />
            <div className="flex gap-2">
              <button onClick={() => { setAddMode(false); setNewItem({ name: '', qty: '' }); }}
                className="flex-1 border border-s3 rounded-lg py-2.5 text-t2 text-sm active:bg-s2">Cancel</button>
              <button onClick={add}
                className="flex-1 bg-terra text-white rounded-lg py-2.5 text-sm font-semibold active:scale-95">Add</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddMode(true)}
            className="w-full flex items-center justify-center gap-2 border border-dashed border-s3 rounded-xl py-3
              text-t3 text-sm active:bg-s2 transition-colors"
          >
            <span className="text-base">+</span> Add to list
          </button>
        )}
      </div>

      {/* Unchecked items */}
      <div className="flex flex-col gap-2 px-4 py-2">
        {unchecked.length === 0 && checked.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10">
            <span className="text-4xl">🛒</span>
            <p className="text-t2 text-sm font-semibold">Your grocery list is empty</p>
            <p className="text-t3 text-xs">Tap "+ Add to list" to get started</p>
          </div>
        )}
        {unchecked.map(item => (
          <div key={item.id} className="flex items-center gap-3 bg-s1 border border-s3 rounded-xl px-4 py-3">
            <button
              onClick={() => toggle(item.id)}
              className="w-5 h-5 rounded-full border-2 border-s3 flex items-center justify-center flex-shrink-0
                active:scale-90 transition-transform"
            />
            <div className="flex-1 min-w-0">
              <p className="text-t1 font-medium text-sm">{item.name}</p>
              <p className="text-t3 text-xs">{item.qty}</p>
            </div>
            <button onClick={() => remove(item.id)} className="text-t3 text-lg leading-none active:text-danger transition-colors">×</button>
          </div>
        ))}
      </div>

      {/* Checked items */}
      {checked.length > 0 && (
        <div className="px-4 mt-2">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-t3 text-xs font-semibold uppercase tracking-wider">In cart ({checkedCount})</p>
            <button onClick={clearChecked} className="text-danger text-xs font-semibold active:opacity-70">Clear</button>
          </div>
          <div className="flex flex-col gap-2">
            {checked.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-s1 border border-s3 rounded-xl px-4 py-3 opacity-60">
                <button
                  onClick={() => toggle(item.id)}
                  className="w-5 h-5 rounded-full bg-success border-2 border-success flex items-center justify-center flex-shrink-0
                    active:scale-90 transition-transform"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </button>
                <p className="text-t3 text-sm line-through flex-1">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky bottom actions */}
      {checkedCount > 0 && (
        <div className="absolute bottom-16 left-0 right-0 px-4 py-3 bg-bg/95 backdrop-blur-sm border-t border-s3">
          <button
            onClick={moveToPantry}
            className="w-full bg-terra text-white rounded-xl py-3.5 font-semibold text-sm
              active:scale-95 transition-transform shadow-[0_0_16px_rgba(212,101,74,0.3)]"
          >
            ✓ Move {checkedCount} item{checkedCount > 1 ? 's' : ''} to Pantry
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────
export default function PantryManager() {
  const navigate = useNavigate();
  const { pantry, addPantryItems, removePantryItem, addToast, groceryList, updateGroceryList } = useApp();

  const [mainTab, setMainTab] = useState('pantry'); // 'pantry' | 'grocery'
  const [activeTab, setActiveTab] = useState('All');
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
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

  const handleDelete = (id) => { removePantryItem(id); setSwipedId(null); };
  const handleEditSave = () => setEditingId(null);

  const handleAddItem = () => {
    if (!newItem.name) return;
    addPantryItems([{ id: `manual-${Date.now()}`, name: newItem.name, qty: newItem.qty || '1', category: 'Pantry staples', expiringSoon: false }]);
    setNewItem({ name: '', qty: '' });
    setNewItemMode(false);
    addToast(`${newItem.name} added to pantry`, 'success');
  };

  return (
    <div className="bg-bg flex flex-col relative" style={{ height: '100%' }}>
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-s3">
        <h1 className="font-serif text-2xl font-bold text-t1">Your kitchen</h1>
        <p className="text-t3 text-xs mt-0.5">Updated just now · {pantry.length} items</p>
      </div>

      {/* Main tab switcher */}
      <div className="flex border-b border-s3">
        <button
          onClick={() => setMainTab('pantry')}
          className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors duration-150
            ${mainTab === 'pantry' ? 'text-terra border-terra' : 'text-t3 border-transparent'}`}
        >
          🥫 Pantry
        </button>
        <button
          onClick={() => setMainTab('grocery')}
          className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors duration-150
            ${mainTab === 'grocery' ? 'text-terra border-terra' : 'text-t3 border-transparent'}`}
        >
          🛒 Grocery List
        </button>
      </div>

      {mainTab === 'grocery' ? (
        <GroceryList addPantryItems={addPantryItems} addToast={addToast} groceryList={groceryList} updateGroceryList={updateGroceryList} />
      ) : (
        <>
          {/* Scrollable area */}
          <div className="flex-1 overflow-y-auto scrollbar-none">
            {/* Action row */}
            <div className="flex gap-3 px-5 py-3 border-b border-s3">
              <button onClick={handleScan} disabled={scanning}
                className="flex-1 bg-terra text-white rounded-xl py-2.5 text-sm font-semibold
                  active:scale-95 transition-transform disabled:opacity-70">
                {scanning ? '🔄 Scanning...' : '📷 Scan fridge'}
              </button>
              <button onClick={() => setNewItemMode(true)}
                className="flex-1 bg-s2 border border-s3 text-t2 rounded-xl py-2.5 text-sm font-medium
                  active:scale-95 transition-transform">
                + Add item
              </button>
            </div>

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

            {newItemMode && (
              <div className="mx-5 my-3 bg-s1 border border-s3 rounded-xl p-4 animate-fade-in flex flex-col gap-2">
                <input value={newItem.name} onChange={e => setNewItem(v => ({ ...v, name: e.target.value }))}
                  placeholder="Item name..."
                  className="bg-s2 border border-s3 rounded-lg px-3 py-2.5 text-t1 text-sm placeholder-t3 focus:border-terra outline-none" />
                <input value={newItem.qty} onChange={e => setNewItem(v => ({ ...v, qty: e.target.value }))}
                  placeholder="Quantity (e.g. 2 cups)..."
                  className="bg-s2 border border-s3 rounded-lg px-3 py-2.5 text-t1 text-sm placeholder-t3 focus:border-terra outline-none" />
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
                <button key={cat} onClick={() => setActiveTab(cat)}
                  className={`flex-shrink-0 px-4 py-3 text-xs font-semibold border-b-2 transition-colors duration-150
                    ${activeTab === cat ? 'text-terra border-terra' : 'text-t3 border-transparent'}`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Items list */}
            <div className="flex flex-col gap-2 px-4 py-3">
              {filtered.map(item => (
                <div key={item.id} className="relative overflow-hidden rounded-xl">
                  {swipedId === item.id && (
                    <button onClick={() => handleDelete(item.id)}
                      className="absolute right-0 top-0 bottom-0 w-16 bg-danger flex items-center justify-center rounded-r-xl z-0">
                      <span className="text-white text-lg">🗑</span>
                    </button>
                  )}
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
                          <input autoFocus value={editQty} onChange={e => setEditQty(e.target.value)}
                            className="bg-s2 border border-terra rounded-lg px-2 py-1 text-t1 text-xs w-24 outline-none" />
                          <button onClick={handleEditSave} className="text-terra text-xs font-semibold">Save</button>
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
                      <button onClick={() => { setEditingId(item.id); setEditQty(item.qty); }}
                        className="text-t3 text-xs active:text-t1">Edit</button>
                    )}
                    <button onClick={() => setSwipedId(swipedId === item.id ? null : item.id)}
                      className="text-t3 text-xs pl-1 active:text-t1">···</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA — always visible above bottom nav */}
          <div className="flex-shrink-0 px-4 py-3 bg-bg border-t border-s3">
            <button onClick={() => navigate('/discover')}
              className="w-full bg-terra text-white rounded-xl py-4 font-semibold text-base
                active:scale-95 transition-transform shadow-[0_0_20px_rgba(212,101,74,0.35)]">
              🤖 What can I make tonight?
            </button>
          </div>
        </>
      )}
    </div>
  );
}
