/* ===== Tiện ích ===== */
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===== 1. Màn hình chờ ===== */
addEventListener('load', () => setTimeout(() => $('#loader').classList.add('done'), 900));

/* ===== 2. Tên hiện từng chữ ===== */
const nameEl = $('.name');
[...'Huỳnh Thị Ngân Huỳnh'].forEach((c, i) => {
  const s = document.createElement('span');
  s.className = 'ch';
  s.textContent = c === ' ' ? '\u00A0' : c;
  s.style.animationDelay = `${1 + i * 0.06}s`;
  nameEl.appendChild(s);
});

/* ===== 3. Hiệu ứng gõ chữ ===== */
const words = ['Năng động ⚡', 'Sáng tạo 🎨', 'Học bá 📚', 'Có trách nhiệm 🤝', 'Vui vẻ 😄'];
let w = 0, c = 0, del = false;
(function type() {
  const el = $('#typed'), word = words[w];
  el.textContent = word.slice(0, c);
  if (!del && c === word.length) { del = true; return setTimeout(type, 1400); }
  if (del && c === 0) { del = false; w = (w + 1) % words.length; }
  c += del ? -1 : 1;
  setTimeout(type, del ? 45 : 90);
})();

/* ===== 4. Thanh tiến trình + parallax ===== */
const blobs = $$('.blob');
addEventListener('scroll', () => {
  const h = document.documentElement;
  $('#progress').style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + '%';
  blobs.forEach((b, i) => b.style.transform = `translateY(${scrollY * (0.08 + i * 0.05)}px)`);
}, { passive: true });

/* ===== 5. Hiện khi lướt tới (Scroll Reveal) ===== */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    el.classList.add('show');
    $$('.bar i', el).forEach(b => b.style.width = b.dataset.w + '%');
    $$('.count', el).forEach(countUp);
    if (el.classList.contains('count')) countUp(el);
    io.unobserve(el);
  });
}, { threshold: 0.2 });
$$('.reveal').forEach(el => io.observe(el));

/* ===== 6. Đếm số ===== */
function countUp(el) {
  if (el.dataset.done) return;
  el.dataset.done = 1;
  const to = +el.dataset.to, suf = el.dataset.suffix || '', t0 = performance.now(), dur = 1800;
  (function step(t) {
    const p = Math.min((t - t0) / dur, 1), ease = 1 - Math.pow(1 - p, 4);
    el.textContent = Math.round(to * ease) + suf;
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}

/* ===== 7. Thẻ nghiêng 3D ===== */
$$('.tilt').forEach(card => {
  card.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(700px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale(1.04)`;
  });
  card.addEventListener('pointerleave', () => card.style.transform = '');
});

/* ===== 8. Đổi giao diện sáng/tối ===== */
const root = document.documentElement, tbtn = $('#theme');
const setTheme = t => { root.dataset.theme = t; tbtn.textContent = t === 'dark' ? '☀️' : '🌙'; };
setTheme(matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
tbtn.onclick = () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');

/* ===== 9. Canvas: tim bay + vệt lấp lánh + pháo hoa tim ===== */
const cv = $('#fx'), ctx = cv.getContext('2d');
let W, H, parts = [];
const icons = ['💗', '✨', '🌸', '⭐', '💖', '🎀'];
const resize = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; };
addEventListener('resize', resize); resize();

function spawn(x, y, o = {}) {
  parts.push({
    x, y, ch: o.ch || icons[Math.random() * icons.length | 0],
    vx: o.vx ?? (Math.random() - .5) * 1, vy: o.vy ?? -(0.4 + Math.random()),
    g: o.g || 0, s: o.s || 12 + Math.random() * 14, life: 1, d: o.d || 0.004 + Math.random() * 0.004,
    rot: Math.random() * 6, vr: (Math.random() - .5) * .08, sway: Math.random() * 6
  });
}
function burst(x, y, n = 28) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = 2 + Math.random() * 5;
    spawn(x, y, { vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, g: .12, d: .012, s: 16 + Math.random() * 14 });
  }
}
// tim nền bay lên
if (!reduce) setInterval(() => spawn(Math.random() * W, H + 20, { d: .0025, s: 14 + Math.random() * 12 }), 600);
// vệt chuột
let last = 0;
addEventListener('pointermove', e => {
  if (reduce || e.timeStamp - last < 45) return;
  last = e.timeStamp;
  spawn(e.clientX, e.clientY, { ch: Math.random() > .5 ? '✨' : '💗', vx: (Math.random() - .5) * 1.5, vy: Math.random() * 1.2, s: 10 + Math.random() * 8, d: .03 });
});
// bấm bất kỳ → pháo hoa tim
addEventListener('pointerdown', e => burst(e.clientX, e.clientY, 14));
$('#avatar').addEventListener('click', e => { const r = e.currentTarget.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 50); });
$('#love').addEventListener('click', e => { for (let i = 0; i < 6; i++) setTimeout(() => burst(Math.random() * W, H * (.3 + Math.random() * .4), 22), i * 150); });

(function loop() {
  ctx.clearRect(0, 0, W, H);
  parts = parts.filter(p => p.life > 0);
  for (const p of parts) {
    p.x += p.vx + Math.sin(p.life * p.sway * 6) * .3; p.y += p.vy; p.vy += p.g; p.rot += p.vr; p.life -= p.d;
    ctx.save(); ctx.globalAlpha = Math.max(p.life, 0); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.font = p.s + 'px serif'; ctx.textAlign = 'center'; ctx.fillText(p.ch, 0, 0); ctx.restore();
  }
  requestAnimationFrame(loop);
})();