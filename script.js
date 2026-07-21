/* =============================================
   SCRIPT.JS — Alex Voss Portfolio
   Interactions, Parallax, Animations
   ============================================= */

'use strict';

// ----------------------------------------
// NAV: scroll detection + mobile toggle
// ----------------------------------------
const nav = document.getElementById('nav');
const navBurger = document.getElementById('navBurger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}, { passive: true });

navBurger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = navBurger.querySelectorAll('span');
  if (navLinks.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
});

// Close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    const spans = navBurger.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  });
});

// ----------------------------------------
// SCROLL REVEAL — IntersectionObserver
// ----------------------------------------
const revealEls = document.querySelectorAll([
  '.credibility-card',
  '.about-grid',
  '.stat-card',
  '.svc-card',
  '.tool-chip',
  '.work-showcase',
  '.proj-card',
  '.process-step',
  '.exp-item',
  '.testi-card',
  '.contact-inner',
  '.section-header',
  '.hstat',
  '.tools-text',
  '.tools-badges',
  '.about-label-col',
  '.about-text-col',
  '.about-stats-col',
].join(', '));

revealEls.forEach((el) => {
  el.classList.add('reveal');
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => observer.observe(el));

// Stagger children
function staggerReveal(parentSelector, childDelay = 80) {
  const parents = document.querySelectorAll(parentSelector);
  parents.forEach(parent => {
    const children = [...parent.children];
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * childDelay}ms`;
    });
  });
}
staggerReveal('.credibility-grid', 100);
staggerReveal('.services-grid', 90);
staggerReveal('.tools-badges', 60);
staggerReveal('.work-grid', 100);
staggerReveal('.testi-grid', 120);
staggerReveal('.process-steps', 100);
staggerReveal('.about-stats-col', 80);

// ----------------------------------------
// PARALLAX — Hero elements
// ----------------------------------------
const parallaxEls = document.querySelectorAll('[data-parallax]');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  parallaxEls.forEach(el => {
    const speed = parseFloat(el.dataset.parallax);
    el.style.transform = `translateY(${scrollY * speed}px)`;
  });
}, { passive: true });

// ----------------------------------------
// HERO CARD BUTTONS
// ----------------------------------------
const btnHire = document.getElementById('btnHire');
const btnWork = document.getElementById('btnWork');

btnHire.addEventListener('click', () => {
  document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
});
btnWork.addEventListener('click', () => {
  document.getElementById('work').scrollIntoView({ behavior: 'smooth' });
});

// ----------------------------------------
// CHROME TEXT SHIMMER — enhanced on hover
// ----------------------------------------
const chromeTexts = document.querySelectorAll('.chrome-text');
chromeTexts.forEach(el => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    el.style.backgroundPosition = `${x}% center`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.backgroundPosition = '';
  });
});

// ----------------------------------------
// HERO CARD — 3D tilt effect
// ----------------------------------------
const heroCard = document.getElementById('heroCard');
if (heroCard) {
  heroCard.addEventListener('mousemove', (e) => {
    const rect = heroCard.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    heroCard.style.transform = `
      translateY(-6px)
      perspective(800px)
      rotateX(${-y * 8}deg)
      rotateY(${x * 8}deg)
      scale(1.02)
    `;
  });
  heroCard.addEventListener('mouseleave', () => {
    heroCard.style.transform = '';
  });
}

// ----------------------------------------
// ACTIVE NAV SECTION HIGHLIGHT
// ----------------------------------------
const sections = document.querySelectorAll('section[id]');
const navLinksList = navLinks.querySelectorAll('a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinksList.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}, { threshold: 0.35 });

sections.forEach(s => sectionObserver.observe(s));

// Active nav link style
const style = document.createElement('style');
style.textContent = `.nav-links a.active { color: #fff; }`;
document.head.appendChild(style);

// ----------------------------------------
// SMOOTH SCROLL for all anchor links
// ----------------------------------------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ----------------------------------------
// TICKER: pause on hover
// ----------------------------------------
const tickerTrack = document.querySelector('.ticker-track');
if (tickerTrack) {
  const heroTicker = document.querySelector('.hero-ticker');
  heroTicker.addEventListener('mouseenter', () => {
    tickerTrack.style.animationPlayState = 'paused';
  });
  heroTicker.addEventListener('mouseleave', () => {
    tickerTrack.style.animationPlayState = 'running';
  });
}

// ----------------------------------------
// STATS COUNTER ANIMATION
// ----------------------------------------
function animateCounter(el, target, suffix = '', duration = 1500) {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.round(start + (target - start) * eased);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterEls = [
  { id: 'hstat-0', val: 120, suffix: '+' },
  { id: 'hstat-1', val: 80, suffix: '+' },
  { id: 'hstat-2', val: 98, suffix: '%' },
  { id: 'hstat-3', val: 5, suffix: '+' },
];

const heroStatsWrap = document.querySelector('.hero-stats-col');
if (heroStatsWrap) {
  const hstatNums = heroStatsWrap.querySelectorAll('.hstat-num');
  const countersData = [
    { val: 200, suffix: '+' },
    { val: 150, suffix: '+' },
    { val: 98, suffix: '%' },
    { val: 2, suffix: '+' },
  ];

  let countersTriggered = false;
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersTriggered) {
        countersTriggered = true;
        hstatNums.forEach((el, i) => {
          const d = countersData[i];
          animateCounter(el, d.val, d.suffix, 1800 + i * 200);
        });
      }
    });
  }, { threshold: 0.5 });
  counterObserver.observe(heroStatsWrap);
}

// ----------------------------------------
// CURSOR GLOW — subtle purple follower
// ----------------------------------------
const cursorGlow = document.createElement('div');
cursorGlow.style.cssText = `
  position: fixed;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(155,119,212,0.08) 0%, transparent 70%);
  pointer-events: none;
  z-index: 9998;
  transform: translate(-50%, -50%);
  transition: opacity 0.3s;
  left: -999px;
  top: -999px;
`;
document.body.appendChild(cursorGlow);

let mouseX = -999, mouseY = -999;
let glowX = -999, glowY = -999;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
}, { passive: true });

function animateCursor() {
  glowX += (mouseX - glowX) * 0.08;
  glowY += (mouseY - glowY) * 0.08;
  cursorGlow.style.left = `${glowX}px`;
  cursorGlow.style.top = `${glowY}px`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

// ----------------------------------------
// PROJECT CARD: scale image on hover handled by CSS
// Extra: add subtle tilt to proj cards
// ----------------------------------------
document.querySelectorAll('.proj-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-8px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
    card.style.perspective = '800px';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ----------------------------------------
// VIDEO LIGHTBOX MODAL
// Supports: YouTube, Vimeo, Instagram, .mp4/.webm/.mov
// ----------------------------------------

/**
 * Detects what kind of URL was passed.
 * Returns: { type: 'iframe'|'video', src, portrait, mimeType }
 */
function detectVideo(url) {
  // ── Local or remote video file ──────────────────────────────────────
  const MP4_EXT  = /\.(mp4)(\?.*)?$/i;
  const WEBM_EXT = /\.(webm)(\?.*)?$/i;
  const MOV_EXT  = /\.(mov)(\?.*)?$/i;

  if (MP4_EXT.test(url))  return { type: 'video', src: url, portrait: false, mimeType: 'video/mp4' };
  if (WEBM_EXT.test(url)) return { type: 'video', src: url, portrait: false, mimeType: 'video/webm' };
  if (MOV_EXT.test(url))  return { type: 'video', src: url, portrait: false, mimeType: 'video/mp4' }; // MOV plays as mp4 in most browsers

  try {
    const u = new URL(url);

    // ── YouTube standard watch ──────────────────────────────────────────
    if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) {
      return { type: 'iframe', src: `https://www.youtube.com/embed/${u.searchParams.get('v')}?autoplay=1&rel=0`, portrait: false };
    }
    // ── YouTube short link youtu.be ─────────────────────────────────────
    if (u.hostname === 'youtu.be') {
      return { type: 'iframe', src: `https://www.youtube.com/embed${u.pathname}?autoplay=1&rel=0`, portrait: false };
    }
    // ── YouTube Shorts ──────────────────────────────────────────────────
    if (u.hostname.includes('youtube.com') && u.pathname.startsWith('/shorts/')) {
      const id = u.pathname.replace('/shorts/', '');
      return { type: 'iframe', src: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`, portrait: true };
    }
    // ── Vimeo ───────────────────────────────────────────────────────────
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return { type: 'iframe', src: `https://player.vimeo.com/video/${id}?autoplay=1`, portrait: false };
    }
    // ── Instagram Reel ──────────────────────────────────────────────────
    if (u.hostname.includes('instagram.com') && (u.pathname.includes('/reel/') || u.pathname.includes('/reels/'))) {
      const reelId = u.pathname.split(/\/reels?\//)[1].replace(/\//g, '');
      return { type: 'iframe', src: `https://www.instagram.com/reel/${reelId}/embed/`, portrait: true };
    }
    // ── Instagram Post ──────────────────────────────────────────────────
    if (u.hostname.includes('instagram.com') && u.pathname.includes('/p/')) {
      const postId = u.pathname.split('/p/')[1].replace(/\//g, '');
      return { type: 'iframe', src: `https://www.instagram.com/p/${postId}/embed/`, portrait: false };
    }

    // Unknown — try as iframe
    return { type: 'iframe', src: url, portrait: false };
  } catch {
    return { type: 'iframe', src: url, portrait: false };
  }
}

const videoModal   = document.getElementById('videoModal');
const videoIframe  = document.getElementById('videoModalIframe');
const videoEl      = document.getElementById('videoModalVideo');
const videoSrc     = document.getElementById('videoModalSource');
const modalClose   = document.getElementById('videoModalClose');
const modalBackdrop= document.getElementById('videoModalBackdrop');

function openVideoModal(rawUrl) {
  const { type, src, portrait, mimeType } = detectVideo(rawUrl);

  if (type === 'video') {
    // Show <video>, hide iframe
    videoSrc.src  = src;
    videoSrc.type = mimeType || 'video/mp4';
    videoEl.load();           // reload source
    videoEl.style.display = 'block';
    videoIframe.style.display = 'none';
  } else {
    // Show iframe, hide <video>
    videoIframe.src = src;
    videoIframe.style.display = 'block';
    videoEl.style.display = 'none';
  }

  videoModal.classList.toggle('portrait-mode', portrait);
  videoModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
  videoModal.classList.remove('open', 'portrait-mode');

  // Stop iframe (clear src)
  videoIframe.src = '';
  videoIframe.style.display = 'block';

  // Stop video
  videoEl.pause();
  videoEl.currentTime = 0;
  videoSrc.src = '';
  videoEl.load();
  videoEl.style.display = 'none';

  document.body.style.overflow = '';
}

// ── Attach click to individual .video-trigger buttons ───────────────────
document.querySelectorAll('.video-trigger').forEach(trigger => {
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation(); // prevent double-fire if card is also listening
    const url = trigger.dataset.video;
    if (url) openVideoModal(url);
  });
});

// ── Make ENTIRE proj-card clickable (find the video URL inside it) ───────
document.querySelectorAll('.proj-card').forEach(card => {
  const trigger = card.querySelector('.video-trigger[data-video]');
  if (!trigger) return; // skip cards with no video

  const url = trigger.dataset.video;
  card.style.cursor = 'pointer';

  card.addEventListener('click', (e) => {
    // Don't double-open if they clicked the button itself (already handled above)
    if (e.target.closest('.video-trigger')) return;
    openVideoModal(url);
  });
});

// ── Make ENTIRE showcase image area clickable ────────────────────────────
document.querySelectorAll('.work-showcase').forEach(showcase => {
  const trigger = showcase.querySelector('.video-trigger[data-video]');
  if (!trigger) return;

  const url = trigger.dataset.video;

  // Make the whole image wrap clickable
  const imgWrap = showcase.querySelector('.showcase-img-wrap');
  if (imgWrap) {
    imgWrap.style.cursor = 'pointer';
    imgWrap.addEventListener('click', (e) => {
      if (e.target.closest('.video-trigger')) return;
      openVideoModal(url);
    });
  }
});

modalClose.addEventListener('click', closeVideoModal);
modalBackdrop.addEventListener('click', closeVideoModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && videoModal.classList.contains('open')) closeVideoModal();
});



// ----------------------------------------
// INIT LOG
// ----------------------------------------
console.log('%c✦ Ujjwal Shaw Portfolio', 'font-size:18px; font-family:serif; color:#c4a9f0;');
console.log('%cCrafted with cinematic precision.', 'font-size:12px; color:#6b6764;');

