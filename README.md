# Jared Del Mundo portfolio

A long form personal portfolio built with Vite and TypeScript. The homepage has eight sections: hero, featured projects, interests, values, trivia, moments, latest notes, and footer. `/projects`, `/notes`, individual note URLs, and `/resume` are available as direct routes.

## Run it

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```

For the optional browser check, start `npm run dev -- --port 4173` in one terminal and run `npm run check:browser` in another. It uses installed Google Chrome on Windows and saves screenshots in `.qa/`.

The production files are in `dist/`. The build also writes `dist/404.html` so GitHub Pages can load direct links to the client side routes. `public/CNAME` carries the custom domain into the build output.

The GitHub Actions workflow builds and deploys `dist/` on pushes to `master`. Set the repository’s Pages source to **GitHub Actions** before the first deployment.

## Edit content

- `src/content.ts`: homepage text, project details, interests, values, trivia, gallery captions, and social links.
- `content/notes/*.md`: Markdown notes. Each file needs `title`, `date`, `shortDate`, and `excerpt` frontmatter. The filename becomes the URL slug.
- `src/style.css`: layout, type, colors, and motion.
- `index.html`: default page description and font loading.

The three note bodies are labeled draft placeholders. Replace them with your actual writing before presenting them as finished posts.

## Replace images

Every current `.svg` is an illustrated placeholder. Replace the path in `src/content.ts` with a local `.webp`, `.avif`, or `.jpg` once you add the real image. Keep the filenames predictable:

| Use | Suggested real asset |
| --- | --- |
| Hero portrait | `public/images/hero/portrait.webp` — then update the `.portrait-frame` background in `src/style.css` |
| Hero city artwork | `public/images/hero/background.webp` — then update `.hero-art` in `src/style.css` |
| Proxmox Homelab | `public/images/projects/homelab.webp` |
| UniFi Network Segmentation | `public/images/projects/unifi.webp` |
| Windows Server / AD Lab | `public/images/projects/windows-server.webp` |
| Aviation | `public/images/interests/aviation.webp` |
| Music | `public/images/interests/music.webp` |
| Photography / Travel | `public/images/interests/photography.webp` |
| Technology | `public/images/interests/technology.webp` |
| Moments 1–6 | `public/images/moments/moment-01.webp` through `moment-06.webp` |
| Moments backdrop | `public/images/moments/background.webp` — then update `.moments` in `src/style.css` |
| Footer skyline | `public/images/footer/skyline.webp` — then update `.footer-skyline` in `src/style.css` |

Use images you own or have permission to publish. The portrait slot deliberately contains no generated face. For gallery items, update the title, caption, and alt text next to the image path in `src/content.ts`.

## Links and resume

The LinkedIn link was recovered from the previous site. The GitHub profile comes from the repository remote, and the email address comes from its Git author configuration. All are editable in `src/content.ts`. `/resume` is a readable web resume with known information. To offer a PDF, place it at `public/resume.pdf` and add a download link to `src/pages/Resume.ts`.

## Existing source

The previous Vite/Three.js tutorial source is retained in `jared-portfolio-master.zip` outside this repository. The old UI was replaced in the original Git repository, while its history and domain name were retained.
