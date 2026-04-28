import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import PhoneShell from './components/PhoneShell';
import Onboarding from './screens/Onboarding';
import Home from './screens/Home';
import RecipeLibrary from './screens/RecipeLibrary';
import RecipeDetail from './screens/RecipeDetail';
import CookingMode from './screens/CookingMode';
import VoiceHandoff from './screens/VoiceHandoff';
import PostCookRating from './screens/PostCookRating';
import StartCooking from './screens/StartCooking';
import ImportRecipe from './screens/ImportRecipe';
import Profile from './screens/Profile';
import Subscription from './screens/Subscription';

function AppRoutes() {
  const { onboardingComplete } = useApp();

  if (!onboardingComplete) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center py-8">
        <div className="relative" style={{ width: 393, height: 852 }}>
          <div className="absolute -left-[3px] top-[172px] w-[3px] h-8   bg-[#4A4A4A] rounded-l-sm" />
          <div className="absolute -left-[3px] top-[222px] w-[3px] h-14  bg-[#4A4A4A] rounded-l-sm" />
          <div className="absolute -left-[3px] top-[296px] w-[3px] h-14  bg-[#4A4A4A] rounded-l-sm" />
          <div className="absolute -right-[3px] top-[240px] w-[3px] h-20 bg-[#4A4A4A] rounded-r-sm" />
          <div className="absolute inset-0 rounded-[50px]" style={{
            background: '#1A1A1A',
            boxShadow: '0 0 0 1px #3A3A3A, 0 0 0 3px #2A2A2A, 0 40px 100px rgba(0,0,0,0.85), inset 0 0 0 1px rgba(255,255,255,0.05)',
          }} />
          <div className="absolute inset-[3px] rounded-[47px] overflow-hidden bg-bg flex flex-col">
            <div className="flex-1 overflow-y-auto scrollbar-none">
              <Onboarding />
            </div>
            <div className="flex-shrink-0 flex justify-center pb-2 pt-1">
              <div className="w-32 h-[5px] bg-white/20 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<PhoneShell />}>
        <Route index element={<Home />} />
        <Route path="recipes" element={<RecipeLibrary />} />
        <Route path="recipes/:id" element={<RecipeDetail />} />
        <Route path="recipes/:id/cook" element={<CookingMode />} />
        <Route path="recipes/:id/voice" element={<VoiceHandoff />} />
        <Route path="recipes/:id/rating" element={<PostCookRating />} />
        <Route path="cook" element={<StartCooking />} />
        <Route path="import" element={<ImportRecipe />} />
        <Route path="profile" element={<Profile />} />
        <Route path="subscription" element={<Subscription />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </HashRouter>
  );
}
