import { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link as AppLink } from '../components/Link';
import {
  Activity,
  Ban,
  Bell,
  Eye,
  Hash,
  Link as LinkIcon,
  Loader2,
  LogOut,
  Mail,
  MessageSquare,
  ShieldCheck,
  Share2,
  User,
  UserCheck,
} from 'lucide-react';

export function AccountSettingsPage() {
  const { user, loading, isGoogleLinked, signOut, linkGoogleAccount, signInWithGoogle } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const displayName = useMemo(() => {
    const metadata = user?.user_metadata ?? {};
    return (
      metadata.username ||
      metadata.full_name ||
      user?.email?.split('@')[0] ||
      'Kullanıcı'
    );
  }, [user]);

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
    if (busy) return;
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      await signOut();
      window.location.href = '/';
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message ?? 'Çıkış yapılamadı');
      } else {
        setError('Çıkış yapılamadı');
      }
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

  const placeholderHref = '/yakinda';

  const actionItems = [
    { label: 'Haber akışı', description: 'Toplulukta olup bitenleri gör', icon: Activity, href: '/topluluk' },
    { label: 'Alınan ifadeler', description: 'Sana gelen etkileşimler', icon: MessageSquare, href: placeholderHref },
    { label: 'Tüm içeriğiniz', description: 'Paylaştığın gönderiler', icon: Hash, href: placeholderHref },
    { label: 'Bildirimler', description: 'Uyarı ve hatırlatmalar', icon: Bell, href: placeholderHref },
    {
      label: 'Hesap detayları',
      description: 'Profil bilgilerini düzenle',
      icon: UserCheck,
      action: () => {
        document.getElementById('account-email')?.scrollIntoView({ behavior: 'smooth' });
        setStatus('Hesap detayları bölümüne gidildi.');
      },
    },
    {
      label: 'Bağlı hesaplar',
      description: 'Google bağlantını yönet',
      icon: LinkIcon,
      action: () => {
        document.getElementById('linked-accounts')?.scrollIntoView({ behavior: 'smooth' });
        setStatus('Bağlı hesaplar bölümüne gidildi.');
      },
    },
    { label: 'Şifre ve güvenlik', description: 'Giriş seçeneklerini kontrol et', icon: ShieldCheck, href: placeholderHref },
    { label: 'Takip ettiklerim', description: 'Favori hesapların', icon: User, href: placeholderHref },
    { label: 'Gizlilik', description: 'Görünürlük tercihleri', icon: Eye, href: placeholderHref },
    { label: 'Kara liste', description: 'Engellediğin kullanıcılar', icon: Ban, href: placeholderHref },
    { label: 'Sosyal seçenekler', description: 'Paylaşım ve bağlantılar', icon: Share2, href: placeholderHref },
    { label: 'Çıkış', description: 'Oturumu kapat', icon: LogOut, action: handleSignOut },
  ];

  return (
    <div className="min-h-screen bg-slate-100 py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white shadow-lg border border-slate-200 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 text-green-700 flex items-center justify-center text-2xl font-bold uppercase">
                {displayName.slice(0, 2)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{displayName}</h1>
                <p className="text-sm text-slate-500">{user.email}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-600">
                  <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> Mesajlar: 0</span>
                  <span className="flex items-center gap-1"><Share2 className="w-4 h-4" /> Beğeniler: 0</span>
                  <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> Ödül Puanları: 0</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:border-red-300 hover:text-red-500 transition bg-white"
              disabled={busy}
            >
              <LogOut className="w-4 h-4" />
              Çıkış
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {actionItems.map((item) => {
              const Icon = item.icon;
              const commonClasses =
                'w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition shadow-sm';

              if (item.href) {
                return (
                  <AppLink key={item.label} href={item.href} className={commonClasses}>
                    <div className="flex items-center gap-3 text-left">
                      <div className="p-2 rounded-lg bg-green-500/10 text-green-600 border border-green-500/20">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{item.label}</p>
                        <p className="text-sm text-slate-500">{item.description}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">Git</span>
                  </AppLink>
                );
              }

              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`${commonClasses} text-left`}
                  type="button"
                  disabled={busy && item.label === 'Çıkış'}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10 text-green-600 border border-green-500/20">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.label}</p>
                      <p className="text-sm text-slate-500">{item.description}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">{item.label === 'Çıkış' ? 'Kapat' : 'Yakında'}</span>
                </button>
              );
            })}
          </div>

          {status && <p className="text-sm text-green-600 mt-4">{status}</p>}
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div id="account-email" className="bg-white shadow-lg border border-slate-200 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-slate-500">E-posta</p>
                <p className="text-lg font-semibold text-slate-900">{user.email}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">Giriş için kullandığın ana e-posta adresi.</p>
          </div>

          <div id="linked-accounts" className="bg-white shadow-lg border border-slate-200 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-3">
              <LinkIcon className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-slate-500">Google bağlantısı</p>
                <p className="text-lg font-semibold text-slate-900">{isGoogleLinked ? 'Bağlı' : 'Bağlı değil'}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              {isGoogleLinked
                ? 'Google ile giriş yapabilirsin. Bağlantı sorununda yeniden yetkilendirebilirsin.'
                : 'Google hesabını bağlayarak tek tıkla giriş yapabilirsin.'}
            </p>
            <button
              onClick={handleLinkGoogle}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-400 transition disabled:opacity-60"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
              {isGoogleLinked ? 'Google ile yeniden bağlan' : 'Google hesabını bağla'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
