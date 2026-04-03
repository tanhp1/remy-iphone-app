import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import PhoneShell from './components/PhoneShell';
import Home from './screens/Home';
import RecipeLibrary from './screens/RecipeLibrary';
import RecipeDetail from './screens/RecipeDetail';
import CookingMode from './screens/CookingMode';
import VoiceHandoff from './screens/VoiceHandoff';
import PostCookRating from './screens/PostCookRating';
import PantryManager from './screens/PantryManager';
import Profile from './screens/Profile';

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <Routes>
          <Route element={<PhoneShell />}>
            <Route index element={<Home />} />
            <Route path="recipes" element={<RecipeLibrary />} />
            <Route path="recipes/:id" element={<RecipeDetail />} />
            <Route path="recipes/:id/cook" element={<CookingMode />} />
            <Route path="recipes/:id/voice" element={<VoiceHandoff />} />
            <Route path="recipes/:id/rating" element={<PostCookRating />} />
            <Route path="pantry" element={<PantryManager />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AppProvider>
    </HashRouter>
  );
}
