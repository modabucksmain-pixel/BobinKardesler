import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Zap, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';

interface LoginPageProps {
  redirectPath?: string;
  defaultMode?: 'login' | 'register';
  title?: string;
  subtitle?: string;
}

export function AdminLoginPage({
  redirectPath = '/admin',
  defaultMode = 'login',
  title,
  subtitle,
}: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess('');

    if (mode === 'login') {
      const { error } = await signIn(email, password);

      if (error) {
        console.error('Login error:', error);
        setError('Giriş başarısız: ' + error.message);
        setLoading(false);
        return;
      }

      window.location.href = redirectPath;
    } else {
      const { error } = await signUp(email, password);

      if (error) {
        console.error('Signup error:', error);
        setError('Kayıt başarısız: ' + error.message);
        setLoading(false);
        return;
      }

      setSuccess('Kayıt başarılı! E-postanızı doğruladıktan sonra giriş yapabilirsiniz.');
      setMode('login');
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setSuccess('');
    const { error } = await signInWithGoogle(redirectPath);
    if (error) {
      console.error('Google sign-in error:', error);
      setError('Google ile giriş başarısız: ' + error.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-100 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
              <Zap className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Yönetici girişi</p>
              <h1 className="text-2xl font-bold text-slate-900">{title ?? 'Admin Paneli Oturumu'}</h1>
            </div>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            {subtitle ?? 'Admin paneline erişmek için giriş yap. Yalnızca yetkili hesaplar giriş yapabilir.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                E-posta
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-green-500 text-slate-900 placeholder:text-slate-400 transition-colors"
                placeholder="admin@bobinkardesler.com"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Şifre
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-green-500 text-slate-900 placeholder:text-slate-400 transition-colors"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-400 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{mode === 'login' ? 'Giriş yapılıyor...' : 'Kayıt yapılıyor...'}</span>
                </span>
              ) : (
                mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">veya</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-50 transition-all duration-200 flex items-center justify-center space-x-2 border border-slate-200"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              <span>Google ile {mode === 'login' ? 'giriş yap' : 'kaydol'}</span>
            </button>

            <p className="text-center text-sm text-slate-500">
              {mode === 'login' ? 'Hesabın yok mu?' : 'Zaten hesabın var mı?'}{' '}
              <button
                type="button"
                className="text-green-600 hover:text-green-500 font-semibold"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError('');
                  setSuccess('');
                }}
              >
                {mode === 'login' ? 'Kayıt ol' : 'Giriş yap'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
