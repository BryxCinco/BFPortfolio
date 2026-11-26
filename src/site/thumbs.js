// Small webp copies of the heavy images (certificates, project and profile
// screenshots) for cards and grids. thumb(url) maps an original asset URL to
// its copy in assets/thumbs; full-size originals are still used in viewers.
const originals = import.meta.glob(['../assets/*.png', '../assets/PNGVER/*.png', '../assets/shots/*.jpg'], { eager: true, import: 'default' });
const thumbs = import.meta.glob('../assets/thumbs/*.webp', { eager: true, import: 'default' });

const byUrl = {};
for (const [path, url] of Object.entries(originals)) {
  const name = path.split('/').pop().replace(/\.(png|jpg)$/, '');
  const t = thumbs[`../assets/thumbs/${name}.webp`];
  if (t) byUrl[url] = t;
}

export const thumb = (url) => byUrl[url] || url;
