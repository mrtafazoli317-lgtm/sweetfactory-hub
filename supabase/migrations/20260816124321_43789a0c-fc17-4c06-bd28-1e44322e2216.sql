ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock integer NOT NULL DEFAULT 0;

INSERT INTO public.categories (slug, name, description, sort_order)
VALUES ('cookie', 'کوکی', 'کوکی‌های کره‌ای و شکلاتی با بافت ترد و طعم ماندگار', 5)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.site_content (key, value, label, group_name, is_long, sort_order) VALUES
  ('hero_headline', '20KAM', 'تیتر اصلی هیرو', 'hero', false, 1),
  ('hero_sub', 'تولید کننده انواع کلوچه، کوکی و آرد بسته بندی', 'زیرعنوان هیرو', 'hero', false, 2),
  ('hero_desc', 'کیفیت، تازگی و طعم ماندگار در هر بسته', 'توضیح کوتاه هیرو', 'hero', false, 3),
  ('hero_image_main', '/__l5e/assets-v1/c2c2f0e1-590c-453a-bcb1-eaadb4423109/hero-cookie.png', 'تصویر اصلی هیرو', 'hero', false, 4),
  ('hero_image_float1', '/images/product-koloche-walnut.jpg', 'تصویر شناور اول', 'hero', false, 5),
  ('hero_image_float2', '/images/product-flour-white.jpg', 'تصویر شناور دوم', 'hero', false, 6),
  ('about_short', '20KAM تولید کننده انواع کلوچه، کوکی و آرد بسته بندی با تمرکز بر کیفیت، تازگی و طعم ماندگار است.', 'متن کوتاه درباره ما', 'about', true, 7)
ON CONFLICT (key) DO NOTHING;