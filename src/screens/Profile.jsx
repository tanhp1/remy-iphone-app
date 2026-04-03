import { useApp } from '../context/AppContext';

export default function Profile() {
  const { user } = useApp();
  return (
    <div className="bg-bg min-h-full px-5 py-6">
      <h1 className="font-serif text-2xl font-bold text-t1 mb-6">Profile</h1>
      <div className="bg-s1 border border-s3 rounded-2xl p-5 flex flex-col items-center mb-6">
        <div className="w-16 h-16 rounded-full bg-terra flex items-center justify-center mb-3">
          <span className="text-white text-2xl font-bold">{user.name[0]}</span>
        </div>
        <p className="text-t1 font-bold text-lg">{user.name}</p>
        <p className="text-t2 text-sm">{user.skillLevel} · {user.dietaryLifestyle}</p>
        {user.isPro && (
          <span className="mt-2 bg-terra/20 text-terra text-xs font-bold px-3 py-1 rounded-full border border-terra/30">
            ✨ Remy Pro
          </span>
        )}
      </div>
      {[
        { label: 'Dietary lifestyle', value: user.dietaryLifestyle },
        { label: 'Skill level', value: user.skillLevel },
        { label: 'Favorite cuisines', value: user.favoriteCuisines.join(', ') },
        { label: 'Time budget', value: `${user.timeBudget} min` },
      ].map(row => (
        <div key={row.label} className="flex items-center justify-between py-3.5 border-b border-s3">
          <span className="text-t2 text-sm">{row.label}</span>
          <span className="text-t1 text-sm font-medium">{row.value}</span>
        </div>
      ))}
    </div>
  );
}
