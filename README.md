# nihalshahria.github.io

Personal portfolio of **Md. Shahria Islam Nihal**, backend engineer (Go, event-driven fintech, Web3).

Live: https://portfolio.oubliette.xyz

## Stack

Plain HTML, CSS and vanilla JS. No build step, no dependencies, so GitHub Pages serves it as is.

```
index.html              single-page portfolio
404.html                custom not-found page
assets/css/style.css    styles (dark/light themes via CSS variables)
assets/js/main.js       theme toggle, mobile menu, scroll reveal, copy email, mouse effects
assets/img/             favicon and social preview image (og.png, 1200x630)
.nojekyll               tells Pages to skip Jekyll processing
robots.txt, sitemap.xml SEO
```

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Push to `master`. In the repo go to **Settings → Pages → Build and deployment**, set
**Source: Deploy from a branch**, **Branch: `master` / `(root)`**. The site goes live at
https://portfolio.oubliette.xyz within a minute or two.

## Updating

- Content lives in `index.html`, one `<section>` per block.
- The CV links point to the PDF built in the `cv-builder` repo (`rendercv_output/Md_Shahria_Islam_Nihal_CV.pdf`), so pushing a new CV there updates the site.
- Brand colors are the `--accent` / `--accent-2` variables at the top of `style.css`.
