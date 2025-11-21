# BobinKardesler

This project uses Supabase for authentication and content (announcements, giveaways, blog, etc.). Use the steps below to configure a fresh instance and ensure the admin announcement panel works.

## Local setup
1. Copy `.env.example` to `.env.local` and keep the provided Supabase URL and anon key (they already point to the new project). Add your YouTube API key/channel if you use the video widgets.
2. Install dependencies: `npm install`.
3. Start the app locally: `npm run dev`.

## Bootstrapping a new Supabase project
The repository already contains all migrations. To bring a new Supabase project up to date:

1. Open the Supabase SQL editor for the project at `https://knhawcenqscjmezortpr.supabase.co` (or use a `psql` connection with the service role key).
2. Paste and run the contents of [`supabase/new_instance_setup.sql`](./supabase/new_instance_setup.sql). This combines every migration (including the `announcements` table and its RLS policies) in the correct order.
3. Create an admin user from **Authentication → Users** in the Supabase dashboard and sign in through `/admin/login` in the app to manage announcements.

After the script runs and environment variables are set, creating announcements from the admin panel will insert rows into the `announcements` table, and published entries will display on the site once their `publish_at` time is reached.

## Forum kurulumu ve dokümantasyon

The forum pages under `/forum` are fully responsive and mirror the site’s typography, navbar, and footer. A Supabase-backed schema already exists in the migrations folder; mock data is enabled by default so the forum renders without backend setup. To switch to the real database, set `VITE_ENABLE_FORUM_MOCKS=false` in your environment.

### Örnek veritabanı şeması
- `forum_categories`, `forum_forums`, `forum_threads`, `forum_replies` (hiyerarşi ve içerik)
- `forum_likes`, `forum_reports`, `forum_notifications` (etkileşim ve moderasyon) — see `supabase/migrations/20251125131500_extend_forum_features.sql`
- Rol bilgisi `user_profiles.role` alanında tutulur (`admin`, `moderator`, `user`).

### Kurulum adımları
1. Supabase SQL Editörüne gidin ve tüm migration dosyalarını sırayla çalıştırın (yeni eklenen `20251125131500_extend_forum_features.sql` dahil).
2. İlk admin hesabı için Supabase Auth > Users üzerinden bir kullanıcı oluşturun ve `user_profiles.role` alanını `admin` yapın.
3. Lokal geliştirme: `npm install` ve `npm run dev`. Mock veri aktif olduğu için ek yapılandırmaya gerek yoktur; gerçek veritabanına geçmek için `.env.local` dosyanıza Supabase URL/Anon key ekleyin ve `VITE_ENABLE_FORUM_MOCKS=false` ayarlayın.
4. Örnek slug yapısı SEO uyumludur: `/forum/kategori/genel-elektronik/pasif-devre-elemanlari` veya `/forum/konu/esp8266-wifi-kopuyor-<id>`.

### Varsayılan kategori yapısı
- Duyurular → Site Duyuruları, Kurallar ve Rehberler
- Genel Elektronik → Temel Elektronik Soruları, Elektrik Tesisatı ve Güvenlik, Pasif Devre Elemanları
- Projeler ve Uygulamalar → Arduino / ESP / Mikrodenetleyici Projeleri, Güç Elektroniği Projeleri, Öğrenci Projeleri
- Bilgisayar & Yazılım → Donanım, Yazılım ve Programlama, Hata Giderme (Troubleshooting)
- Sohbet & Off-Topic → Genel Sohbet, Mizah/Eğlence, Öneri ve Geri Bildirim
