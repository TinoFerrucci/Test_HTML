# constantinoferrucci.com.ar

Personal portfolio of Constantino Ferrucci — Senior Generative AI Engineer.
Static site hosted on GitHub Pages, with a Cloudflare Worker backing the
in-page AI assistant.

## Structure

```
.
├── index.html                 Page markup (must stay at the repo root)
├── CNAME                      Custom domain for GitHub Pages
├── assets/
│   ├── css/styles.css         All styles: theme tokens, layout, components
│   ├── js/app.js              i18n, theme switch, chat client, animations
│   └── cv/                    Downloadable CV
└── worker/worker.js           Cloudflare Worker: /models and /chat endpoints
```

`index.html` and `CNAME` live at the root because GitHub Pages serves the site
from there. Everything else is free to move.

## Local development

No build step and no dependencies — the page is plain HTML, CSS and JS.
Open `index.html` directly, or serve the folder to get correct relative paths:

```bash
python -m http.server 8000
```

Then visit <http://localhost:8000>.

## Conventions

- **Styles** live only in `assets/css/styles.css`. Light is the base layer;
  dark is applied through `prefers-color-scheme` and an explicit
  `[data-theme]` override, so both paths stay in sync.
- **Scripts** live only in `assets/js/app.js`, loaded at the end of `<body>`
  so the DOM is ready without waiting for `DOMContentLoaded`.
- The small inline script in `<head>` is deliberate: it applies the stored
  theme before first paint to avoid a flash of the wrong theme.
- English copy is the source of truth and is written inline in the HTML, so
  the page stays readable and indexable with JavaScript disabled. Spanish
  translations are applied at runtime from the i18n table in `app.js`.

## Deployment

- **Site** — GitHub Pages publishes automatically on every push to `main`.
- **Worker** — `worker/worker.js` is deployed separately to Cloudflare. The
  frontend reaches it through `WORKER_URL` in `assets/js/app.js`.
