const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealEls = document.querySelectorAll('[data-reveal], [data-stagger]');

if (reduceMotion) {
  revealEls.forEach((el) => el.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: '0px 0px -6% 0px' },
  );

  revealEls.forEach((el) => observer.observe(el));

  const progress = document.querySelector('.scroll-progress');
  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = `${pct}%`;
  };

  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    if (!href) return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

document.querySelectorAll('[data-scroll-edit]').forEach((section) => {
  const setProgress = () => {
    if (reduceMotion) {
      section.style.setProperty('--edit-progress', '1');
      return;
    }

    const rect = section.getBoundingClientRect();
    const max = section.offsetHeight - window.innerHeight;
    const raw = max > 0 ? -rect.top / max : 0;
    const leadIn = 0.18;
    const exitHold = 0.16;
    const linear = Math.min(1, Math.max(0, (raw - leadIn) / (1 - leadIn - exitHold)));
    const eased = linear * linear * (3 - 2 * linear);
    const wordProgress = Math.min(1, eased * 1.16);

    section.style.setProperty('--edit-progress', eased.toFixed(4));
    section.style.setProperty('--word-progress', wordProgress.toFixed(4));
  };

  setProgress();
  window.addEventListener('scroll', setProgress, { passive: true });
  window.addEventListener('resize', setProgress);
});

document.querySelectorAll("[data-image-gallery]").forEach((gallery) => {
  const track = gallery.querySelector("[data-gallery-track]");
  if (!track) return;

  let autoplay = !reduceMotion;
  let rafId = null;
  let lastTime = null;
  let isDragging = false;
  let startX = 0;
  let startScroll = 0;

  const firstSet = track.querySelector(".image-gallery-set");

  const getLoopWidth = () => {
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return firstSet ? firstSet.offsetWidth + gap : track.scrollWidth / 2;
  };

  const normalizeScroll = () => {
    const loopWidth = getLoopWidth();
    if (!loopWidth) return;

    if (track.scrollLeft >= loopWidth) {
      track.scrollLeft -= loopWidth;
    } else if (track.scrollLeft <= 0) {
      track.scrollLeft += loopWidth;
    }
  };

  const stopAutoplay = () => {
    autoplay = false;
    gallery.dataset.userControlled = "true";
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  };

  const tick = (time) => {
    if (!autoplay) return;
    if (lastTime === null) lastTime = time;

    const delta = time - lastTime;
    lastTime = time;
    track.scrollLeft += delta * 0.035;
    normalizeScroll();
    rafId = requestAnimationFrame(tick);
  };

  const endDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove("is-dragging");
  };

  track.addEventListener("pointerdown", (event) => {
    stopAutoplay();
    isDragging = true;
    startX = event.clientX;
    startScroll = track.scrollLeft;
    track.classList.add("is-dragging");
    track.setPointerCapture(event.pointerId);
  });

  track.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    event.preventDefault();
    const loopWidth = getLoopWidth();
    let nextScroll = startScroll - (event.clientX - startX);

    if (loopWidth) {
      while (nextScroll < 0) nextScroll += loopWidth;
      while (nextScroll >= loopWidth) nextScroll -= loopWidth;
    }

    track.scrollLeft = nextScroll;
  });

  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);
  track.addEventListener("wheel", stopAutoplay, { passive: true });

  if (autoplay) {
    rafId = requestAnimationFrame(tick);
  }
});
