const sharp = require('sharp');
const path = require('path');
const OUT = 'D:/www_work/garden/frontend/public/images/articles';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1350" viewBox="0 0 1800 1350">
  <defs>
    <radialGradient id="grad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#2d5a3d"/>
      <stop offset="100%" stop-color="#0f2218"/>
    </radialGradient>
  </defs>
  <rect width="1800" height="1350" fill="url(#grad)"/>
  <path d="M900 350 C900 350 1080 490 1080 680 C1080 870 995 960 900 990 C805 960 720 870 720 680 C720 490 900 350 900 350 Z" fill="#4a9a6a" opacity="0.75"/>
  <line x1="900" y1="350" x2="900" y2="990" stroke="#6dbf8a" stroke-width="9" opacity="0.55"/>
  <path d="M900 560 C840 538 785 548 755 578" stroke="#6dbf8a" stroke-width="6" fill="none" opacity="0.5"/>
  <path d="M900 640 C840 618 795 628 768 655" stroke="#6dbf8a" stroke-width="6" fill="none" opacity="0.5"/>
  <path d="M900 720 C840 698 800 708 778 732" stroke="#6dbf8a" stroke-width="6" fill="none" opacity="0.5"/>
  <path d="M900 560 C960 538 1015 548 1045 578" stroke="#6dbf8a" stroke-width="6" fill="none" opacity="0.5"/>
  <path d="M900 640 C960 618 1005 628 1032 655" stroke="#6dbf8a" stroke-width="6" fill="none" opacity="0.5"/>
  <path d="M900 720 C960 698 1000 708 1022 732" stroke="#6dbf8a" stroke-width="6" fill="none" opacity="0.5"/>
</svg>`;

(async () => {
  const buf = Buffer.from(svg);
  await sharp(buf).resize(1800, 1350).webp({ quality: 82 }).toFile(path.join(OUT, 'ogrod-placeholder-cover.webp'));
  await sharp(buf).resize(720, 540).webp({ quality: 78 }).toFile(path.join(OUT, 'ogrod-placeholder-cover-thumb.webp'));
  console.log('Placeholder zapisany');
})().catch(e => { console.error(e.message); process.exit(1); });
