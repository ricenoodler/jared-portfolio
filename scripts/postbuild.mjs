import { copyFileSync, existsSync, mkdirSync } from 'node:fs';

// GitHub Pages serves this file for deep links. The client router then resolves the URL.
copyFileSync('dist/index.html', 'dist/404.html');
if (!existsSync('dist/images')) mkdirSync('dist/images', { recursive: true });
