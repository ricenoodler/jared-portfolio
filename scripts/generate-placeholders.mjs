import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';

// Local, clearly illustrated placeholders. Run with --force only to recreate them.
const root = 'public/images';
const save = (path, body) => {
  const full = join(root, path);
  mkdirSync(dirname(full), { recursive: true });
  if (!existsSync(full) || process.argv.includes('--force')) writeFileSync(full, body);
};
const xml = (body, width = 1200, height = 600) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img">${body}</svg>`;
const defs = (top = '#152c65', middle = '#835697', bottom = '#fca080') => `<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${top}"/><stop offset=".6" stop-color="${middle}"/><stop offset="1" stop-color="${bottom}"/></linearGradient><linearGradient id="water" x2="0" y2="1"><stop stop-color="#3b3979"/><stop offset="1" stop-color="#081830"/></linearGradient><linearGradient id="glass" x2="1" y2="1"><stop stop-color="#203d66"/><stop offset="1" stop-color="#08172d"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="15"/></filter></defs>`;
const stars = (count, width, height) => Array.from({ length: count }, (_, i) => {
  const x = (i * 167 + i * i * 19) % width;
  const y = (i * 97 + i * i * 7) % height;
  return `<circle cx="${x}" cy="${y}" r="${i % 9 ? .7 : 1.6}" fill="#fff" opacity="${.18 + (i % 5) * .12}"/>`;
}).join('');
const buildings = (width, base, scale = 1) => Array.from({ length: Math.ceil(width / 42) }, (_, i) => {
  const x = i * 42 - 10;
  const h = (45 + (i * 71 + i * i * 11) % 170) * scale;
  const w = 30 + (i * 13) % 24;
  const windows = Array.from({ length: Math.floor(h / 15) }, (_, row) => Array.from({ length: Math.floor(w / 11) }, (_, col) => `<rect x="${x + 6 + col * 10}" y="${base - h + 9 + row * 14}" width="2" height="4" fill="${(i + row + col) % 4 ? '#f8b893' : '#9db5dc'}" opacity="${(i + row + col) % 3 ? .5 : .85}"/>`).join('')).join('');
  return `<rect x="${x}" y="${base - h}" width="${w}" height="${h}" fill="${i % 3 ? '#102449' : '#1a2c58'}"/>${windows}`;
}).join('');
const clouds = `<g fill="#f7a2a5" opacity=".16" filter="url(#glow)"><ellipse cx="310" cy="345" rx="240" ry="37"/><ellipse cx="1110" cy="250" rx="300" ry="50"/><ellipse cx="700" cy="430" rx="330" ry="45"/></g>`;
const plane = (x, y, scale = 1) => `<g transform="translate(${x} ${y}) scale(${scale}) rotate(-12)" fill="#152044" opacity=".9"><path d="M-84 0 0-11 81-1 0 9Z"/><path d="M-10-2-45-39-26-42 21-6ZM-7 3-42 27-27 29 19 7ZM-67-1-83-17-76-18-49-3Z"/></g>`;

save('hero/background.svg', xml(`${defs('#102350','#714d96','#f68b80')}<rect width="1600" height="950" fill="url(#sky)"/>${stars(120,1600,530)}${clouds}<circle cx="1025" cy="525" r="92" fill="#ffc492" opacity=".45" filter="url(#glow)"/><circle cx="1025" cy="525" r="65" fill="#ffd9aa"/>${plane(675,220,1.15)}<path d="M0 610 Q350 545 600 604 T1200 586 T1600 615V950H0" fill="#253761" opacity=".42"/><rect y="655" width="1600" height="295" fill="url(#water)"/>${buildings(1600,690,1.2)}<path d="M0 743 Q350 697 700 742 T1600 736" fill="none" stroke="#f69c9a" stroke-width="11" opacity=".52"/><path d="M0 748 Q350 702 700 747 T1600 741" fill="none" stroke="#ffdaa7" stroke-width="2" opacity=".65"/><g stroke="#f5ae9d" opacity=".35">${Array.from({length:25},(_,i)=>`<path d="M${i*72} 757v${20+(i*9)%120}"/>`).join('')}</g><rect y="800" width="1600" height="150" fill="#091a35" opacity=".55"/>`,1600,950));
save('hero/portrait.svg', xml(`${defs('#25396e','#86618a','#e59a85')}<rect width="600" height="750" fill="url(#sky)"/>${stars(55,600,500)}<circle cx="440" cy="390" r="145" fill="#efa5a8" opacity=".28"/><path d="M0 560 Q300 490 600 550V750H0" fill="#193458" opacity=".7"/>${buildings(600,650,.75)}<path d="M0 680H600" stroke="#f9b9ac" opacity=".5"/>`,600,750));

function projectArt(kind) {
  const bg = `<rect width="1200" height="600" fill="url(#sky)"/>${stars(35,1200,290)}<rect y="395" width="1200" height="205" fill="#0a1a32"/>`;
  let art = '';
  if (kind === 'homelab') art = `<circle cx="1020" cy="315" r="130" fill="#ff9b75" opacity=".5" filter="url(#glow)"/><rect x="115" y="95" width="500" height="495" rx="12" fill="#081629" stroke="#6582a5" stroke-width="8"/>${Array.from({length:6},(_,i)=>`<rect x="145" y="${123+i*75}" width="440" height="56" rx="5" fill="#182a42" stroke="#405c7e"/><circle cx="184" cy="${151+i*75}" r="6" fill="#f37d57"/><circle cx="207" cy="${151+i*75}" r="5" fill="#70a7d4"/><path d="M240 ${151+i*75}h295" stroke="#304a6a" stroke-width="3"/>`).join('')}<path d="M700 510h400" stroke="#f9ba9a" stroke-width="4" opacity=".5"/>`;
  if (kind === 'unifi') art = `<g stroke="#8fbbda" fill="none" opacity=".6"><circle cx="600" cy="270" r="190"/><circle cx="600" cy="270" r="280"/><circle cx="600" cy="270" r="370"/></g><rect x="440" y="145" width="320" height="240" rx="36" fill="#e6edf3" stroke="#b5c4d1" stroke-width="9"/><circle cx="600" cy="262" r="75" fill="#d1e7ef" stroke="#3fa4ec" stroke-width="20"/><circle cx="600" cy="262" r="20" fill="#153f68"/><g fill="#ffaf83">${[[160,170],[1030,115],[1000,440],[195,440]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="13"/>`).join('')}</g>`;
  if (kind === 'windows-server') art = `<rect x="115" y="85" width="970" height="485" rx="10" fill="#0a192e" stroke="#526989" stroke-width="8"/><rect x="155" y="123" width="890" height="395" fill="#102744"/><path d="M155 195h890M380 195v323" stroke="#45627d" stroke-width="3"/><g fill="#8fb5d6" opacity=".65">${Array.from({length:9},(_,i)=>`<rect x="185" y="${225+i*29}" width="${100+(i*27)%130}" height="7"/>`).join('')}</g><g fill="#f3a18c" opacity=".65">${Array.from({length:7},(_,i)=>`<rect x="420" y="${225+i*36}" width="${250+(i*53)%260}" height="8"/>`).join('')}</g><rect x="800" y="260" width="185" height="170" fill="#183e66"/><path d="M892 282v126M830 345h126" stroke="#75adcf" stroke-width="8"/>`;
  return xml(`${defs('#112752','#315282','#e59c80')}${bg}${art}`);
}
['homelab','unifi','windows-server'].forEach((name) => save(`projects/${name}.svg`, projectArt(name)));

function interestArt(kind, tint = '#ed8e9d') {
  const scene = `<rect width="1200" height="600" fill="url(#sky)"/>${stars(45,1200,380)}<circle cx="850" cy="310" r="98" fill="${tint}" opacity=".45" filter="url(#glow)"/>`;
  let art = '';
  if (kind === 'aviation') art = `<path d="M0 425h1200v175H0" fill="#192c4d"/><path d="M0 445h1200" stroke="#ffb69e" stroke-width="4" opacity=".7"/><g fill="#172644">${Array.from({length:13},(_,i)=>`<rect x="${i*110}" y="${390-(i*41)%70}" width="65" height="80"/>`).join('')}</g>${plane(750,260,2.4)}<path d="M835 277h300" stroke="#ffcfb5" opacity=".6"/>`;
  if (kind === 'music') art = `<rect x="90" y="315" width="1020" height="250" rx="18" fill="#0b1730" stroke="#273e65" stroke-width="12"/><circle cx="435" cy="411" r="189" fill="#0b152c" stroke="#405178" stroke-width="8"/><circle cx="435" cy="411" r="137" fill="none" stroke="#47628a" stroke-width="3"/><circle cx="435" cy="411" r="85" fill="#f18c88"/><circle cx="435" cy="411" r="23" fill="#0b1730"/><path d="M890 295v210l-235-97" fill="none" stroke="#bfd0dc" stroke-width="18" stroke-linecap="round"/><circle cx="653" cy="407" r="18" fill="#dce7eb"/>`;
  if (kind === 'photography') art = `<rect y="400" width="1200" height="200" fill="#182b4e"/>${buildings(1200,490,.9)}<path d="M490 600 630 395h90L885 600" fill="#253354"/><path d="M650 395 590 600M703 395l65 205" stroke="#f9afac" stroke-width="4" opacity=".55"/><circle cx="825" cy="240" r="54" fill="#ffd3ad"/><path d="M0 545h1200" stroke="#cc84a3" opacity=".4"/>`;
  if (kind === 'technology') art = `<rect x="140" y="455" width="950" height="34" fill="#0a172c"/><rect x="190" y="170" width="460" height="282" rx="9" fill="#09192f" stroke="#6785a5" stroke-width="10"/><rect x="675" y="220" width="330" height="230" rx="8" fill="#09192f" stroke="#6888ab" stroke-width="10"/><g fill="#69a8c2" opacity=".75">${Array.from({length:10},(_,i)=>`<rect x="${220+(i%2)*180}" y="${210+Math.floor(i/2)*40}" width="${100+(i*19)%70}" height="7"/>`).join('')}${Array.from({length:6},(_,i)=>`<rect x="${700+(i%2)*135}" y="${260+Math.floor(i/2)*46}" width="110" height="7"/>`).join('')}</g><path d="M385 455v35m440-35v35" stroke="#7393aa" stroke-width="10"/>`;
  return xml(`${defs('#0c2448','#43528d',tint)}${scene}${art}`);
}
[['aviation','#f5a198'],['music','#ec6a99'],['photography','#f5a1ad'],['technology','#e5a484']].forEach(([name,tint]) => save(`interests/${name}.svg`, interestArt(name,tint)));
const momentKinds = ['aviation','photography','music','photography','aviation','photography'];
momentKinds.forEach((kind,i) => save(`moments/moment-0${i+1}.svg`, interestArt(kind,['#97bce0','#ed8b98','#9b74ba','#ffa77e','#e2a17e','#bf6c9c'][i])));
save('moments/background.svg', xml(`${defs('#557fa8','#7b9dc2','#e9c2b0')}<rect width="1600" height="700" fill="url(#sky)"/>${clouds}<path d="M0 500 Q400 450 700 495 T1600 475V700H0" fill="#4b7198" opacity=".38"/>`,1600,700));
save('footer/skyline.svg', xml(`${defs('#101b48','#5c3b70','#d75d6e')}<rect width="1600" height="500" fill="url(#sky)"/>${stars(105,1600,270)}<circle cx="680" cy="330" r="80" fill="#ff8c83" opacity=".5" filter="url(#glow)"/><rect y="360" width="1600" height="140" fill="#142341"/>${buildings(1600,420,.85)}<path d="M0 443 Q400 410 800 440 T1600 432" fill="none" stroke="#ed7591" stroke-width="6" opacity=".55"/><g stroke="#e8838e" opacity=".3">${Array.from({length:24},(_,i)=>`<path d="M${i*73} 445v${20+(i*17)%70}"/>`).join('')}</g>`,1600,500));
