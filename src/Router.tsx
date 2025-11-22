import { useEffect, useState } from 'react';
import { HomePage } from './pages/HomePage';
import { VideosPage } from './pages/VideosPage';
import { VideoSuggestionsPage } from './pages/VideoSuggestionsPage';
import { BlogPage } from './pages/BlogPage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { AboutPage } from './pages/AboutPage';
import { SearchPage } from './pages/SearchPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { GiveawaysPage } from './pages/GiveawaysPage';
import { CommunityPage } from './pages/CommunityPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { PollsPage } from './pages/PollsPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { AdminLoginPage } from './pages/admin/LoginPage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { BlogListPage } from './pages/admin/BlogListPage';
import { BlogEditorPage } from './pages/admin/BlogEditorPage';
import { VideoSuggestionsAdminPage } from './pages/admin/VideoSuggestionsAdminPage';
import { GiveawaysAdminPage } from './pages/admin/GiveawaysAdminPage';
import { CommunityAdminPage } from './pages/admin/CommunityAdminPage';
import { AnnouncementsAdminPage } from './pages/admin/AnnouncementsAdminPage';
import { ProjectsAdminPage } from './pages/admin/ProjectsAdminPage';
import { PollsAdminPage } from './pages/admin/PollsAdminPage';
import { NewsletterAdminPage } from './pages/admin/NewsletterAdminPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AccountSettingsPage } from './pages/AccountSettingsPage';

export function Router() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isAdminPage = path.startsWith('/admin');
  const showLayout = !path.includes('/admin/login');

  let content = null;

  if (path === '/' || path === '') {
    content = <HomePage />;
  } else if (path === '/videos') {
    content = <VideosPage />;
  } else if (path === '/video-fikirleri') {
    content = <VideoSuggestionsPage />;
  } else if (path === '/blog') {
    content = <BlogPage />;
  } else if (path.startsWith('/blog/')) {
    const slug = path.replace('/blog/', '');
    content = <BlogDetailPage slug={slug} />;
  } else if (path === '/ara' || path.startsWith('/ara?')) {
    content = <SearchPage />;
  } else if (path === '/istatistikler') {
    content = <AnalyticsPage />;
  } else if (path === '/kategoriler') {
    content = <CategoriesPage />;
  } else if (path === '/cekilisler') {
    content = <GiveawaysPage />;
  } else if (path === '/topluluk') {
    content = <CommunityPage />;
  } else if (path === '/projeler') {
    content = <ProjectsPage />;
  } else if (path === '/anketler') {
    content = <PollsPage />;

  } else if (path === '/forum') {
    content = <ForumLandingPage />;
  } else if (path === '/forum/createforum' || path === '/forum/yeni-konu') {
    content = <ForumCreatePage />;
  } else if (path === '/forum/son-konular' || path === '/forum/konu/cevapsiz') {
    content = <ForumLatestPage />;
  } else if (path.startsWith('/forum/konu/')) {
    const cleanedPath = path.replace(/\/?yanit?$/, '');
    const slugAndId = decodeURIComponent(cleanedPath.replace('/forum/konu/', ''));
    content = <ForumThreadPage slugAndId={slugAndId} />;
  } else if (path.startsWith('/forum/kategori/')) {
    const parts = path.replace('/forum/kategori/', '').split('/').filter(Boolean);
    if (parts.length >= 2) {
      content = <ForumForumPage categorySlug={parts[0]} forumSlug={parts[1]} />;
    } else if (parts.length === 1) {
      content = <ForumCategoryPage categorySlug={parts[0]} />;
    } else {
      content = <ForumLandingPage />;
    }
  } else if (path === '/duyurular') {
    content = <AnnouncementsPage />;
  } else if (path === '/hakkimizda') {
    content = <AboutPage />;
  } else if (path === '/account') {
    content = <AccountSettingsPage />;
  } else if (path === '/login') {
    content = <LoginPage redirectPath="/account" />;
  } else if (path === '/register') {
    content = <LoginPage redirectPath="/account" defaultMode="register" />;
  } else if (path === '/admin/login') {
    content = <AdminLoginPage />;
  } else if (path === '/admin') {
    content = <AdminDashboard />;
  } else if (path === '/admin/blog') {
    content = <BlogListPage />;
  } else if (path === '/admin/blog/new') {
    content = <BlogEditorPage />;
  } else if (path.startsWith('/admin/blog/')) {
    const postId = path.replace('/admin/blog/', '');
    content = <BlogEditorPage postId={postId} />;
  } else if (path === '/admin/video-suggestions') {
    content = <VideoSuggestionsAdminPage />;
  } else if (path === '/admin/cekilisler') {
    content = <GiveawaysAdminPage />;
  } else if (path === '/admin/community') {
    content = <CommunityAdminPage />;
  } else if (path === '/admin/announcements') {
    content = <AnnouncementsAdminPage />;
  } else if (path === '/admin/projects') {
    content = <ProjectsAdminPage />;
  } else if (path === '/admin/polls') {
    content = <PollsAdminPage />;
  } else if (path === '/admin/newsletter') {
    content = <NewsletterAdminPage />;
  } else if (path === '/admin/settings') {
    content = <SettingsPage />;
  } else {
    content = (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-green-500 mb-4">404</h1>
          <p className="text-zinc-400 mb-8">Sayfa bulunamadı</p>
          <a
            href="/"
            className="px-6 py-3 bg-green-500 text-zinc-950 rounded-lg hover:bg-green-400 transition-colors font-bold"
          >
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      {showLayout && <Navbar />}
      {content}
      {showLayout && !isAdminPage && <Footer />}
    </>
  );
}
