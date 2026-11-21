// Mobile nav
const toggle = document.querySelector('.nav-toggle');
const links = document.getElementById('nav-links');
if (toggle && links) {
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    });
  });
}

// Footer year
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Scroll reveal. Content stays visible if JS or the observer is unavailable.
const targets = document.querySelectorAll(
  '.section h2, .prose, .card, .step-card, .who-card, .about-card, .faq-item, .contact-card, .service-card, .path-card, .package-card, .compare-scroll, .how-note, .contact-lede'
);
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if ('IntersectionObserver' in window && !reduce) {
  targets.forEach((t) => t.classList.add('reveal'));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  targets.forEach((t) => io.observe(t));
}


// Hero phone-screen accent. The UI is fully visible without this.
(function () {
  const stage = document.querySelector('.hero-stage');
  if (!stage) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  let done = false;
  const accent = () => {
    if (done) return;
    const r = stage.getBoundingClientRect();
    const visible = r.bottom > 80 && r.top < window.innerHeight * 0.92;
    if (visible && window.scrollY > 8) {
      done = true;
      stage.classList.add('is-accent');
      window.removeEventListener('scroll', accent);
    }
  };
  window.addEventListener('scroll', accent, { passive: true });
})();
