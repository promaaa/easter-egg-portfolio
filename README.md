# Marc Duboc - Minimalist Portfolio

Ultra-lightweight, pure, and high-performance portfolio for **Marc Duboc** built with **HTML5, Vanilla WebGL 2.0 (GLSL Raymarching), and CSS3**.

- **Zero dependencies & zero runtime frameworks**
- **Zero build step required**
- **~15 KB total footprint**
- **100% GitHub Pages ready**

---

## 🚀 How to Deploy on GitHub Pages

1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: minimalist portfolio"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```

2. In your GitHub repository:
   - Go to **Settings** → **Pages**
   - Under **Build and deployment** > **Source**, select **Deploy from a branch**
   - Select **`main`** branch and **`/(root)`** folder
   - Click **Save**

Your site will be live instantly at `https://<your-username>.github.io/<your-repo>/`!

---

## 🛠 File Structure

```
├── index.html            # Standalone static entrypoint (Homepage)
├── favicon.svg           # Site vector favicon
├── og.png                # Social share preview card (1200x630)
├── CNAME                 # Custom domain configuration (promaa.tech)
├── robots.txt            # Crawler instructions & sitemap link
├── sitemap.xml           # Search engine sitemap
├── generate-pdfs.sh      # LaTeX (XeTeX) PDF compilation script
├── .nojekyll             # Ensures clean static hosting on GitHub Pages
│
├── assets/               # Centralized global static assets
│   ├── css/
│   │   └── style.css     # Homepage styles & design tokens
│   ├── js/
│   │   ├── waves.js      # Native WebGL 2.0 Raymarched Wave Field (0 dependencies)
│   │   ├── app.js        # Core application interactivity (clipboard, dock, delegation)
│   │   └── easter-eggs.js# Web Audio synthesizers & modal easter egg controllers
│   ├── fonts/            # Fraunces & Inter (static instances for XeLaTeX)
│   ├── images/           # Global vector and raster graphics
│   └── docs/             # Downloadable PDFs & research manuscripts
│       ├── books-recommendations-en.pdf
│       ├── livres-recommandes-fr.pdf
│       └── oai-5g-research-paper.pdf
│
├── pictures/             # Compressed site photography & book covers
│   ├── assange.jpg       # Julian Assange portrait (172 KB)
│   ├── atlas-shrugged.jpg
│   ├── monteCristo.jpg
│   └── manufacturing-consent.jpg
│
├── essays/               # Long-form essays & writing archive
│   ├── index.html        # Essays directory & timeline
│   ├── unspoken-dialogue/
│   ├── lucid-hope/
│   ├── domestic-sovereignty/
│   ├── collapse-of-money/
│   └── the-work-of-writing/
│
├── books/                # Interactive bilingual reading shelf
│   ├── index.html        # Dynamic bilingual reading shelf & search
│   ├── generate-latex.py # Emits the LaTeX documents from JSON data
│   ├── books-en.tex      # English LaTeX document
│   ├── books-fr.tex      # French LaTeX document
│   ├── books-en.json     # English book data (single source of truth)
│   └── books-fr.json     # French book data
│
└── data/                 # Raw markdown notes & review texts
    ├── books-en.md
    └── books-fr.md
```

---

## ⚡ Interactive Cinematic Easter Eggs

The site includes 3 distinct easter eggs triggered via click, URL hash, or keyboard sequence:

1. **Ayn Rand (*Atlas Shrugged*)** → `galt` / `johngalt` / `/#galt`  
   *Blade Runner cosmic synth pad, crystal chimes, and anamorphic horizon laser.*
2. **Alexandre Dumas (*The Count of Monte Cristo*)** → `dantes` / `montecristo` / `wait` / `/#montecristo`  
   *1838 French parchment manuscript, warm candlelit aura, and C minor baroque cello + cathedral bell.*
3. **Julian Assange** → `assange` / `julian` / `wikileaks` / `/#assange`  
   *Minimalist, silent photographic portrait modal.*

