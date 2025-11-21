-- Ek forum performans indeksleri
CREATE INDEX IF NOT EXISTS idx_forum_threads_created_at ON forum_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_categories_created_at ON forum_categories(created_at);
