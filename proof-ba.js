/* SearchRhody before/after proof: scroll-driven wipe. Deterministic in p. */
(() => {
  const SCREEN = { w: 390, h: 844 };

  const QUADS = {
    desktop: {
      src: [1280, 720],
      quad: [
        [547.67, 222.29],
        [727.4, 220.46],
        [750.17, 540.56],
        [536.35, 542.23],
      ],
      body: [528, 212, 785, 588],
    },
    mobile: {
      src: [720, 1280],
      quad: [
        [267.15, 428.75],
        [466.83, 427.64],
        [487.55, 787.34],
        [249.63, 787.23],
      ],
      body: [245, 418, 530, 838],
    },
  };

  const CH = [
    { id: "open", start: 0, end: 0.12, caption: "A business with no presence yet." },
    { id: "findable", start: 0.12, end: 0.42, caption: "From invisible to findable." },
    { id: "basics", start: 0.42, end: 0.72, caption: "Get the basics set up." },
    { id: "ready", start: 0.72, end: 1, caption: "Ready to grow, if and when you want to." },
  ];

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const art = $("#stage-art");
  const still = $("#still");
  const screenLayer = $("#screen-layer");
  const listingAfter = $("#listing-after");
  const wipeLine = $("#wipe-line");
  const captionEl = $("#caption");
  const dots = $$(".dot");
  const btnSkip = $("#ctrl-skip");
  const btnReplay = $("#ctrl-replay");
  const btnMotion = $("#ctrl-motion");
  const labelFindable = $("#label-findable");
  const labelBasics = $("#label-basics");
  const labelReady = $("#label-ready");
  const tagBefore = $(".tag-before");
  const tagAfter = $(".tag-after");
  const wrap = $("#stage-art-wrap");

  let mode = "desktop";
  let motionOn = true;
  let ticking = false;
  let lastP = 0;
  const cam = {
    targetScale: 1,
    phoneX: 0,
    phoneY: 0,
    artW: 0,
    artH: 0,
    wrapW: 0,
    wrapH: 0,
    scale: 1,
  };

  function mediaMobile() {
    return window.matchMedia("(max-width: 768px), (orientation: portrait)").matches;
  }

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function range(p, a, b) {
    if (b <= a) return p >= b ? 1 : 0;
    return clamp((p - a) / (b - a), 0, 1);
  }

  function smooth(t) {
    return t * t * (3 - 2 * t);
  }

  function solve(A, b) {
    const n = b.length;
    const M = A.map((row, i) => row.concat([b[i]]));
    for (let k = 0; k < n; k++) {
      let max = k;
      for (let i = k + 1; i < n; i++) {
        if (Math.abs(M[i][k]) > Math.abs(M[max][k])) max = i;
      }
      [M[k], M[max]] = [M[max], M[k]];
      const piv = M[k][k];
      if (Math.abs(piv) < 1e-12) throw new Error("singular homography");
      for (let i = k + 1; i < n; i++) {
        const f = M[i][k] / piv;
        for (let j = k; j <= n; j++) M[i][j] -= f * M[k][j];
      }
    }
    const x = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let s = M[i][n];
      for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j];
      x[i] = s / M[i][i];
    }
    return x;
  }

  function matrix3dForQuad(w, h, dest) {
    const src = [
      { x: 0, y: 0 },
      { x: w, y: 0 },
      { x: w, y: h },
      { x: 0, y: h },
    ];
    const A = [];
    const b = [];
    for (let i = 0; i < 4; i++) {
      const s = src[i];
      const d = dest[i];
      A.push([s.x, s.y, 1, 0, 0, 0, -s.x * d.x, -s.y * d.x]);
      b.push(d.x);
      A.push([0, 0, 0, s.x, s.y, 1, -s.x * d.y, -s.y * d.y]);
      b.push(d.y);
    }
    const H = solve(A, b);
    return `matrix3d(${[
      H[0], H[3], 0, H[6],
      H[1], H[4], 0, H[7],
      0, 0, 1, 0,
      H[2], H[5], 0, 1,
    ].join(",")})`;
  }

  function insetQuad(pts, px) {
    const cx = pts.reduce((s, p) => s + p.x, 0) / 4;
    const cy = pts.reduce((s, p) => s + p.y, 0) / 4;
    return pts.map((p) => {
      const dx = cx - p.x;
      const dy = cy - p.y;
      const L = Math.hypot(dx, dy) || 1;
      return { x: p.x + (px * dx) / L, y: p.y + (px * dy) / L };
    });
  }

  function currentProgress() {
    if (!motionOn) return 1;
    const el = $("#proof-scroll");
    const navH = navHeight();
    const total = el.offsetHeight - (window.innerHeight - navH);
    if (total <= 1) return 0;
    const scrolled = navH - el.getBoundingClientRect().top;
    return clamp(scrolled / total, 0, 1);
  }

  function navHeight() {
    const nav = document.querySelector(".nav");
    return nav ? nav.offsetHeight : 72;
  }

  function layoutArt() {
    mode = mediaMobile() ? "mobile" : "desktop";
    document.body.dataset.art = mode;
    document.documentElement.style.setProperty("--nav-h", navHeight() + "px");

    const sw = wrap.clientWidth;
    const sh = wrap.clientHeight;
    const [srcW, srcH] = QUADS[mode].src;
    const ar = srcW / srcH;
    let w = sw;
    let h = w / ar;
    if (h > sh) {
      h = sh;
      w = h * ar;
    }
    art.style.width = `${w}px`;
    art.style.height = `${h}px`;

    const srcQuad = QUADS[mode].quad.map(([x, y]) => ({
      x: (x / srcW) * w,
      y: (y / srcH) * h,
    }));
    const dest = insetQuad(srcQuad, 1.1);
    screenLayer.style.width = SCREEN.w + "px";
    screenLayer.style.height = SCREEN.h + "px";
    screenLayer.style.transform = matrix3dForQuad(SCREEN.w, SCREEN.h, dest);

    const [bx0, by0, bx1, by1] = QUADS[mode].body;
    const phoneW = ((bx1 - bx0) / srcW) * w;
    const phoneH = ((by1 - by0) / srcH) * h;
    const mobile = mode === "mobile";
    const FILL = mobile ? 0.80 : 0.92;
    const MAX_FILL = mobile ? 0.84 : 0.96;
    let target = Math.min((FILL * sw) / phoneW, (FILL * sh) / phoneH);
    target = Math.max(1, target);
    target = Math.min(target, (MAX_FILL * sw) / phoneW, (MAX_FILL * sh) / phoneH);
    cam.targetScale = target;
    cam.phoneX = (((bx0 + bx1) / 2) / srcW) * w;
    cam.phoneY = (((by0 + by1) / 2) / srcH) * h;
    cam.artW = w;
    cam.artH = h;
    cam.wrapW = sw;
    cam.wrapH = sh;

    setStillSource();
    apply(motionOn ? lastP : 1);
  }

  function setStillSource() {
    const webp = `assets/proof/phone-${mode}.webp`;
    const jpg = `assets/proof/phone-${mode}.jpg`;
    const poster = `assets/proof/phone-${mode}-poster.webp`;
    const posterEl = $("#poster");
    if (posterEl.getAttribute("src") !== poster) posterEl.src = poster;

    const webpSrc = $("#still-webp");
    const jpgSrc = $("#still-jpg");
    const changed = webpSrc.getAttribute("srcset") !== webp;
    if (changed) {
      webpSrc.setAttribute("srcset", webp);
      jpgSrc.setAttribute("srcset", jpg);
      if (still.getAttribute("src") !== jpg) still.src = jpg;
      still.alt = "";
    }
    if (still.complete && still.naturalWidth) {
      art.classList.add("is-loaded");
    }
  }

  still.addEventListener("load", () => art.classList.add("is-loaded"));
  still.addEventListener("error", () => art.classList.add("is-loaded"));

  function applyCamera(p) {
    if (!cam.artW || !cam.wrapW) return;
    // Arrive at a readable phone a little earlier so the listing can be read
    // during the wipe. Slight ease-back at the end. Reduced-motion uses p=1.
    const tIn = smooth(range(p, 0.0, 0.28));
    const tBack = smooth(range(p, 0.88, 1));
    const amt = tIn * (1 - 0.06 * tBack);
    const s = 1 + (cam.targetScale - 1) * amt;
    const artLeft = (cam.wrapW - cam.artW) / 2;
    const artTop = (cam.wrapH - cam.artH) / 2;
    const naturalX = artLeft + cam.phoneX;
    const naturalY = artTop + cam.phoneY;
    const wantX = cam.wrapW * 0.5;
    // On mobile, sit the phone a little higher so labels can live under the chin.
    const wantY = mediaMobile() ? cam.wrapH * 0.42 : cam.wrapH * 0.5;
    const targetX = naturalX + (wantX - naturalX) * amt;
    const targetY = naturalY + (wantY - naturalY) * amt;
    const tx = targetX - artLeft - cam.phoneX * s;
    const ty = targetY - artTop - cam.phoneY * s;
    cam.scale = s;
    art.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${s})`;
  }

  function setLabel(el, on) {
    el.style.opacity = on ? "1" : "0";
    el.style.transform = on ? "translateY(0)" : "translateY(8px)";
    el.classList.toggle("is-on", on);
  }

  function placeLabels() {
    if (mediaMobile()) return; // CSS stacks chips at the bottom of the wrap
    const clip = document.querySelector(".screen-clip");
    if (!clip || !cam.wrapW) return;
    const wr = wrap.getBoundingClientRect();
    const sr = clip.getBoundingClientRect();
    const rightSpace = wr.right - sr.right;
    const leftSpace = sr.left - wr.left;
    const useRight = rightSpace >= leftSpace && rightSpace >= 140;
    const labels = [labelFindable, labelBasics, labelReady];
    const anchors = [0.18, 0.48, 0.78]; // along screen height
    labels.forEach((el, i) => {
      const y = sr.top - wr.top + sr.height * anchors[i] - el.offsetHeight / 2;
      if (useRight) {
        el.style.left = `${sr.right - wr.left + 14}px`;
        el.style.right = "auto";
      } else {
        el.style.left = "auto";
        el.style.right = `${wr.right - sr.left + 14}px`;
      }
      el.style.top = `${Math.max(8, Math.min(y, wr.height - 48))}px`;
    });
  }

  function apply(p) {
    lastP = p;
    document.documentElement.style.setProperty("--p", String(p));
    applyCamera(p);

    // Left-to-right wipe across the phone screen.
    const wipe = smooth(range(p, 0.10, 0.78));
    const pct = (wipe * 100).toFixed(2);
    listingAfter.style.clipPath = `inset(0 ${100 - wipe * 100}% 0 0)`;
    wipeLine.style.left = `${pct}%`;
    wipeLine.style.opacity = wipe > 0.02 && wipe < 0.98 ? "1" : wipe > 0 && wipe < 1 ? String(wipe < 0.5 ? wipe / 0.02 : (1 - wipe) / 0.02) : "0";
    if (tagBefore) tagBefore.style.opacity = wipe < 0.92 ? "1" : String(clamp((1 - wipe) / 0.08, 0, 1));
    if (tagAfter) tagAfter.style.opacity = wipe > 0.08 ? String(clamp((wipe - 0.08) / 0.12, 0, 1)) : "0";

    setLabel(labelFindable, p >= 0.20);
    setLabel(labelBasics, p >= 0.46);
    setLabel(labelReady, p >= 0.72);
    placeLabels();

    let ch = CH[0];
    for (const c of CH) if (p >= c.start) ch = c;
    captionEl.textContent = ch.caption;
    captionEl.classList.toggle("is-hidden", !ch.caption);
    dots.forEach((d, i) => {
      const on = CH[i] && ch.id === CH[i].id;
      d.setAttribute("aria-current", on ? "true" : "false");
    });
  }

  function readAndApply() {
    ticking = false;
    apply(currentProgress());
  }

  function requestTick() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(readAndApply);
  }

  function scrollToProgress(p, behavior = "instant") {
    p = clamp(p, 0, 1);
    if (!motionOn) {
      apply(1);
      return;
    }
    const el = $("#proof-scroll");
    const navH = navHeight();
    const total = el.offsetHeight - (window.innerHeight - navH);
    const top = el.offsetTop - navH + total * p;
    window.scrollTo({ top, behavior: behavior === "smooth" ? "smooth" : "instant" });
    if (behavior !== "smooth") apply(p);
  }

  function setMotion(on, { user } = {}) {
    motionOn = on;
    btnMotion.setAttribute("aria-pressed", on ? "true" : "false");
    btnMotion.textContent = on ? "Motion on" : "Motion off";
    document.body.classList.toggle("is-static", !on);
    if (!on) {
      apply(1);
    } else if (user) {
      scrollToProgress(0);
    }
  }

  function initMotionPreference() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMotion(!reduce);
  }

  btnSkip.addEventListener("click", () => {
    if (!motionOn) return;
    scrollToProgress(1);
  });
  btnReplay.addEventListener("click", () => {
    if (!motionOn) {
      setMotion(true, { user: true });
      return;
    }
    scrollToProgress(0);
  });
  btnMotion.addEventListener("click", () => setMotion(!motionOn, { user: true }));

  dots.forEach((d) => {
    d.addEventListener("click", () => {
      const i = Number(d.dataset.chapter);
      const c = CH[i];
      if (!c) return;
      if (!motionOn) setMotion(true, { user: true });
      const p = c.start + (c.end - c.start) * 0.35;
      scrollToProgress(p);
    });
  });

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", () => {
    layoutArt();
    requestTick();
  });
  window.addEventListener("orientationchange", () => {
    setTimeout(() => {
      layoutArt();
      requestTick();
    }, 200);
  });

  window.addEventListener("keydown", (e) => {
    if (e.target && ["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
    const key = e.key;
    if (key === "Home") {
      e.preventDefault();
      scrollToProgress(0);
    } else if (key === "End") {
      e.preventDefault();
      scrollToProgress(1);
    } else if (key === "ArrowRight" || key === "]") {
      e.preventDefault();
      const p = currentProgress();
      const next = CH.find((c) => c.start > p + 0.02) || CH[CH.length - 1];
      scrollToProgress(next.start + 0.35 * (next.end - next.start));
    } else if (key === "ArrowLeft" || key === "[") {
      e.preventDefault();
      const p = currentProgress();
      const prev = [...CH].reverse().find((c) => c.end < p + 0.02) || CH[0];
      scrollToProgress(prev.start + 0.35 * (prev.end - prev.start));
    }
  });

  window.__proof = {
    progress: () => lastP,
    seek: (p) => scrollToProgress(clamp(Number(p), 0, 1)),
    layout: layoutArt,
    mode: () => mode,
    camera: () => ({ ...cam }),
  };

  const toggle = document.querySelector(".nav-toggle");
  const links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    links.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  initMotionPreference();
  layoutArt();
  apply(currentProgress());
})();
