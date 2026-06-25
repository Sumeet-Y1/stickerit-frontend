import { Link, useLocation, useNavigate } from 'react-router';
import { Chrome, Github, UploadCloud, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLoginPrompt } from '../context/LoginPromptContext';
import { authUrl } from '../lib/backend';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Explore', to: '/explore' },
  { label: 'Upload', to: '/upload' },
  { label: 'Profile', to: '/profile' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { session, authenticated } = useAuth();
  const { openLoginPrompt } = useLoginPrompt();
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}${location.hash}`;

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-black bg-white">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="rounded-full bg-black px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white">
          StickerIT
        </Link>

        <nav className="flex flex-1 flex-wrap items-center justify-center gap-2">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-full border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-[0.08em] transition-transform hover:-translate-y-0.5 ${
                  active ? 'bg-[#ffd044] text-black' : 'bg-white text-black'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          {authenticated ? (
            <>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#78e5bd] px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-black"
              >
                <UserRound size={14} />
                {session?.user.email.split('@')[0]}
              </button>
              <button
                type="button"
                onClick={() => navigate('/upload')}
                className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#ef84d8] px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-black"
              >
                <UploadCloud size={14} />
                Upload
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => openLoginPrompt('Log in to upload, like, and save stickers.', returnTo)}
                className="rounded-full border-2 border-black bg-[#ffd044] px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-black"
              >
                Log in
              </button>
              <a
                href={authUrl('github')}
                className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-white"
              >
                <Github size={14} />
                GitHub
              </a>
              <a
                href={authUrl('google')}
                className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#ef84d8] px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-black"
              >
                <Chrome size={14} />
                Google
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
