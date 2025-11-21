import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Zap, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
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

      window.location.href = '/admin';
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
    const { error } = await signInWithGoogle('/admin');
    if (error) {
      console.error('Google sign-in error:', error);
      setError('Google ile giriş başarısız: ' + error.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 electric-gradient"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1MCwyMDQsMjEsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-zinc-900/80 backdrop-blur-lg border border-green-500/20 rounded-lg p-8 shadow-2xl">
          <div className="flex items-center justify-center mb-8">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Zap className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-green-500 mb-2 glow-text">
            {mode === 'login' ? 'Admin Girişi' : 'Admin Kayıt'}
          </h1>
          <p className="text-center text-zinc-400 mb-8">Bobin Kardeşler Yönetim Paneli</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-green-400 text-sm">{success}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                E-posta
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100 transition-colors"
                placeholder="admin@bobinkardesler.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                Şifre
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-green-500 text-zinc-100 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-500 text-zinc-950 font-bold rounded-lg hover:bg-green-400 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 glow-box"
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
                <div className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-zinc-900/80 px-2 text-zinc-500">veya</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-3 bg-white text-zinc-900 font-semibold rounded-lg hover:bg-zinc-100 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              <span>Google ile {mode === 'login' ? 'giriş yap' : 'kaydol'}</span>
            </button>

            <p className="text-center text-sm text-zinc-400">
              {mode === 'login' ? 'Hesabın yok mu?' : 'Zaten hesabın var mı?'}{' '}
              <button
                type="button"
                className="text-green-400 hover:text-green-300 font-semibold"
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
