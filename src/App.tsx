import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, type Location } from 'react-router';
import { Toaster } from 'sonner';
import LoginModal from './components/LoginModal';
import { useAuth } from './context/AuthContext';
import { useLoginPrompt } from './context/LoginPromptContext';
import ExplorePage from './pages/ExplorePage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import StickerDetailPage from './pages/StickerDetailPage';
import UploadPage from './pages/UploadPage';
import Navbar from './sections/Navbar';

function OAuthReturnSync() {
  const { ready, session, restoreReturnTo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!ready || !session) {
      return;
    }

    const pending = restoreReturnTo();
    if (!pending) {
      return;
    }

    const current = `${location.pathname}${location.search}${location.hash}`;
    if (current !== pending) {
      navigate(pending, { replace: true });
    }
  }, [location.hash, location.pathname, location.search, navigate, ready, restoreReturnTo, session]);

  return null;
}

function LoginPromptLayer() {
  const { prompt, closeLoginPrompt } = useLoginPrompt();

  if (!prompt.open) {
    return null;
  }

  return <LoginModal onClose={closeLoginPrompt} />;
}

export default function App() {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | null;
  const backgroundLocation = state?.backgroundLocation;

  return (
    <div className="min-h-screen bg-[#fff7e8] text-black">
      <OAuthReturnSync />
      <Navbar />
      <Routes location={backgroundLocation || location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/sticker/:id" element={<StickerDetailPage />} />
        <Route path="/s/:token" element={<StickerDetailPage tokenMode />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {backgroundLocation && (
        <Routes>
          <Route path="/sticker/:id" element={<StickerDetailPage />} />
          <Route path="/s/:token" element={<StickerDetailPage tokenMode />} />
        </Routes>
      )}
      <LoginPromptLayer />
      <Toaster
        position="top-right"
        theme="dark"
        richColors
        toastOptions={{
          style: {
            background: '#111111',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />
    </div>
  );
}
