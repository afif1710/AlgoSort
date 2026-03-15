import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve(process.cwd(), 'public');
const logoPath = path.join(publicDir, 'logo.png');

const iconsToGenerate = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180, bg: '#0a0a0a' },
  { name: 'pwa-512x512-maskable.png', size: 512, bg: '#0a0a0a', padding: 100 }
];

async function generateIcons() {
  if (!fs.existsSync(logoPath)) {
    console.error('source logo.png not found in public directory');
    process.exit(1);
  }

  for (const icon of iconsToGenerate) {
    const destPath = path.join(publicDir, icon.name);
    try {
      if (icon.bg) {
        if (icon.padding) {
          // create a padded version for maskable
          await sharp(logoPath)
            .resize(icon.size - icon.padding, icon.size - icon.padding, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .extend({
              top: icon.padding / 2,
              bottom: icon.padding / 2,
              left: icon.padding / 2,
              right: icon.padding / 2,
              background: icon.bg
            })
            .toFile(destPath);
        } else {
          // just flattened with background
          await sharp(logoPath)
            .resize(icon.size, icon.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .flatten({ background: icon.bg })
            .toFile(destPath);
        }
      } else {
        await sharp(logoPath)
          .resize(icon.size, icon.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .toFile(destPath);
      }
      console.log(`Generated ${icon.name}`);
    } catch (err) {
      console.error(`Error generating ${icon.name}:`, err);
    }
  }
}

generateIcons();
