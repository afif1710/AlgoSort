import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://algo-sort-cyan.vercel.app';

// Paths relative to project root
const TOPICS_PATH = path.resolve(__dirname, '../src/data/topics.json');
const MATH_TOPICS_PATH = path.resolve(__dirname, '../src/data/mathTopics.json');
const DIST_PATH = path.resolve(__dirname, '../dist');

async function generateSitemap() {
    console.log('--- Generating Sitemap ---');

    try {
        const topics = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf8'));
        const mathTopics = JSON.parse(fs.readFileSync(MATH_TOPICS_PATH, 'utf8'));

        const staticRoutes = [
            '',
            '/tutorials',
            '/problems',
            '/math'
        ];

        const tutorialRoutes = topics.map(t => `/tutorials/${t.slug}`);
        const mathRoutes = mathTopics.map(t => `/math/${t.slug}`);

        const allRoutes = [...staticRoutes, ...tutorialRoutes, ...mathRoutes];
        const lastMod = new Date().toISOString().split('T')[0];

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${route === '' ? '1.0' : route.split('/').length > 2 ? '0.6' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

        // Ensure dist exists
        if (!fs.existsSync(DIST_PATH)) {
            fs.mkdirSync(DIST_PATH, { recursive: true });
        }

        fs.writeFileSync(path.join(DIST_PATH, 'sitemap.xml'), sitemap);
        console.log(`✅ Sitemap generated at ${path.join(DIST_PATH, 'sitemap.xml')}`);
        console.log(`📊 Total URLs: ${allRoutes.length}`);

        // Re-generate robots.txt in dist as well
        const robots = `User-agent: *
Allow: /
Sitemap: ${BASE_URL}/sitemap.xml`;

        fs.writeFileSync(path.join(DIST_PATH, 'robots.txt'), robots);
        console.log(`✅ robots.txt generated at ${path.join(DIST_PATH, 'robots.txt')}`);

    } catch (error) {
        console.error('❌ Failed to generate sitemap:', error);
        process.exit(1);
    }
}

generateSitemap();
