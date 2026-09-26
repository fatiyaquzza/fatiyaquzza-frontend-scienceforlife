let sharedContext = null;
let sharedNoise = null;
let lastPlayedAt = -1;

const MIN_GAP = 0.11;
const GESTURE = 0.34;
const GRAINS = 9;

const rand = (min, max) => min + Math.random() * (max - min);

// Jeda antar suara harus diukur dengan jam yang selalu jalan. `context.currentTime`
// membeku selama AudioContext suspended, dan itu justru kondisi paling sering
// terjadi di HP: context baru hidup setelah sentuhan pertama. Kalau throttle
// memakai currentTime, beberapa putaran halaman pertama setelah context hidup
// terbaca berjarak 0 ms dan ikut terpotong -> halaman dibalik tanpa suara.
const wallClock = () => (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;

const getContext = () => {
  if (typeof window === "undefined") return null;
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) return null;
  if (!sharedContext) {
    try {
      sharedContext = new Context();
    } catch {
      sharedContext = null;
    }
  }
  if (sharedContext && sharedContext.state === "suspended") {
    try {
      sharedContext.resume?.();
    } catch {
      return sharedContext;
    }
  }
  return sharedContext;
};

const getNoise = (context) => {
  if (sharedNoise && sharedNoise.sampleRate === context.sampleRate) return sharedNoise;
  const length = Math.floor(context.sampleRate * 1.5);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  let low = 0;
  for (let index = 0; index < length; index += 1) {
    const white = Math.random() * 2 - 1;
    low = (low + 0.02 * white) / 1.02;
    data[index] = white * 0.85 + low * 0.85;
  }
  sharedNoise = buffer;
  return buffer;
};

const playGrain = (context, destination, { start, duration, offset, center, q, peak }) => {
  const source = context.createBufferSource();
  source.buffer = getNoise(context);
  source.playbackRate.value = rand(0.85, 1.35);

  const band = context.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = q;
  band.frequency.setValueAtTime(center * rand(1.05, 1.35), start);
  band.frequency.exponentialRampToValueAtTime(Math.max(280, center * rand(0.62, 0.82)), start + duration);

  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  source.connect(band).connect(gain).connect(destination);
  source.start(start, offset, duration + 0.03);
  source.stop(start + duration + 0.05);
};

export const playPageTurnSound = ({ direction = "next", volume = 0.15 } = {}) => {
  const context = getContext();
  if (!context) return;

  const now = context.currentTime;
  const wall = wallClock();
  if (lastPlayedAt >= 0 && wall - lastPlayedAt < MIN_GAP) return;
  lastPlayedAt = wall;

  const start = now + 0.004;
  const level = Math.min(0.3, Math.max(0.015, volume));
  const previous = direction === "previous";

  const master = context.createGain();
  master.gain.value = 1;

  // buang bass berat supaya tidak pernah terdengar seperti pukulan
  const floor = context.createBiquadFilter();
  floor.type = "highpass";
  floor.frequency.value = 320;
  floor.Q.value = 0.6;

  // haluskan gema atas supaya lembut
  const air = context.createBiquadFilter();
  air.type = "lowpass";
  air.frequency.value = 11000;
  air.Q.value = 0.4;

  // lem butiran yang bertumpuk agar tidak ada puncak tajam
  const glue = context.createDynamicsCompressor();
  glue.threshold.value = -20;
  glue.knee.value = 22;
  glue.ratio.value = 3.5;
  glue.attack.value = 0.004;
  glue.release.value = 0.16;

  floor.connect(air).connect(glue).connect(master).connect(context.destination);

  // lapisan udara: satu sapuan lebar tanpa bass, volume rendah
  const body = context.createBiquadFilter();
  body.type = "bandpass";
  body.Q.value = 0.55;
  body.frequency.setValueAtTime(previous ? 2600 : 1500, start);
  body.frequency.exponentialRampToValueAtTime(previous ? 1400 : 2900, start + GESTURE * 0.85);

  const bodyGain = context.createGain();
  bodyGain.gain.setValueAtTime(0.0001, start);
  bodyGain.gain.exponentialRampToValueAtTime(level * 0.5, start + 0.05);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, start + GESTURE * 0.9);

  const bodySource = context.createBufferSource();
  bodySource.buffer = getNoise(context);
  bodySource.connect(body).connect(bodyGain).connect(floor);
  bodySource.start(start, rand(0, 0.4), GESTURE);
  bodySource.stop(start + GESTURE + 0.05);

  // awan butiran: derau kertas yang bersahutan saat halaman dilipat
  const base = previous ? 2300 : 3200;
  for (let index = 0; index < GRAINS; index += 1) {
    const progress = index / (GRAINS - 1);
    const at = start + Math.pow(progress, 0.75) * (GESTURE - 0.05);
    const arc = Math.min(1, progress * 7) * Math.pow(1 - progress, 1.5);
    const duration = rand(0.03, 0.075);
    const drift = previous ? 1 - 0.35 * progress : 1.18 - 0.4 * progress;
    playGrain(context, floor, {
      start: at,
      duration,
      offset: rand(0, 0.5),
      center: Math.max(700, base * drift * rand(0.82, 1.28)),
      q: rand(0.9, 2.4),
      peak: Math.max(0.0002, level * 1 * arc * rand(0.7, 1.15))
    });
  }
};
