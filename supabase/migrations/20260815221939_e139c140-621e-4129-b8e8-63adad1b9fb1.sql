
CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF lower(NEW.email) = 'mrtafazoli317@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories admin write" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  price numeric(12,0) NOT NULL DEFAULT 0,
  weight text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  details text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  gallery text[] NOT NULL DEFAULT '{}',
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT USING (true);
CREATE POLICY "products admin write" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_categories TO authenticated;
GRANT ALL ON public.blog_categories TO service_role;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blog cats public read" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "blog cats admin write" ON public.blog_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER blog_categories_updated BEFORE UPDATE ON public.blog_categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  cover_image text NOT NULL DEFAULT '',
  category_id uuid REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  is_published boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts public read" ON public.blog_posts FOR SELECT USING (is_published OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "posts admin write" ON public.blog_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER blog_posts_updated BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.site_content (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  label text NOT NULL DEFAULT '',
  group_name text NOT NULL DEFAULT 'general',
  is_long boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "content public read" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "content admin write" ON public.site_content FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER site_content_updated BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "media read" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "media admin write" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(),'admin'))
  WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(),'admin'));

INSERT INTO public.categories (slug, name, description, sort_order) VALUES
('kolocheh','کلوچه','کلوچه‌های سنتی و مغزدار با نان نرم و طعم خانگی',1),
('ard-900','آرد بسته‌بندی ۹۰۰ گرمی','آرد ویژه قنادی و خانگی در بسته‌بندی بهداشتی ۹۰۰ گرمی',2),
('shirini-ardi','شیرینی آردی','شیرینی‌های سنتی آردی با دستور اصیل ایرانی',3),
('gift-box','جعبه هدیه','باکس‌های هدیه ویژه مناسبت‌ها و سفارش‌های سازمانی',4);

INSERT INTO public.products (slug, name, category_id, price, weight, description, details, image_url, gallery, is_featured, sort_order) VALUES
('koloche-narm-khormaei','کلوچه نرم خرمایی',(SELECT id FROM public.categories WHERE slug='kolocheh'),185000,'۴۵۰ گرم','کلوچه نرم با مغز خرمای تازه و رایحه هل و دارچین.','مواد اولیه: آرد گندم درجه یک، خرمای مضافتی، روغن مایع آفتابگردان، شکر، هل، دارچین، شیر خشک.
ماندگاری: ۶ ماه در دمای محیط.
بسته‌بندی: کارتن ۱۲ عددی.','/images/product-koloche-date.jpg','{"/images/product-koloche-date.jpg","/images/factory-line.jpg"}',true,1),
('koloche-gerdoei','کلوچه گردویی',(SELECT id FROM public.categories WHERE slug='kolocheh'),210000,'۵۰۰ گرم','کلوچه مغزدار با گردوی تازه ایرانی و عسل طبیعی.','مواد اولیه: آرد گندم، مغز گردو، عسل، کره حیوانی، تخم‌مرغ، وانیل.
ماندگاری: ۵ ماه.
بسته‌بندی: کارتن ۱۰ عددی.','/images/product-koloche-walnut.jpg','{"/images/product-koloche-walnut.jpg"}',true,2),
('koloche-kakaii','کلوچه کاکائویی',(SELECT id FROM public.categories WHERE slug='kolocheh'),195000,'۴۵۰ گرم','کلوچه با مغز کاکائوی تلخ و بافت نرم مخصوص کودکان.','مواد اولیه: آرد گندم، پودر کاکائو، شکر، روغن، شیر.
ماندگاری: ۶ ماه.','/images/product-koloche-cocoa.jpg','{"/images/product-koloche-cocoa.jpg"}',false,3),
('ard-safid-900','آرد سفید قنادی ۹۰۰ گرمی',(SELECT id FROM public.categories WHERE slug='ard-900'),68000,'۹۰۰ گرم','آرد سفید نول مخصوص قنادی با درجه استخراج پایین و کیفیت یکنواخت.','نوع آرد: نول قنادی.
میزان پروتئین: ۹ تا ۱۰ درصد.
بسته‌بندی: پاکت سه لایه بهداشتی ۹۰۰ گرمی، کارتن ۲۰ عددی.','/images/product-flour-white.jpg','{"/images/product-flour-white.jpg"}',true,4),
('ard-sabusdar-900','آرد سبوس‌دار ۹۰۰ گرمی',(SELECT id FROM public.categories WHERE slug='ard-900'),72000,'۹۰۰ گرم','آرد سبوس‌دار مناسب نان‌های سنتی و رژیمی.','نوع آرد: سبوس‌دار کامل.
مناسب برای: نان سنگک، بربری خانگی، نان رژیمی.
بسته‌بندی: پاکت ۹۰۰ گرمی.','/images/product-flour-whole.jpg','{"/images/product-flour-whole.jpg"}',false,5),
('ard-berenji-900','آرد برنج ۹۰۰ گرمی',(SELECT id FROM public.categories WHERE slug='ard-900'),95000,'۹۰۰ گرم','آرد برنج آسیاب‌شده ویژه نان برنجی و شیرینی سنتی.','منشأ: برنج ایرانی.
آسیاب: سنگی با دانه‌بندی نرم.
بسته‌بندی: پاکت ۹۰۰ گرمی.','/images/product-flour-rice.jpg','{"/images/product-flour-rice.jpg"}',false,6),
('nan-berenji','نان برنجی سنتی',(SELECT id FROM public.categories WHERE slug='shirini-ardi'),240000,'۴۰۰ گرم','نان برنجی خوش‌عطر با گلاب و هل، خشک و لطیف.','مواد اولیه: آرد برنج، شکر، روغن، زرده تخم‌مرغ، گلاب، هل، خشخاش.
ماندگاری: ۴ ماه.','/images/product-nan-berenji.jpg','{"/images/product-nan-berenji.jpg"}',true,7),
('nan-nokhodchi','نان نخودچی',(SELECT id FROM public.categories WHERE slug='shirini-ardi'),255000,'۴۰۰ گرم','شیرینی سنتی نخودچی با بافت آب‌شونده و طعم اصیل.','مواد اولیه: آرد نخودچی، روغن، پودر قند، هل، پسته.
ماندگاری: ۴ ماه.','/images/product-nokhodchi.jpg','{"/images/product-nokhodchi.jpg"}',false,8),
('kolompeh','کلمپه سنتی',(SELECT id FROM public.categories WHERE slug='shirini-ardi'),230000,'۵۰۰ گرم','کلمپه با مغز خرما و ادویه سنتی، پخت روزانه.','مواد اولیه: آرد گندم، خرما، هل، دارچین، روغن.
ماندگاری: ۳ ماه.','/images/product-kolompeh.jpg','{"/images/product-kolompeh.jpg"}',false,9),
('gift-box-premium','باکس هدیه ویژه ۲۰کام',(SELECT id FROM public.categories WHERE slug='gift-box'),690000,'۱۲۰۰ گرم','جعبه هدیه چوبی شامل ترکیبی از کلوچه، نان برنجی و نخودچی؛ مناسب هدیه سازمانی.','محتویات: ۴ نوع محصول منتخب.
بسته‌بندی: جعبه چوبی با روبان و کارت تبریک.
امکان چاپ لوگوی سازمانی روی جعبه.','/images/product-gift-box.jpg','{"/images/product-gift-box.jpg"}',true,10);

INSERT INTO public.blog_categories (slug, name) VALUES
('quality','کیفیت و استاندارد'),('production','خط تولید'),('recipes','دانستنی‌های شیرینی'),('company','اخبار ۲۰کام');

INSERT INTO public.blog_posts (slug, title, excerpt, content, cover_image, category_id) VALUES
('secrets-of-soft-koloche','راز نرم ماندن کلوچه در کارخانه ۲۰کام','نرم ماندن کلوچه فقط به دستور پخت مربوط نیست؛ کنترل رطوبت، دمای فر و بسته‌بندی نقش تعیین‌کننده دارند.',
'کلوچه یکی از قدیمی‌ترین و محبوب‌ترین محصولات آردی ایران است و نرم ماندن آن پس از تولید، مهم‌ترین شاخص کیفیت نزد مصرف‌کننده به شمار می‌رود.

در کارخانه ۲۰کام، فرآیند تولید کلوچه از انتخاب آرد آغاز می‌شود. آرد مصرفی باید میزان پروتئین متعادلی داشته باشد تا خمیر هم قوام کافی بگیرد و هم پس از پخت خشک نشود.

مرحله دوم، کنترل دقیق رطوبت خمیر است. ما رطوبت خمیر را در هر شیفت اندازه‌گیری می‌کنیم تا اختلاف بین بچ‌های تولید به حداقل برسد.

استراحت خمیر یا همان تخمیر کوتاه، باعث می‌شود شبکه گلوتنی به‌درستی شکل بگیرد و بافت نهایی محصول لطیف‌تر شود.

مغز خرما یا گردو پیش از تزریق به داخل خمیر، از نظر رطوبت و دمای مغز کنترل می‌شود؛ مغز بیش از حد خشک، رطوبت نان را جذب می‌کند و محصول را سفت می‌سازد.

دمای فر تونلی به‌صورت پیوسته پایش می‌شود. پخت در دمای بالا و زمان کوتاه، سطح محصول را طلایی و مغز آن را مرطوب نگه می‌دارد.

پس از خروج از فر، محصول روی نوار خنک‌کننده قرار می‌گیرد تا دمای مرکزی آن به دمای محیط برسد. بسته‌بندی محصول گرم، بزرگ‌ترین اشتباه رایج در این صنعت است.

بسته‌بندی با فیلم چندلایه و تزریق گاز خنثی، اکسیژن داخل بسته را کاهش می‌دهد و از بیات شدن جلوگیری می‌کند.

نمونه‌برداری از هر بچ تولید در آزمایشگاه داخلی انجام می‌شود و نتایج در پرونده کیفی محصول ثبت می‌گردد.

نتیجه این زنجیره کنترل‌شده، کلوچه‌ای است که تا پایان تاریخ انقضا، همان بافت نرم روز اول را حفظ می‌کند.',
'/images/blog-koloche.jpg',(SELECT id FROM public.blog_categories WHERE slug='production')),
('choosing-the-right-flour','راهنمای انتخاب آرد مناسب برای هر شیرینی','هر شیرینی به آرد خاص خودش نیاز دارد؛ از آرد نول قنادی تا آرد برنج و نخودچی.',
'انتخاب آرد، نخستین و مهم‌ترین تصمیم در تولید هر محصول شیرینی است.

آرد نول قنادی به دلیل درجه استخراج پایین و پروتئین متعادل، برای کیک، شیرینی خشک و کلوچه بهترین گزینه است.

آرد سبوس‌دار به دلیل داشتن سبوس و جوانه گندم، ارزش غذایی بالاتری دارد اما جذب آب بیشتری می‌طلبد.

آرد برنج فاقد گلوتن است و به همین دلیل نان برنجی بافتی شکننده و آب‌شونده پیدا می‌کند.

آرد نخودچی نیز بدون گلوتن است و باید در دمای خنک نگهداری شود تا روغن طبیعی آن اکسید نشود.

میزان رطوبت آرد باید زیر ۱۴ درصد باشد؛ آرد مرطوب به‌سرعت کپک می‌زند و کیفیت خمیر را تغییر می‌دهد.

آزمون فارینوگراف و اندازه‌گیری عدد فالینگ، دو شاخص حرفه‌ای برای سنجش کیفیت آرد هستند.

در بسته‌بندی ۹۰۰ گرمی ۲۰کام، از پاکت سه‌لایه استفاده می‌شود تا آرد در برابر رطوبت و نور محافظت شود.

توصیه ما به قنادی‌ها این است که آرد را حداکثر تا سه ماه پس از تولید مصرف کنند.

نگهداری آرد در محیط خشک، خنک و دور از مواد بودار، کیفیت نهایی محصول شما را تضمین می‌کند.',
'/images/blog-flour.jpg',(SELECT id FROM public.blog_categories WHERE slug='quality')),
('quality-control-standards','استانداردهای کنترل کیفیت در تولید محصولات آردی','از ورود مواد اولیه تا خروج محصول نهایی، هر مرحله نقطه کنترل کیفی دارد.',
'کنترل کیفیت در صنعت مواد غذایی یک واحد جداگانه نیست، بلکه فرهنگی است که در تمام خط تولید جریان دارد.

نخستین نقطه کنترل، پذیرش مواد اولیه است؛ هر محموله آرد، خرما، گردو یا روغن با گواهی آنالیز دریافت می‌شود.

آزمون‌های حسی شامل رنگ، بو و طعم، پیش از ورود مواد به انبار انجام می‌گیرد.

انبارش بر اساس اصل ورود اول، خروج اول انجام می‌شود تا هیچ ماده‌ای بیش از عمر مفید در انبار نماند.

در حین تولید، وزن، ابعاد و رطوبت محصول به‌صورت نمونه‌ای در هر ساعت ثبت می‌شود.

بهداشت فردی پرسنل، شستشوی تجهیزات و ضدعفونی سطوح طبق برنامه مدون روزانه اجرا می‌شود.

فلزیاب در انتهای خط، هرگونه ذره فلزی احتمالی را شناسایی و محصول را از خط خارج می‌کند.

نمونه شاهد از هر بچ تا پایان تاریخ انقضا نگهداری می‌شود تا در صورت شکایت، امکان بررسی وجود داشته باشد.

مستندسازی کامل، امکان ردیابی محصول از قفسه فروشگاه تا محموله آرد ورودی را فراهم می‌کند.

این نظم مستند، همان چیزی است که ۲۰کام را پس از بیش از ده سال، به یک تأمین‌کننده قابل اعتماد تبدیل کرده است.',
'/images/blog-quality.jpg',(SELECT id FROM public.blog_categories WHERE slug='quality')),
('gift-box-for-organizations','جعبه هدیه سازمانی؛ انتخابی شیرین برای برند شما','باکس‌های هدیه ۲۰کام با امکان چاپ اختصاصی، گزینه‌ای حرفه‌ای برای مناسبت‌های سازمانی است.',
'هدیه سازمانی، بخشی از تصویر برند شما در ذهن مشتریان و همکاران است.

جعبه‌های هدیه ۲۰کام با ترکیبی از محصولات منتخب کارخانه طراحی شده‌اند تا هم اصالت سنتی و هم کیفیت صنعتی را منتقل کنند.

هر باکس شامل کلوچه نرم، نان برنجی، نان نخودچی و یک محصول فصلی است.

بسته‌بندی چوبی و پوشش داخلی بهداشتی، محصول را در طول حمل‌ونقل محافظت می‌کند.

امکان چاپ لوگوی سازمان و کارت تبریک اختصاصی روی جعبه فراهم است.

حداقل تیراژ سفارش سازمانی ۵۰ عدد است و زمان آماده‌سازی بین ۵ تا ۱۰ روز کاری متغیر خواهد بود.

برای سفارش‌های بالای ۵۰۰ عدد، امکان طراحی اختصاصی جعبه و انتخاب ترکیب محصولات وجود دارد.

تمام محصولات با تاریخ تولید روز و ماندگاری کامل ارسال می‌شوند.

ارسال به سراسر کشور از طریق باربری‌های طرف قرارداد کارخانه انجام می‌گیرد.

برای دریافت کاتالوگ و قیمت سازمانی، از طریق واتساپ با تیم فروش ۲۰کام در تماس باشید.',
'/images/blog-giftbox.jpg',(SELECT id FROM public.blog_categories WHERE slug='company'));

INSERT INTO public.site_content (key, value, label, group_name, is_long, sort_order) VALUES
('brand_name','۲۰کام','نام برند','general',false,1),
('brand_tagline','کارخانه کلوچه و شیرینی سنتی','شعار برند','general',false,2),
('hero_title','طعم اصیل سنتی، با کیفیت صنعتی','عنوان بخش هیرو','hero',false,3),
('hero_subtitle','بیش از ده سال تجربه در تولید کلوچه، شیرینی آردی و آرد بسته‌بندی با بالاترین استانداردهای کیفی','زیرعنوان هیرو','hero',true,4),
('hero_image','/images/hero.jpg','تصویر هیرو','hero',false,5),
('about_title','درباره کارخانه ۲۰کام','عنوان درباره ما','about',false,6),
('about_text','۲۰کام یک مجموعه تخصصی تولید کلوچه و شیرینی سنتی است که با بیش از ده سال تجربه موفق، محصولاتی با کیفیت بالا و طعم اصیل ایرانی روانه بازار می‌کند. خط تولید ما با تجهیزات مدرن و تحت نظارت مستمر واحد کنترل کیفیت فعالیت می‌کند.','متن درباره ما','about',true,7),
('about_image','/images/factory-line.jpg','تصویر کارخانه','about',false,8),
('stat_years','۱۰+','سال تجربه','trust',false,9),
('stat_products','۱۰','تنوع محصول','trust',false,10),
('stat_clients','۲۵۰+','مشتری عمده','trust',false,11),
('stat_cities','۲۰+','شهر تحت پوشش','trust',false,12),
('contact_address','ایران، اراک، شهرک صنعتی شماره ۱، خیابان نوآوران، پلاک ۲۷۹۷','آدرس کارخانه','contact',true,13),
('contact_whatsapp','09965169232','شماره واتساپ','contact',false,14),
('contact_instagram','20KAM_FACTORY','آیدی اینستاگرام','contact',false,15),
('contact_hours','شنبه تا چهارشنبه ۸ تا ۱۷ | پنجشنبه ۸ تا ۱۳','ساعات کاری','contact',false,16),
('footer_note','تمامی محصولات ۲۰کام دارای پروانه بهداشت و کنترل کیفی داخلی هستند.','متن فوتر','footer',true,17);
