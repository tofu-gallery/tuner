# Tuner on Tofu

Tuner is Qiu Xiang's online instrument tuner. It listens to the microphone in the browser, displays the detected musical note and tuning offset, and can play reference notes. Audio processing stays on the device. The upstream app name and interface are retained.

## Hosting

- Tofu framework preset: `static`.
- Site root / output directory: repository root (`.`); the entry point is `index.html`.
- Deployment build command: none. All browser assets are checked in under `app/`.
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
- There are no analytics, advertising, external script loads, API keys or network services in the running app.

## Rebuild vendored assets (maintainers only)

From the repository root:

```sh
npm --prefix tools/vendor ci --ignore-scripts --no-audit --no-fund
npm --prefix tools/vendor run build
node tools/vendor/verify.mjs
```

Node.js 22 and npm 10 were used. `tools/vendor/package-lock.json` pins the packages; esbuild is only used to produce the committed browser bundle. Keep the generated files and all vendor license notices together.

## Local verification

```sh
python3 -I -m http.server 4387 --bind 127.0.0.1 --directory /absolute/path/to/tuner
curl --fail --silent --show-error -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4387/
curl --fail --silent --show-error -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4387/app/
```

Both entry points returned **200**. The frozen dependency install and vendor build passed. `node tools/vendor/verify.mjs` passed 12 reference-tone checks at 44.1/48 kHz, with less than one cent of pitch error, correct note mapping and no pitch on silence.

A local Chromium browser check supplied a generated 220 Hz MediaStream in place of microphone input and observed **220.0 Hz / A3** in the UI. A4 calibration changed to 442 Hz; manual reference playback started at 442 Hz and stopped on the next click. The browser recorded no external resource requests and no console errors. Mobile (375px) and desktop (1440px) screenshots were inspected. This verifies the software path with generated audio; a physical microphone and mobile Safari were not tested. No deployment was performed.

## Source and licenses

- Upstream: https://github.com/qiuxiang/tuner
- Upstream branch: `master`.
- Upstream commit: `09188342fc56d4124221908a4388eb00c3a484cc`.
- Adaptations branch: `tofu`; gallery pin: `pin/2026-10-23`.
- Fork: https://github.com/tofu-gallery/tuner
- App: MIT, copyright (c) 2022 Qiu Xiang. The upstream `license` remains unchanged.
- Pitchy 4.1.0: MIT; notice in `app/vendor/pitchy-LICENSE`.
- fft.js 4.0.4: MIT; full upstream README including license in `app/vendor/fft.js-README.md`.
- SweetAlert2 9.17.1: MIT; notice in `app/vendor/sweetalert2-LICENSE`.

The fork's `main` mirrors the upstream `master` commit without adaptation commits. All adaptation commits and the gallery pin belong to `tofu`.
