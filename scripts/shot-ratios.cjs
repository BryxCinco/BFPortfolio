// Writes src/assets/shots/ratios.json (file name -> width / height) so the project galleries can frame every
// screenshot at its own proportions instead of cropping it. Run after adding or replacing a shot:
//   node scripts/shot-ratios.cjs
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'src', 'assets', 'shots');

const jpegSize = (buf) => {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i += 1; continue; }
    const marker = buf[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  throw new Error('no JPEG size found');
};

const out = {};
for (const f of fs.readdirSync(DIR).filter((n) => n.endsWith('.jpg')).sort()) {
  const { w, h } = jpegSize(fs.readFileSync(path.join(DIR, f)));
  out[f] = Math.round((w / h) * 1000) / 1000;
}
fs.writeFileSync(path.join(DIR, 'ratios.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`${Object.keys(out).length} shots`);
