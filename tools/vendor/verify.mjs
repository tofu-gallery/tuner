import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const context = vm.createContext({
  window: { AudioContext: function () {} },
  navigator: { mediaDevices: { getUserMedia() {} } },
  alert(message) { throw new Error(message); },
});
vm.runInContext(readFileSync(new URL("../../app/vendor/pitchy.min.js", import.meta.url), "utf8"), context);
vm.runInContext(readFileSync(new URL("../../app/tuner.js", import.meta.url), "utf8"), context);
const detector = vm.runInContext("Pitchy.PitchDetector.forFloat32Array(4096)", context);
const tuner = vm.runInContext("new Tuner(440)", context);
detector.minVolumeDecibels = -60;
let cases = 0;
for (const sampleRate of [44100, 48000]) {
  for (const [frequency, note] of [[82.4069, 40], [110, 45], [196, 55], [261.6256, 60], [440, 69], [880, 81]]) {
    const samples = Float32Array.from({ length: 4096 }, (_, i) => 0.5 * Math.sin(2 * Math.PI * frequency * i / sampleRate));
    const [detected, clarity] = detector.findPitch(samples, sampleRate);
    const centsError = Math.abs(1200 * Math.log2(detected / frequency));
    assert.ok(clarity >= 0.9, `unclear ${frequency} Hz at ${sampleRate}: ${clarity}`);
    assert.ok(centsError < 1, `pitch error ${centsError} cents for ${frequency} Hz at ${sampleRate}`);
    assert.equal(tuner.getNote(detected), note);
    cases += 1;
  }
}
assert.equal(detector.findPitch(new Float32Array(4096), 48000)[1], 0);
console.log(`PASS: ${cases} reference tones across 44.1/48 kHz are within one cent; note mapping and silence passed.`);
