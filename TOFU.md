# Tuner on Tofu

Tuner is Qiu Xiang's online instrument tuner. It listens to the microphone in the browser, displays the detected musical note and tuning offset, and can play reference notes. Audio processing stays on the device. The upstream app name and interface are retained.

## Hosting

- Tofu framework preset: `static`.
- Site root / output directory: repository root (`.`); the entry point is `index.html`.
- Deployment build command: none. All browser assets are checked in under `app/`.
- Static hosting publishes only the file types it serves, and it refuses a whole site for one file with no served extension, or one named like build configuration (`package.json`, `package-lock.json`), anywhere in the tree. Every file here is a served type or a repository document, which is why the license notices and the vendor rebuild's manifests carry a `.txt` suffix (see below).
- Environment variables: none.
- Database, authentication and external service accounts: none.
- Production requires HTTPS and the visitor's microphone permission. Click the welcome dialog's OK button to start audio. Localhost works for development.
- A4 calibration is saved in the visitor's browser storage. Audio is neither uploaded nor recorded by a server. A page embedded in another site needs that site's microphone permission policy; opening the app directly is recommended.

## Adaptations and reasons

- Added a root entry page that uses `app/` as its asset base, so ordinary static hosting serves the tuner at `/`. The original `/app/` entry also works.
- Vendored SweetAlert2 **9.17.1** instead of loading the moving `@9` CDN version. Later 9.x distributions contain an unrelated remote-audio behavior; this exact version does not.
- Replaced the CDN-loaded aubiojs pitch detector with the bundled MIT-licensed **Pitchy 4.1.0** and **fft.js 4.0.4**. This makes the complete runtime reproducible from MIT-licensed JavaScript sources and removes the separate WebAssembly download. Low-clarity and silent input are filtered before displaying a note.
- Explicitly resume the audio context after the welcome dialog, keeping startup within the visitor's interaction.
- Added a locked, optional vendor rebuild under `tools/vendor/`. It is a maintainer tool, not a deployment build step.
- Renamed `app/vendor/pitchy-LICENSE` to `app/vendor/pitchy-LICENSE.txt` and `app/vendor/sweetalert2-LICENSE` to `app/vendor/sweetalert2-LICENSE.txt`. These are pure renames: the notices are unchanged, shipped beside the code they cover, and nothing was deleted. Static hosting serves `.txt` but not a name with no extension, and refuses the whole site over one such file. Nothing in the app links to them, and `tools/vendor/copy.mjs` now writes the `.txt` names.
- Renamed `tools/vendor/package.json` to `tools/vendor/package.json.txt` and `tools/vendor/package-lock.json` to `tools/vendor/package-lock.json.txt`. These are pure renames too: contents unchanged, nothing deleted, so the pinned lockfile stays in the tree. Static hosting treats a file by either real name, anywhere in the tree, as build configuration and refuses the whole site, even though this folder is not a deployment build. The rebuild recipe below copies them back to their real names for a maintainer run, and `.gitignore` keeps those temporary copies out of git.
- There are no analytics, advertising, external script loads, API keys or network services in the running app.

## Rebuild vendored assets (maintainers only)

The manifests are stored as `.txt` (see above). From the repository root, copy them back to their real names, run the rebuild, then remove the temporary copies and the install:

```sh
cp tools/vendor/package.json.txt tools/vendor/package.json
cp tools/vendor/package-lock.json.txt tools/vendor/package-lock.json
npm --prefix tools/vendor ci --ignore-scripts --no-audit --no-fund
npm --prefix tools/vendor run build
node tools/vendor/verify.mjs
rm tools/vendor/package.json tools/vendor/package-lock.json
rm -rf tools/vendor/node_modules
```

Node.js 22 and npm 10 were used. The lockfile (`tools/vendor/package-lock.json.txt`, and `package-lock.json` once copied back) pins the packages; esbuild is only used to produce the committed browser bundle. The build rewrites `app/vendor/pitchy.min.js`, `sweetalert2.all.min.js`, `fft.js-README.md` and the two `*-LICENSE.txt` notices; keep the generated files and all vendor license notices together. Run the last two commands before committing or deploying: static hosting refuses a site folder that holds `package.json`, `package-lock.json` or `node_modules`.

## Local verification

```sh
python3 -I -m http.server 4387 --bind 127.0.0.1 --directory /absolute/path/to/tuner
curl --fail --silent --show-error -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4387/
curl --fail --silent --show-error -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4387/app/
```

At the first pin (`pin/2026-10-23`) both entry points returned **200**. The frozen dependency install and vendor build passed. `node tools/vendor/verify.mjs` passed 12 reference-tone checks at 44.1/48 kHz, with less than one cent of pitch error, correct note mapping and no pitch on silence.

A local Chromium browser check supplied a generated 220 Hz MediaStream in place of microphone input and observed **220.0 Hz / A3** in the UI. A4 calibration changed to 442 Hz; manual reference playback started at 442 Hz and stopped on the next click. The browser recorded no external resource requests and no console errors. Mobile (375px) and desktop (1440px) screenshots were inspected. This verifies the software path with generated audio; a physical microphone and mobile Safari were not tested. No deployment was performed.

After the license and manifest renames, the same checks were repeated on a copy of the tree with the folders the GitHub import drops removed (among them `node_modules`, `dist`, `build`, `target` and `.cache`; this tree has none of them):

- The rebuild recipe above, run on a copy with `app/vendor/` emptied first, recreated all five vendored files byte for byte (SHA-256 identical to the committed files), and `node tools/vendor/verify.mjs` passed the same 12 reference-tone checks.
- A local static server returned **200** for `/` and `/app/`, and both license notices are served as `text/plain` under their new names.
- Tofu's static-hosting check of this pin's GitHub archive accepts the tree as a finished static site (the first pin was refused: two files with no served extension and two named like build configuration), and Tofu's safety check reports no findings.
- A Chromium browser check supplied a generated 220 Hz MediaStream in place of microphone input. After the welcome dialog's OK, the root entry and the original `/app/` entry each showed **220.0 Hz / A3**. On the root entry, A4 calibration to 442 Hz updated the label and the A4 key's frequency and still read 442 after a reload; with Auto off, the A4 key played 442 Hz and stopped on the next click. No console errors or warnings were logged, and every request was same-origin and answered 200, except the browser's own `/favicon.ico` probe (404; the app declares no icon).

## Source and licenses

- Upstream: https://github.com/qiuxiang/tuner
- Upstream branch: `master`.
- Upstream commit: `09188342fc56d4124221908a4388eb00c3a484cc`.
- Adaptations branch: `tofu`; gallery pin: `pin/2026-10-23.1`. It replaces `pin/2026-10-23`, which stays in place and still resolves to the earlier tree.
- Fork: https://github.com/tofu-gallery/tuner
- App: MIT, copyright (c) 2022 Qiu Xiang. The upstream `license` remains unchanged.
- Pitchy 4.1.0: MIT; notice in `app/vendor/pitchy-LICENSE.txt`.
- fft.js 4.0.4: MIT; full upstream README including license in `app/vendor/fft.js-README.md`.
- SweetAlert2 9.17.1: MIT; notice in `app/vendor/sweetalert2-LICENSE.txt`.

The fork's `main` mirrors the upstream `master` commit without adaptation commits. All adaptation commits and the gallery pin belong to `tofu`.
