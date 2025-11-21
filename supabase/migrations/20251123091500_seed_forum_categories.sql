-- Varsayılan forum kategorileri ve alt forumlar
DO $$
DECLARE
  cat_duyurular uuid;
  cat_elektronik uuid;
  cat_programlama uuid;
  cat_genel uuid;
BEGIN
  INSERT INTO forum_categories (name, slug, description)
  VALUES ('Duyurular', 'duyurular', 'Resmi duyurular ve topluluk kuralları')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
  RETURNING id INTO cat_duyurular;

  INSERT INTO forum_categories (name, slug, description)
  VALUES ('Elektronik Soruları', 'elektronik-sorulari', 'Elektronikle ilgili yardım ve fikir paylaşımları')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
  RETURNING id INTO cat_elektronik;

  INSERT INTO forum_categories (name, slug, description)
  VALUES ('Programlama', 'programlama', 'Kodlama, mikrodenetleyici ve yazılım tartışmaları')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
  RETURNING id INTO cat_programlama;

  INSERT INTO forum_categories (name, slug, description)
  VALUES ('Genel Sohbet', 'genel-sohbet', 'Topluluk sohbeti ve off-topic paylaşımlar')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
  RETURNING id INTO cat_genel;

  -- Duyurular alt forumları
  INSERT INTO forum_forums (category_id, name, slug, description)
  VALUES (cat_duyurular, 'Kurallar', 'kurallar', 'Forum kuralları ve yönergeler')
  ON CONFLICT (category_id, slug) DO NOTHING;

  INSERT INTO forum_forums (category_id, name, slug, description)
  VALUES (cat_duyurular, 'Site Güncellemeleri', 'site-guncellemeleri', 'Yeni özellikler ve değişiklikler')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- Elektronik alt forumları
  INSERT INTO forum_forums (category_id, name, slug, description)
  VALUES (cat_elektronik, 'Temel', 'temel', 'Temel elektronik soruları ve komponentler')
  ON CONFLICT (category_id, slug) DO NOTHING;

  INSERT INTO forum_forums (category_id, name, slug, description)
  VALUES (cat_elektronik, 'Uygulamalı', 'uygulamali', 'Devre kurulumları ve pratik sorunlar')
  ON CONFLICT (category_id, slug) DO NOTHING;

  INSERT INTO forum_forums (category_id, name, slug, description)
  VALUES (cat_elektronik, 'Projeler', 'projeler', 'Paylaşılan projeler ve geri bildirimler')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- Programlama alt forumları
  INSERT INTO forum_forums (category_id, name, slug, description)
  VALUES (cat_programlama, 'Arduino', 'arduino', 'Arduino kodlama ve shield tartışmaları')
  ON CONFLICT (category_id, slug) DO NOTHING;

  INSERT INTO forum_forums (category_id, name, slug, description)
  VALUES (cat_programlama, 'ESP32', 'esp32', 'ESP32 ile IoT projeleri ve sorun çözümü')
  ON CONFLICT (category_id, slug) DO NOTHING;

  INSERT INTO forum_forums (category_id, name, slug, description)
  VALUES (cat_programlama, 'Python', 'python', 'Python kodları, veri işleme ve otomasyon')
  ON CONFLICT (category_id, slug) DO NOTHING;

  INSERT INTO forum_forums (category_id, name, slug, description)
  VALUES (cat_programlama, 'C++', 'c-plus-plus', 'C/C++ ve gömülü yazılım konuları')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- Genel sohbet alt forumu
  INSERT INTO forum_forums (category_id, name, slug, description)
  VALUES (cat_genel, 'Sohbet', 'sohbet', 'Topluluk üyeleri arasında serbest sohbet')
  ON CONFLICT (category_id, slug) DO NOTHING;
END;
$$;
