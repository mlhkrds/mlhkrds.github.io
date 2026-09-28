# mlhkrds.dev

Source of my personal site, served by GitHub Pages at [mlhkrds.dev](https://mlhkrds.dev).

Built with Next.js (static export), React, Motion, Lenis and OGL. Every push to `main` builds and deploys through `.github/workflows/deploy.yml`.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static site in out/
npm run preview  # serve out/ on http://localhost:4173
```

## Portrait

The hero portrait is prepared once, locally, and the results are committed:

```bash
python3 -m venv --system-site-packages scripts/portrait/.venv
scripts/portrait/.venv/bin/pip install "rembg[cpu,cli]==2.0.85" "huggingface-hub>=0.30,<1.0"
scripts/portrait/.venv/bin/python scripts/portrait/prepare.py path/to/photo.jpg
npm run portrait:assets
```

`prepare.py` cuts the subject out with BiRefNet, estimates depth with Depth Anything V2 Small and finds the head circle used for the nav avatar. `portrait-assets.mjs` writes the AVIF/WebP images, the depth map and the avatars to `public/portrait/`.

## Credits

Technology logos come from [Simple Icons](https://simpleicons.org) (CC0) and [Devicon](https://devicon.dev) (MIT, see `public/icons/LICENSE-devicon.txt`). All logos are trademarks of their respective owners.
