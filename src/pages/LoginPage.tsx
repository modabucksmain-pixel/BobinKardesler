import { useState } from 'react';
import { AlertCircle, Loader2, LogIn, Mail, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps {
  redirectPath?: string;
  defaultMode?: 'login' | 'register';
}

export function LoginPage({ redirectPath = '/account', defaultMode = 'login' }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'login') {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError('Giriş başarısız: ' + signInError.message);
        setLoading(false);
        return;
      }

      window.location.href = redirectPath;
    } else {
      const { error: signUpError } = await signUp(email, password);

      if (signUpError) {
        setError('Kayıt başarısız: ' + signUpError.message);
        setLoading(false);
        return;
      }

      setSuccess('Kayıt başarılı! E-postanı kontrol ederek hesabını doğrula ve giriş yap.');
      setMode('login');
    }

    setLoading(false);
  }

  async function handleGoogleSignIn() {
    setError('');
    setSuccess('');
    const { error: googleError } = await signInWithGoogle(redirectPath);

    if (googleError) {
      setError('Google ile giriş başarısız: ' + googleError.message);
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.15),_transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(14,165,233,0.12),_transparent_35%)]" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center space-x-3 rounded-full bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Topluluk hesabıyla güvenli giriş</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
            Bobin Kardeşler hesabına{' '}
            <span className="bg-gradient-to-r from-green-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
              {mode === 'login' ? 'giriş yap' : 'katıl'}
            </span>
          </h1>
          <p className="max-w-2xl text-lg text-zinc-300">
            Forum, çekilişler, özel projeler ve daha fazlası için tek bir hesap. Hızlıca giriş yap veya yeni bir hesap oluştur
            ve topluluğa hemen katıl.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: 'Forum ve topluluk', description: 'Konulara katıl, oy ver ve yeni gönderileri keşfet.' },
              { title: 'Çekilişler ve projeler', description: 'Etkinliklere katıl ve özel projelerden haberdar ol.' },
              { title: 'Kişiselleştirme', description: 'İstatistiklerini ve aboneliklerini tek ekrandan yönet.' },
              { title: 'Güvenli oturum', description: 'Supabase destekli kimlik doğrulama ile korunur.' },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-lg shadow-emerald-500/5">
                <div className="mb-2 flex items-center space-x-2 text-green-400">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-semibold">{item.title}</span>
                </div>
                <p className="text-sm text-zinc-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl shadow-emerald-500/10 backdrop-blur">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Hesabına giriş yap</p>
                <h2 className="text-2xl font-bold text-white">{mode === 'login' ? 'Tekrar hoş geldin' : 'Yeni hesap oluştur'}</h2>
              </div>
              <div className="rounded-full bg-green-500/10 p-3 text-green-400">
                {mode === 'login' ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-start space-x-3 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-start space-x-3 rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-sm text-green-200">
                  <ShieldCheck className="h-5 w-5 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <label className="space-y-2 text-sm font-medium text-zinc-200" htmlFor="email">
                <span>E-posta adresi</span>
                <div className="flex items-center space-x-3 rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 focus-within:border-green-500 focus-within:bg-zinc-900">
                  <Mail className="h-4 w-4 text-zinc-500" />
                  <input
                    id="email"
                    type="email"
                    className="w-full bg-transparent text-zinc-100 outline-none placeholder:text-zinc-600"
                    placeholder="ornek@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </label>

              <label className="space-y-2 text-sm font-medium text-zinc-200" htmlFor="password">
                <span>Şifre</span>
                <div className="flex items-center space-x-3 rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 focus-within:border-green-500 focus-within:bg-zinc-900">
                  <Sparkles className="h-4 w-4 text-zinc-500" />
                  <input
                    id="password"
                    type="password"
                    className="w-full bg-transparent text-zinc-100 outline-none placeholder:text-zinc-600"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/25 transition hover:shadow-emerald-400/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{mode === 'login' ? 'Giriş yapılıyor...' : 'Hesap oluşturuluyor...'}</span>
                  </>
                ) : (
                  <>
                    {mode === 'login' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                    <span>{mode === 'login' ? 'Giriş yap' : 'Kayıt ol'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="flex w-full items-center justify-center space-x-2 rounded-xl border border-zinc-800 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/15"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-4 w-4" />
                <span>Google ile {mode === 'login' ? 'giriş yap' : 'kaydol'}</span>
              </button>

              <p className="text-center text-sm text-zinc-400">
                {mode === 'login' ? 'Hesabın yok mu?' : 'Zaten hesabın var mı?'}{' '}
                <button
                  type="button"
                  className="font-semibold text-green-400 hover:text-emerald-300"
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setError('');
                    setSuccess('');
                  }}
                >
                  {mode === 'login' ? 'Hemen hesap oluştur' : 'Giriş yap'}
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
