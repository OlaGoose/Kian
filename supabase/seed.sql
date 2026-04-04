-- Sample data for development
-- Run this after the migration to populate your local database

-- Sample blog posts
INSERT INTO public.posts (
  title_en, title_zh, slug,
  content_en, content_zh,
  excerpt_en, excerpt_zh,
  published, published_at, tags, reading_time_minutes
) VALUES
(
  'Things I Believe',
  '我的信念',
  'things-i-believe',
  E'## On Craft\n\nGood software is invisible. The best products get out of the way and let people do what they came to do.\n\n## On Learning\n\nThe best way to learn something deeply is to try to teach it. Writing forces clarity.\n\n## On Building\n\nShip early, learn fast. Perfect is the enemy of shipped. But shipped should not mean careless.\n\n## On Tools\n\nUse boring technology for boring problems. Reach for interesting technology only when the problem demands it.',
  E'## 关于工艺\n\n好的软件是隐形的。最好的产品会让用户专注于他们想做的事情，而不是软件本身。\n\n## 关于学习\n\n深入学习一件事的最好方式是尝试去教别人。写作迫使你思考清晰。\n\n## 关于构建\n\n尽早发布，快速学习。完美是已发布的敌人。但发布不应意味着粗心。\n\n## 关于工具\n\n用无聊的技术解决无聊的问题。只有当问题需要时，才去使用有趣的技术。',
  'A collection of things I believe to be true about software, learning, and building.',
  '关于软件、学习和构建，我认为是真实的一些事情。',
  true, now() - interval '30 days', ARRAY['beliefs', 'building'], 4
),
(
  'How Does Image Compression Work?',
  '图像压缩是如何工作的？',
  'how-image-compression-works',
  E'# Image Compression\n\nImage compression reduces file size while preserving visual quality.\n\n## Lossy vs Lossless\n\n**Lossless** compression (PNG, WebP lossless) preserves every pixel exactly. Files are smaller, but there''s a limit to how small they can get.\n\n**Lossy** compression (JPEG, WebP, AVIF) discards information that humans are unlikely to notice. This allows much smaller files.\n\n## How JPEG Works\n\n1. Convert RGB to YCbCr color space\n2. Downsample chroma channels (humans are less sensitive to color than luminance)\n3. Apply Discrete Cosine Transform (DCT) to 8×8 pixel blocks\n4. Quantize the coefficients\n5. Entropy encode the result\n\n## Modern Formats\n\nAVIF and WebP offer significantly better compression than JPEG at equivalent quality.',
  E'# 图像压缩\n\n图像压缩在保持视觉质量的同时减小文件大小。\n\n## 有损与无损\n\n**无损**压缩（PNG、WebP 无损）完整保留每个像素。文件更小，但有压缩极限。\n\n**有损**压缩（JPEG、WebP、AVIF）丢弃人类不太可能注意到的信息，从而实现更小的文件。\n\n## JPEG 的工作原理\n\n1. 将 RGB 转换为 YCbCr 色彩空间\n2. 对色度通道进行降采样（人眼对颜色比亮度更不敏感）\n3. 对 8×8 像素块应用离散余弦变换（DCT）\n4. 对系数进行量化\n5. 对结果进行熵编码\n\n## 现代格式\n\nAVIF 和 WebP 在同等质量下比 JPEG 提供更好的压缩率。',
  'A deep dive into how image compression algorithms work under the hood.',
  '深入探讨图像压缩算法的底层原理。',
  true, now() - interval '15 days', ARRAY['technology', 'explainer'], 6
);

-- Sample projects
INSERT INTO public.projects (
  name, slug,
  description_en, description_zh,
  url, github_url,
  tech, status, featured, display_order
) VALUES
(
  'Your Product Name',
  'your-product',
  'A brief description of your main product. What problem does it solve? Who is it for?',
  '你的主要产品描述。它解决什么问题？目标用户是谁？',
  'https://yourproduct.com',
  NULL,
  ARRAY['Next.js', 'TypeScript', 'Supabase'],
  'live', true, 1
),
(
  'Another Project',
  'another-project',
  'Another thing you built. Keep it concise.',
  '另一个你构建的项目，简洁描述即可。',
  'https://anotherproject.com',
  'https://github.com/yourusername/another-project',
  ARRAY['React', 'Node.js'],
  'live', false, 2
),
(
  'Ozon category directory',
  'ozon-catalog',
  'Browse Ozon''s official category tree with search, deep links to marketplaces (Ozon, Wildberries, Yandex Wordstat, Google, TikTok, VK, 1688, and more), and one-tap copy for Russian and English keywords.',
  '浏览 Ozon 官方商品分类树：支持中英俄搜索、多平台深度链接（Ozon、Wildberries、Yandex Wordstat、Google、TikTok、VK、1688 等）以及俄文/英文关键词一键复制。',
  '/projects/ozon-catalog',
  NULL,
  ARRAY['Next.js', 'TypeScript'],
  'live', false, 3
);
