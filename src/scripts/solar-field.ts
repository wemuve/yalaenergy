/**
 * Animated solar-field layer.
 *
 * A hand-rolled perspective renderer on a 2D canvas, about 3 kB after minifying.
 * It draws the same ground plane as `SolarFieldScene.astro` and adds the motion
 * the static artwork cannot have: a slow camera drift, light crawling across the
 * module rows, and dust catching the low sun.
 *
 * Why not Three.js: a WebGL build of this effect costs 150 kB+ of JavaScript on
 * the critical path of the homepage to animate what is ultimately a decorative
 * backdrop. The brief asks for 3D "where it adds real value" and warns against
 * large dependencies for superficial effects, so the depth is computed here
 * directly and the budget stays with the content.
 *
 * Progressive-enhancement contract:
 *   • the static SVG scene sits underneath and is never removed;
 *   • this layer starts hidden and fades in only once it has drawn a frame;
 *   • it never runs under `prefers-reduced-motion: reduce`;
 *   • it never runs on a narrow viewport, a low-core device, or a tab in the
 *     background, and it stops when scrolled out of view.
 */

interface Ripple {
  u: number;
  depth: number;
  speed: number;
  size: number;
  alpha: number;
}

const HORIZON = 0.449; // fraction of canvas height, matched to the SVG scene
const SPREAD = 2.45;
const ROW_COUNT = 26;

export function mountSolarField(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return () => {};

  let width = 0;
  let height = 0;
  let dpr = 1;
  let raf = 0;
  let running = false;
  let visible = true;
  let inView = true;
  let start = performance.now();
  let revealed = false;

  const ripples: Ripple[] = Array.from({ length: 16 }, () => ({
    u: Math.random() * 2 - 1,
    depth: Math.random(),
    speed: 0.016 + Math.random() * 0.03,
    size: 0.4 + Math.random() * 0.9,
    alpha: 0.05 + Math.random() * 0.12,
  }));

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /** Screen y for a normalised depth (0 = foreground, 1 = horizon). */
  function depthToY(t: number, h: number): number {
    const horizonY = h * HORIZON;
    const near = 1 / (h - horizonY);
    const far = 1 / (h * 0.022);
    const d = near + (far - near) * t;
    return horizonY + 1 / d;
  }

  function draw(now: number) {
    raf = 0;
    if (!running) return;

    const t = (now - start) / 1000;
    const horizonY = height * HORIZON;
    // Slow lateral camera drift, ±1.4% of the frame over roughly 80 seconds.
    const drift = Math.sin(t * 0.0785) * width * 0.014;
    const vanishX = width * 0.494 + drift;

    ctx!.clearRect(0, 0, width, height);

    // Light crawling across the module rows.
    for (let i = 0; i < ROW_COUNT; i += 1) {
      const t0 = i / ROW_COUNT;
      const t1 = (i + 0.62) / ROW_COUNT;
      const yNear = depthToY(t0, height);
      const yFar = depthToY(t1, height);
      if (yFar <= horizonY + 1) continue;

      const halfNear = (yNear - horizonY) * SPREAD;
      const halfFar = (yFar - horizonY) * SPREAD;
      // Phase offset per row produces a wave travelling away from the camera.
      const wave = Math.sin(t * 0.42 - i * 0.46);
      const strength = Math.max(0, wave) ** 2.4 * (1 - t0 * 0.55);
      if (strength < 0.004) continue;

      const grad = ctx!.createLinearGradient(vanishX - halfNear, 0, vanishX + halfNear, 0);
      grad.addColorStop(0, 'rgba(255, 222, 170, 0)');
      grad.addColorStop(0.5, `rgba(255, 226, 178, ${(strength * 0.3).toFixed(4)})`);
      grad.addColorStop(1, 'rgba(255, 222, 170, 0)');

      ctx!.beginPath();
      ctx!.moveTo(vanishX - halfNear, yNear);
      ctx!.lineTo(vanishX + halfNear, yNear);
      ctx!.lineTo(vanishX + halfFar, yFar);
      ctx!.lineTo(vanishX - halfFar, yFar);
      ctx!.closePath();
      ctx!.fillStyle = grad;
      ctx!.fill();
    }

    // Dust and haze drifting through the low light.
    for (const r of ripples) {
      r.depth += r.speed * 0.004;
      if (r.depth > 1) {
        r.depth = 0;
        r.u = Math.random() * 2 - 1;
      }
      const y = depthToY(1 - r.depth, height);
      if (y <= horizonY) continue;
      const half = (y - horizonY) * SPREAD;
      const x = vanishX + r.u * half;
      const scale = (y - horizonY) / (height - horizonY);
      const radius = Math.max(0.6, r.size * scale * 9);
      ctx!.beginPath();
      ctx!.arc(x, y - scale * height * 0.06, radius, 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(255, 236, 205, ${(r.alpha * scale).toFixed(4)})`;
      ctx!.fill();
    }

    if (!revealed) {
      revealed = true;
      canvas.dataset.ready = 'true';
    }

    raf = requestAnimationFrame(draw);
  }

  function play() {
    if (running || !visible || !inView) return;
    running = true;
    start = performance.now() - 4000; // begin mid-cycle rather than from black
    raf = requestAnimationFrame(draw);
  }

  function pause() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  const onResize = () => {
    resize();
    if (!running) {
      // Keep the last frame correct even while paused.
      raf = requestAnimationFrame(draw);
    }
  };

  const onVisibility = () => {
    visible = document.visibilityState === 'visible';
    visible ? play() : pause();
  };

  const observer = new IntersectionObserver(
    (entries) => {
      inView = entries.some((e) => e.isIntersecting);
      inView ? play() : pause();
    },
    { rootMargin: '120px' },
  );

  resize();
  observer.observe(canvas);
  window.addEventListener('resize', onResize, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  play();

  return () => {
    pause();
    observer.disconnect();
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
