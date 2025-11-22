import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link as AppLink } from '../components/Link';
import { LogOut, Mail, ShieldCheck, User, Link as LinkIcon, Loader2 } from 'lucide-react';

export function AccountSettingsPage() {
  const { user, loading, isGoogleLinked, signOut, linkGoogleAccount, signInWithGoogle } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleLinkGoogle = async () => {
    setError(null);
    setStatus(null);
    setBusy(true);
    try {
      const { error: linkError } = isGoogleLinked ? await signInWithGoogle('/account') : await linkGoogleAccount();
      if (linkError) {
        setError(linkError.message ?? 'Google bağlantısı başarısız');
      } else {
        setStatus('Google hesabı başarıyla bağlandı.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      await signOut();
      window.location.href = '/';
    } catch (err: any) {
      setError(err?.message ?? 'Çıkış yapılamadı');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2 text-zinc-300">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-zinc-900/80 border border-white/10 rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/30">
              <User className="w-10 h-10 text-green-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Hesabına giriş yap</h1>
          <p className="text-zinc-400">Hesap ayarlarını yönetmek için giriş yap veya yeni bir hesap oluştur.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AppLink
              href="/login"
              className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-green-500 text-zinc-950 font-semibold hover:bg-green-400 transition"
            >
              Giriş Yap
            </AppLink>
            <AppLink
              href="/register"
              className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl border border-white/10 text-white hover:border-green-400/60 transition"
            >
              Hesap Oluştur
            </AppLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-zinc-900/70 border border-white/10 rounded-2xl shadow-xl p-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                <ShieldCheck className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Hesap Ayarları</h1>
                <p className="text-zinc-400">E-posta ve bağlantılı oturum açma yöntemlerini yönet.</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-zinc-200 hover:border-red-400/60 hover:text-red-200 transition"
              disabled={busy}
            >
              <LogOut className="w-4 h-4" />
              Çıkış
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/10 bg-zinc-950/60 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm text-zinc-400">E-posta</p>
                  <p className="text-white font-semibold">{user.email}</p>
                </div>
              </div>
              <p className="text-sm text-zinc-500">Giriş için kullandığın ana e-posta adresi.</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-950/60 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <LinkIcon className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm text-zinc-400">Google bağlantısı</p>
                  <p className="text-white font-semibold">{isGoogleLinked ? 'Bağlı' : 'Bağlı değil'}</p>
                </div>
              </div>
              <p className="text-sm text-zinc-500">
                {isGoogleLinked
                  ? 'Google ile giriş yapabilirsin. Bağlantı sorununda yeniden yetkilendirebilirsin.'
                  : 'Google hesabını bağlayarak tek tıkla giriş yapabilirsin.'}
              </p>
              <button
                onClick={handleLinkGoogle}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-zinc-950 font-semibold hover:bg-green-400 transition disabled:opacity-60"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                {isGoogleLinked ? 'Google ile yeniden bağlan' : 'Google hesabını bağla'}
              </button>
            </div>
          </div>

            {status && <p className="text-sm text-green-400">{status}</p>}
            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex flex-wrap gap-3 pt-2">
              <AppLink
                href="/admin"
                className="inline-flex items-center px-4 py-2 rounded-lg border border-white/10 text-white hover:border-green-400/60 transition"
              >
              Admin Paneli
            </AppLink>
          </div>
        </div>
      </div>
    </div>
  );
}
