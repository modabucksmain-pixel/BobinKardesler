import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import { supabaseConfigured } from '../lib/supabase';

export function SystemStatusBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (supabaseConfigured || dismissed) return null;

  return (
    <div className="bg-amber-500/10 border border-amber-500/40 text-amber-200 px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-500/20 rounded-full">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <p className="font-semibold">Canlı veriler devre dışı.</p>
          <p className="text-sm text-amber-100/80">
            Supabase yapılandırması eksik olduğu için bazı dinamik özellikler şu anda örnek verilerle gösteriliyor.
          </p>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-200 hover:text-white transition-colors"
        aria-label="Uyarıyı kapat"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
