import { copyFile, mkdir } from "node:fs/promises";

const root = new URL("../../app/vendor/", import.meta.url);
await mkdir(root, { recursive: true });
for (const [source, target] of [
  ["pitchy/LICENSE", "pitchy-LICENSE.txt"],
  ["fft.js/README.md", "fft.js-README.md"],
  ["sweetalert2/LICENSE", "sweetalert2-LICENSE.txt"],
  ["sweetalert2/dist/sweetalert2.all.min.js", "sweetalert2.all.min.js"],
]) {
  await copyFile(new URL(`node_modules/${source}`, import.meta.url), new URL(target, root));
}
