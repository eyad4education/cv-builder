import { useState } from 'react';
import { Download, Monitor, Moon, Sun } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { BottomNav } from './components/BottomNav';
import { CVForm } from './components/CVForm';
import { CVPreview } from './components/CVPreview';
import { Settings } from './components/Settings';
import { Button, Input, SaveStatus } from './components/ui';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { useCV } from './hooks/useCV';
import { generatePDF } from './utils/generatePDF';

export function AuthPage({ mode }) {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { theme, setTheme } = useTheme();
  const isSignUp = mode === 'signup';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        await signUp({ name, email, password });
      } else {
        await signIn({ email, password });
      }

      navigate('/dashboard');
    } catch (submitError) {
      setError(submitError.message || 'Something went wrong');
      setLoading(false);
      return;
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="flex-1 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden transition-colors border border-slate-100 dark:border-slate-700">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 mb-4">
                <span className="text-3xl">✏️</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">CV Builder</h1>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {isSignUp && (
                <Input
                  id="name"
                  label="Full Name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="John Doe"
                  required
                />
              )}

              <Input
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
              <Input
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />

              {isSignUp && (
                <Input
                  id="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              )}

              <Button type="submit" className="w-full mt-2 py-3 text-base" isLoading={loading}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <Link
                  to={isSignUp ? '/auth/signin' : '/auth/signup'}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer with version and theme toggle */}
        <div className="mt-8 flex flex-col items-center space-y-4">
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 p-1 transition-colors">
            <button
              onClick={() => setTheme('system')}
              className={`p-2 rounded-full transition-all duration-200 ${theme === 'system' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shadow-inner' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              aria-label="System theme"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`p-2 rounded-full transition-all duration-200 ${theme === 'light' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shadow-inner' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              aria-label="Light theme"
            >
              <Sun className="h-4 w-4" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-2 rounded-full transition-all duration-200 ${theme === 'dark' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shadow-inner' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              aria-label="Dark theme"
            >
              <Moon className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 tracking-wider">v1.0.0</p>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const { data, setData, isLoading, saveStatus } = useCV(Boolean(user));
  const [activeTab, setActiveTab] = useState('forms');
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setIsDownloading(true);
    try {
      await generatePDF(data);
    } catch (e) {
      console.error(e);
      alert('Failed to download PDF');
    } finally {
      setIsDownloading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-indigo-200 dark:bg-indigo-900 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors pb-16">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors shadow-sm">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">✏️</span>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">CV Builder</h1>
          </div>
          <SaveStatus status={saveStatus} />
        </div>
      </header>

      <main className="flex-1 w-full relative flex flex-col">
        {/* Forms Tab */}
        <div className={activeTab === 'forms' ? 'flex-1 pb-6' : 'hidden'}>
          <CVForm data={data} onChange={setData} />
        </div>

        {/* Preview Tab */}
        <div className={activeTab === 'preview' ? 'flex-1 flex flex-col h-full overflow-hidden' : 'hidden'}>
          <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-20">
            <Button variant="primary" className="w-full" onClick={handleDownload} isLoading={isDownloading}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
          <div className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-800 flex justify-center p-4 sm:p-8 custom-scrollbar">
            {/* Wrapper to handle scaling nicely without breaking layout */}
            <div className="relative" style={{ width: '210mm', height: '297mm', transformOrigin: 'top center', transform: 'scale(min(1, calc((100vw - 2rem) / 794)))' }}>
              <div className="absolute top-0 left-0 w-[210mm]">
                <CVPreview data={data} />
              </div>
            </div>
          </div>
        </div>

        {/* Settings Tab */}
        <div className={activeTab === 'settings' ? 'flex-1' : 'hidden'}>
          <Settings />
        </div>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
