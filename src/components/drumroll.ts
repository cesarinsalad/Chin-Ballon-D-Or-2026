let ctx: AudioContext | null = null;

export function initAudio() {
  if (typeof window === "undefined") return;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
}

export function playDrumroll(muted: boolean, durationSeconds = 1.5) {
  if (muted || !ctx) return;
  const start = ctx.currentTime;
  const duration = durationSeconds;

  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 210;
  bandpass.Q.value = 0.9;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.5, start + duration * 0.72);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration + 0.18);

  const tremolo = ctx.createGain();
  tremolo.gain.value = 0.55;
  const lfo = ctx.createOscillator();
  lfo.type = "square";
  lfo.frequency.setValueAtTime(17, start);
  lfo.frequency.linearRampToValueAtTime(28, start + duration);
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 0.45;
  lfo.connect(lfoDepth);
  lfoDepth.connect(tremolo.gain);

  noise.connect(bandpass);
  bandpass.connect(tremolo);
  tremolo.connect(gain);
  gain.connect(ctx.destination);

  const thump = ctx.createOscillator();
  thump.type = "sine";
  thump.frequency.setValueAtTime(82, start + duration);
  thump.frequency.exponentialRampToValueAtTime(46, start + duration + 0.22);
  const thumpGain = ctx.createGain();
  thumpGain.gain.setValueAtTime(0.0001, start + duration);
  thumpGain.gain.exponentialRampToValueAtTime(0.55, start + duration + 0.03);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, start + duration + 0.3);
  thump.connect(thumpGain);
  thumpGain.connect(ctx.destination);

  noise.start(start);
  lfo.start(start);
  thump.start(start + duration);
  noise.stop(start + duration + 0.25);
  lfo.stop(start + duration + 0.25);
  thump.stop(start + duration + 0.35);
}
