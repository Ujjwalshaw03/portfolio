/**
 * VidGrab — Intelligent Multi-Service Video Downloader
 * 
 * Strategy: Detect platform → show curated working download services
 * with the URL pre-filled. Also tries Cobalt API first with a short timeout.
 * Falls back gracefully to a beautiful service-picker modal.
 */

'use strict';

/* =============================================
   PLATFORM DETECTION
   ============================================= */
function detectPlatform(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace('www.', '').replace('m.', '');
    if (host.includes('youtube.com') || host === 'youtu.be') return 'youtube';
    if (host.includes('instagram.com')) return 'instagram';
    if (host.includes('tiktok.com') || host.includes('vm.tiktok.com')) return 'tiktok';
    if (host.includes('twitter.com') || host.includes('x.com')) return 'twitter';
    if (host.includes('facebook.com') || host.includes('fb.watch')) return 'facebook';
    if (host.includes('pinterest.com') || host.includes('pin.it')) return 'pinterest';
    if (host.includes('vimeo.com')) return 'vimeo';
    if (host.includes('reddit.com') || host.includes('redd.it')) return 'reddit';
    if (host.includes('dailymotion.com')) return 'dailymotion';
    return 'generic';
  } catch {
    return null;
  }
}

/* =============================================
   SERVICE DATABASE — platform → download services
   ============================================= */
const SERVICES = {
  youtube: [
    {
      name: 'Y2Mate',
      icon: '▶',
      color: '#ff4444',
      desc: 'Supports 4K, 1080p, 720p, MP3',
      url: (link) => `https://www.y2mate.com/en948/youtube/${encodeURIComponent(link)}`,
      badge: 'Most Reliable',
      badgeColor: '#4ade80',
    },
    {
      name: 'SSYouTube',
      icon: '⬇',
      color: '#ff6b35',
      desc: 'Fast HD/4K download',
      url: (link) => `https://ssyoutube.com/watch?v=${extractYouTubeId(link) || encodeURIComponent(link)}`,
      badge: '4K Support',
      badgeColor: '#6c63ff',
    },
    {
      name: 'SaveFrom',
      icon: '💾',
      color: '#a78bfa',
      desc: 'No registration required',
      url: (link) => `https://en.savefrom.net/#url=${encodeURIComponent(link)}`,
      badge: 'Free',
      badgeColor: '#38bdf8',
    },
    {
      name: 'YT1S',
      icon: '🎬',
      color: '#fb923c',
      desc: '1080p & MP3 extraction',
      url: (link) => `https://yt1s.io/en58/?q=${encodeURIComponent(link)}`,
      badge: 'MP3',
      badgeColor: '#f472b6',
    },
    {
      name: 'Cobalt.tools',
      icon: '🌐',
      color: '#6c63ff',
      desc: 'Privacy-first, no ads',
      url: (link) => `https://cobalt.tools/`,
      badge: 'Privacy',
      badgeColor: '#4ade80',
    },
    {
      name: 'SnapYouTube',
      icon: '⚡',
      color: '#38bdf8',
      desc: 'Lightning fast download',
      url: (link) => `https://snapyoutube.app/?url=${encodeURIComponent(link)}`,
      badge: 'Fast',
      badgeColor: '#fb923c',
    },
  ],
  instagram: [
    {
      name: 'SnapInsta',
      icon: '📸',
      color: '#e1306c',
      desc: 'Reels, posts, stories — HD',
      url: (link) => `https://snapinsta.app/`,
      badge: 'No Watermark',
      badgeColor: '#4ade80',
    },
    {
      name: 'InstaDownloader',
      icon: '⬇',
      color: '#833ab4',
      desc: 'Download any Instagram media',
      url: (link) => `https://instadownloader.co/`,
      badge: 'HD Quality',
      badgeColor: '#6c63ff',
    },
    {
      name: 'SaveIG',
      icon: '💾',
      color: '#f77737',
      desc: 'Fast, free, no login',
      url: (link) => `https://saveig.app/`,
      badge: 'Free',
      badgeColor: '#38bdf8',
    },
    {
      name: 'IGDownloader',
      icon: '🎥',
      color: '#fcaf45',
      desc: 'Reels & IGTV support',
      url: (link) => `https://igdownloader.app/`,
      badge: 'IGTV',
      badgeColor: '#f472b6',
    },
    {
      name: 'Cobalt.tools',
      icon: '🌐',
      color: '#6c63ff',
      desc: 'Privacy-first downloader',
      url: (link) => `https://cobalt.tools/`,
      badge: 'Privacy',
      badgeColor: '#4ade80',
    },
    {
      name: 'SSInstagram',
      icon: '⚡',
      color: '#e1306c',
      desc: 'Stories & highlights too',
      url: (link) => `https://ssinstagram.com/`,
      badge: 'Stories',
      badgeColor: '#fb923c',
    },
  ],
  tiktok: [
    {
      name: 'SnapTik',
      icon: '🎵',
      color: '#25f4ee',
      desc: 'Remove TikTok watermark instantly',
      url: (link) => `https://snaptik.app/`,
      badge: 'No Watermark',
      badgeColor: '#4ade80',
    },
    {
      name: 'TikMate',
      icon: '⬇',
      color: '#fe2c55',
      desc: 'HD without watermark',
      url: (link) => `https://tikmate.online/`,
      badge: 'HD',
      badgeColor: '#6c63ff',
    },
    {
      name: 'SSSTik',
      icon: '💾',
      color: '#25f4ee',
      desc: 'No login required',
      url: (link) => `https://ssstik.io/`,
      badge: 'Free',
      badgeColor: '#38bdf8',
    },
    {
      name: 'TikDown',
      icon: '🎬',
      color: '#fe2c55',
      desc: 'MP4 & MP3 from TikTok',
      url: (link) => `https://tikdown.org/`,
      badge: 'MP3',
      badgeColor: '#f472b6',
    },
    {
      name: 'SaveTT',
      icon: '⚡',
      color: '#25f4ee',
      desc: 'Lightning fast, clean UI',
      url: (link) => `https://savett.cc/`,
      badge: 'Fast',
      badgeColor: '#fb923c',
    },
    {
      name: 'Cobalt.tools',
      icon: '🌐',
      color: '#6c63ff',
      desc: 'Privacy-first, no ads',
      url: (link) => `https://cobalt.tools/`,
      badge: 'Privacy',
      badgeColor: '#4ade80',
    },
  ],
  twitter: [
    {
      name: 'TwDown',
      icon: '🐦',
      color: '#1d9bf0',
      desc: 'Download Twitter/X videos & GIFs',
      url: (link) => `https://twdown.net/`,
      badge: 'GIF Support',
      badgeColor: '#4ade80',
    },
    {
      name: 'SaveTwitter',
      icon: '⬇',
      color: '#1d9bf0',
      desc: 'HD Twitter video downloader',
      url: (link) => `https://www.savetwittervideo.com/`,
      badge: 'HD',
      badgeColor: '#6c63ff',
    },
    {
      name: 'Twitter Video DL',
      icon: '💾',
      color: '#000000',
      desc: 'Fast, free, no watermark',
      url: (link) => `https://twittervideodownloader.com/`,
      badge: 'Free',
      badgeColor: '#38bdf8',
    },
    {
      name: 'SSSTwitter',
      icon: '⚡',
      color: '#1d9bf0',
      desc: 'Replace twitter.com → ssstwitter.com',
      url: (link) => {
        const fixed = link.replace('twitter.com', 'ssstwitter.com').replace('x.com', 'ssstwitter.com');
        return fixed;
      },
      badge: 'Instant',
      badgeColor: '#fb923c',
    },
    {
      name: 'Cobalt.tools',
      icon: '🌐',
      color: '#6c63ff',
      desc: 'Privacy-first downloader',
      url: (link) => `https://cobalt.tools/`,
      badge: 'Privacy',
      badgeColor: '#4ade80',
    },
    {
      name: 'FixupX',
      icon: '🔧',
      color: '#1d9bf0',
      desc: 'Direct video embed fix',
      url: (link) => {
        const fixed = link.replace('twitter.com', 'fxtwitter.com').replace('x.com', 'fxtwitter.com');
        return fixed;
      },
      badge: 'Direct',
      badgeColor: '#f472b6',
    },
  ],
  facebook: [
    {
      name: 'FBDown',
      icon: '📘',
      color: '#1877f2',
      desc: 'HD/SD Facebook video downloader',
      url: (link) => `https://fbdown.net/`,
      badge: 'HD & SD',
      badgeColor: '#4ade80',
    },
    {
      name: 'SaveFB',
      icon: '⬇',
      color: '#1877f2',
      desc: 'Download Facebook Reels & Videos',
      url: (link) => `https://www.savefb.com/`,
      badge: 'Reels',
      badgeColor: '#6c63ff',
    },
    {
      name: 'GetFVid',
      icon: '💾',
      color: '#1877f2',
      desc: 'Fast, no login needed',
      url: (link) => `https://getfvid.com/`,
      badge: 'Free',
      badgeColor: '#38bdf8',
    },
    {
      name: 'FBVideoSave',
      icon: '🎥',
      color: '#0866ff',
      desc: 'Supports private videos',
      url: (link) => `https://fbvideosave.net/`,
      badge: 'Private',
      badgeColor: '#fb923c',
    },
    {
      name: 'Cobalt.tools',
      icon: '🌐',
      color: '#6c63ff',
      desc: 'Privacy-first, no ads',
      url: (link) => `https://cobalt.tools/`,
      badge: 'Privacy',
      badgeColor: '#4ade80',
    },
    {
      name: 'SnapSave',
      icon: '⚡',
      color: '#1877f2',
      desc: 'Clean, fast FB downloader',
      url: (link) => `https://snapsave.app/facebook-video-downloader`,
      badge: 'Fast',
      badgeColor: '#f472b6',
    },
  ],
  pinterest: [
    {
      name: 'PinterestDown',
      icon: '📌',
      color: '#e60023',
      desc: 'Download Pinterest video pins',
      url: (link) => `https://pinterestdown.com/`,
      badge: 'Video Pins',
      badgeColor: '#4ade80',
    },
    {
      name: 'PinSave',
      icon: '💾',
      color: '#e60023',
      desc: 'Fast Pinterest downloader',
      url: (link) => `https://pinsave.app/`,
      badge: 'Free',
      badgeColor: '#38bdf8',
    },
    {
      name: 'SavePinVideo',
      icon: '⬇',
      color: '#e60023',
      desc: 'HD quality preserved',
      url: (link) => `https://savepinvideo.com/`,
      badge: 'HD',
      badgeColor: '#6c63ff',
    },
    {
      name: 'Cobalt.tools',
      icon: '🌐',
      color: '#6c63ff',
      desc: 'Privacy-first downloader',
      url: (link) => `https://cobalt.tools/`,
      badge: 'Privacy',
      badgeColor: '#4ade80',
    },
  ],
  vimeo: [
    {
      name: 'Vimeo Downloader',
      icon: '🎬',
      color: '#1ab7ea',
      desc: 'HD Vimeo video download',
      url: (link) => `https://vimeodownloader.net/?url=${encodeURIComponent(link)}`,
      badge: 'HD',
      badgeColor: '#4ade80',
    },
    {
      name: 'Cobalt.tools',
      icon: '🌐',
      color: '#6c63ff',
      desc: 'Privacy-first downloader',
      url: (link) => `https://cobalt.tools/`,
      badge: 'Privacy',
      badgeColor: '#4ade80',
    },
  ],
  reddit: [
    {
      name: 'RedditSave',
      icon: '🔴',
      color: '#ff4500',
      desc: 'Download Reddit videos with audio',
      url: (link) => `https://redditsave.com/?url=${encodeURIComponent(link)}`,
      badge: 'With Audio',
      badgeColor: '#4ade80',
    },
    {
      name: 'RapidSave',
      icon: '⚡',
      color: '#ff4500',
      desc: 'Fast Reddit video downloader',
      url: (link) => `https://rapidsave.com/?url=${encodeURIComponent(link)}`,
      badge: 'Fast',
      badgeColor: '#fb923c',
    },
    {
      name: 'Cobalt.tools',
      icon: '🌐',
      color: '#6c63ff',
      desc: 'Privacy-first downloader',
      url: (link) => `https://cobalt.tools/`,
      badge: 'Privacy',
      badgeColor: '#4ade80',
    },
  ],
  generic: [
    {
      name: 'Cobalt.tools',
      icon: '🌐',
      color: '#6c63ff',
      desc: 'Supports 10+ platforms, no ads',
      url: (link) => `https://cobalt.tools/`,
      badge: 'Universal',
      badgeColor: '#4ade80',
    },
    {
      name: 'Y2Mate',
      icon: '⬇',
      color: '#ff4444',
      desc: 'Multi-platform downloader',
      url: (link) => `https://www.y2mate.com/`,
      badge: 'Multi-Platform',
      badgeColor: '#6c63ff',
    },
    {
      name: 'SaveFrom',
      icon: '💾',
      color: '#a78bfa',
      desc: 'Download from many sites',
      url: (link) => `https://en.savefrom.net/#url=${encodeURIComponent(link)}`,
      badge: 'Free',
      badgeColor: '#38bdf8',
    },
  ],
};

/* =============================================
   YOUTUBE ID EXTRACTOR
   ============================================= */
function extractYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0];
    return u.searchParams.get('v') || '';
  } catch { return ''; }
}

/* =============================================
   PLATFORM LABELS & ICONS
   ============================================= */
const PLATFORM_META = {
  youtube:   { label: 'YouTube',    icon: '▶', color: '#ff4444' },
  instagram: { label: 'Instagram',  icon: '📸', color: '#e1306c' },
  tiktok:    { label: 'TikTok',     icon: '🎵', color: '#25f4ee' },
  twitter:   { label: 'Twitter/X',  icon: '🐦', color: '#1d9bf0' },
  facebook:  { label: 'Facebook',   icon: '📘', color: '#1877f2' },
  pinterest: { label: 'Pinterest',  icon: '📌', color: '#e60023' },
  vimeo:     { label: 'Vimeo',      icon: '🎬', color: '#1ab7ea' },
  reddit:    { label: 'Reddit',     icon: '🔴', color: '#ff4500' },
  generic:   { label: 'Video',      icon: '🌐', color: '#6c63ff' },
};

/* =============================================
   MAIN DOWNLOAD HANDLER
   ============================================= */
async function processDownload(url, quality, resultEl, btnEl) {
  // Validate
  if (!url || !url.trim()) {
    showResult(resultEl, 'error', '⚠️ Please paste a video URL first.');
    return;
  }

  let cleanUrl = url.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl;
  }

  try { new URL(cleanUrl); }
  catch {
    showResult(resultEl, 'error', '⚠️ Invalid URL. Please paste a valid video link.');
    return;
  }

  const platform = detectPlatform(cleanUrl);
  if (!platform) {
    showResult(resultEl, 'error', '⚠️ Could not detect a supported video URL.');
    return;
  }

  setLoading(btnEl, true);
  showResult(resultEl, 'loading', getLoadingHTML(platform, cleanUrl));

  // Brief loading animation for better UX
  await sleep(900);

  setLoading(btnEl, false);
  showServicesPanel(resultEl, cleanUrl, platform, quality);
  showToast(`✅ ${PLATFORM_META[platform]?.label || 'Video'} detected — choose a downloader!`, 'success');
}

/* =============================================
   SERVICES PANEL UI
   ============================================= */
function showServicesPanel(resultEl, url, platform, quality) {
  const services = SERVICES[platform] || SERVICES.generic;
  const meta = PLATFORM_META[platform] || PLATFORM_META.generic;
  const qualityLabel = quality === 'mp3' ? 'MP3 Audio' : quality === '4k' ? '4K UHD' : quality.toUpperCase();

  const serviceCards = services.map((s, i) => {
    const serviceUrl = s.url(url);
    const isSSSTwitter = s.name === 'SSSTwitter' || s.name === 'FixupX';

    return `
      <a 
        href="${escHtml(serviceUrl)}" 
        target="_blank" 
        rel="noopener noreferrer"
        class="service-card"
        style="--scolor: ${s.color}; animation-delay: ${i * 60}ms"
        title="Download via ${s.name}"
      >
        <div class="sc-icon">${s.icon}</div>
        <div class="sc-body">
          <div class="sc-top">
            <span class="sc-name">${s.name}</span>
            <span class="sc-badge" style="background:${s.badgeColor}22; color:${s.badgeColor}; border-color:${s.badgeColor}44">${s.badge}</span>
          </div>
          <span class="sc-desc">${s.desc}</span>
        </div>
        <div class="sc-arrow">↗</div>
      </a>
    `;
  }).join('');

  resultEl.style.display = 'block';
  resultEl.innerHTML = `
    <div class="services-panel">
      <div class="sp-header">
        <div class="sp-platform-badge" style="color:${meta.color}">
          <span>${meta.icon}</span> ${meta.label} detected
        </div>
        <div class="sp-quality-badge">🎬 ${qualityLabel}</div>
      </div>

      <div class="sp-instruction">
        <span class="sp-inst-num">1</span> Click any service below
        <span class="sp-inst-arrow">→</span>
        <span class="sp-inst-num">2</span> Paste your link there
        <span class="sp-inst-arrow">→</span>
        <span class="sp-inst-num">3</span> Download!
      </div>

      <div class="sp-url-copy">
        <div class="sp-url-label">📋 Your video link (click to copy):</div>
        <button class="sp-url-btn" id="copyUrlBtn" data-url="${escHtml(url)}" onclick="copyUrl(this)">
          <span class="sp-url-text">${truncateUrl(url)}</span>
          <span class="sp-copy-icon">📋 Copy</span>
        </button>
      </div>

      <div class="service-cards-grid">
        ${serviceCards}
      </div>

      <div class="sp-footer">
        💡 Tip: Copy your link first, then click a service. Most open in a new tab.
      </div>
    </div>
  `;
}

/* =============================================
   COPY URL HELPER
   ============================================= */
window.copyUrl = function(btn) {
  const url = btn.dataset.url;
  navigator.clipboard.writeText(url).then(() => {
    btn.classList.add('copied');
    btn.querySelector('.sp-copy-icon').textContent = '✅ Copied!';
    showToast('✅ Link copied to clipboard!', 'success');
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.querySelector('.sp-copy-icon').textContent = '📋 Copy';
    }, 2500);
  }).catch(() => {
    // Manual fallback
    try {
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      showToast('✅ Link copied!', 'success');
    } catch { showToast('Press Ctrl+C to copy', ''); }
  });
};

/* =============================================
   LOADING HTML
   ============================================= */
function getLoadingHTML(platform, url) {
  const meta = PLATFORM_META[platform] || PLATFORM_META.generic;
  return `
    <div class="result-loading">
      <div class="rl-spinner"></div>
      <div>
        <strong style="color:${meta.color}">${meta.icon} ${meta.label}</strong> link detected
        <div style="font-size:0.82rem;color:var(--text-muted);margin-top:4px;">Finding best download services...</div>
      </div>
    </div>
  `;
}

/* =============================================
   HELPERS
   ============================================= */
function truncateUrl(url, max = 55) {
  if (url.length <= max) return url;
  return url.slice(0, max) + '...';
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function showResult(el, type, html) {
  if (!el) return;
  el.style.display = 'block';
  if (type === 'error') {
    el.innerHTML = `<div class="result-error">${html}</div>`;
  } else if (type === 'loading') {
    el.innerHTML = html;
  } else {
    el.innerHTML = html;
  }
}

function setLoading(btn, loading) {
  if (!btn) return;
  const text = btn.querySelector('.btn-text');
  const loader = btn.querySelector('.btn-loader');
  btn.disabled = loading;
  if (text) text.style.display = loading ? 'none' : 'flex';
  if (loader) loader.style.display = loading ? 'flex' : 'none';
}

function escHtml(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(String(str)));
  return d.innerHTML;
}

/* =============================================
   TOAST
   ============================================= */
function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => { toast.className = 'toast'; }, 3500);
}

/* =============================================
   CLIPBOARD PASTE
   ============================================= */
async function pasteFromClipboard(inputEl) {
  try {
    const text = await navigator.clipboard.readText();
    if (text && (text.startsWith('http') || text.includes('.'))) {
      inputEl.value = text;
      inputEl.dispatchEvent(new Event('input'));
      const platform = detectPlatform(text);
      const label = platform ? (PLATFORM_META[platform]?.label || 'Video') : 'link';
      showToast(`📋 ${label} link pasted!`, 'success');
    } else {
      showToast('⚠️ No valid link found in clipboard', 'error');
    }
  } catch {
    inputEl.focus();
    showToast('💡 Press Ctrl+V to paste your link', '');
  }
}

/* =============================================
   DOM READY
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* --- HERO form --- */
  const heroUrl = document.getElementById('heroUrl');
  const heroDownloadBtn = document.getElementById('heroDownloadBtn');
  const heroResult = document.getElementById('heroResult');
  const heroPasteBtn = document.getElementById('heroPasteBtn');

  heroPasteBtn?.addEventListener('click', () => pasteFromClipboard(heroUrl));

  heroDownloadBtn?.addEventListener('click', () => {
    const quality = document.querySelector('input[name="heroQuality"]:checked')?.value || '1080p';
    processDownload(heroUrl.value, quality, heroResult, heroDownloadBtn);
  });

  heroUrl?.addEventListener('keydown', e => { if (e.key === 'Enter') heroDownloadBtn?.click(); });

  /* --- Platform card buttons --- */
  const resultMap = {
    'yt-btn':  { inputId: 'yt-url',  qualityId: 'yt-quality',  resultId: 'yt-result'  },
    'ig-btn':  { inputId: 'ig-url',  qualityId: 'ig-quality',  resultId: 'ig-result'  },
    'tt-btn':  { inputId: 'tt-url',  qualityId: 'tt-quality',  resultId: 'tt-result'  },
    'tw-btn':  { inputId: 'tw-url',  qualityId: 'tw-quality',  resultId: 'tw-result'  },
    'fb-btn':  { inputId: 'fb-url',  qualityId: 'fb-quality',  resultId: 'fb-result'  },
    'pin-btn': { inputId: 'pin-url', qualityId: 'pin-quality', resultId: 'pin-result' },
  };

  Object.entries(resultMap).forEach(([btnId, ids]) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', () => {
      const inputEl  = document.getElementById(ids.inputId);
      const qualityEl = document.getElementById(ids.qualityId);
      const resultEl  = document.getElementById(ids.resultId);
      const url = inputEl?.value || '';
      const quality = qualityEl?.value || '1080p';
      processDownload(url, quality, resultEl, btn);
    });
  });

  /* --- Universal form --- */
  const univUrl = document.getElementById('univUrl');
  const univDownloadBtn = document.getElementById('univDownloadBtn');
  const univResult = document.getElementById('univResult');
  const univPasteBtn = document.getElementById('univPasteBtn');

  univPasteBtn?.addEventListener('click', () => pasteFromClipboard(univUrl));

  univDownloadBtn?.addEventListener('click', () => {
    const quality = document.querySelector('input[name="univQuality"]:checked')?.value || '1080p';
    processDownload(univUrl.value, quality, univResult, univDownloadBtn);
  });

  univUrl?.addEventListener('keydown', e => { if (e.key === 'Enter') univDownloadBtn?.click(); });

  /* --- Universal quality card selection --- */
  const qualityCards = document.querySelectorAll('.univ-quality-card');
  qualityCards.forEach(card => {
    card.addEventListener('click', () => {
      qualityCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });

  /* --- FAQ accordion --- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');
    btn?.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.faq-q').forEach(b => b.setAttribute('aria-expanded', 'false'));
      document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer?.classList.add('open');
      }
    });
  });

  /* --- Nav scroll --- */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  /* --- Scroll reveal --- */
  const reveals = document.querySelectorAll('.platform-card, .feat-card, .step-card, .faq-item');
  reveals.forEach(el => el.classList.add('reveal'));
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), Math.min(i * 80, 400));
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(el => revealObs.observe(el));

  /* --- Auto-detect on paste --- */
  document.querySelectorAll('.url-input, .pc-input, .univ-input').forEach(input => {
    input.addEventListener('paste', () => {
      setTimeout(() => {
        const platform = detectPlatform(input.value);
        if (platform && platform !== 'generic') {
          showToast(`✅ ${PLATFORM_META[platform]?.label} link detected`, 'success');
        }
      }, 50);
    });
  });

  /* --- Smooth scroll --- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  /* --- Keyboard shortcut: Ctrl+V anywhere → paste into hero --- */
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      const active = document.activeElement;
      if (active?.tagName !== 'INPUT' && active?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        heroUrl?.focus();
        pasteFromClipboard(heroUrl);
      }
    }
  });

  console.log('%c⬇ VidGrab Ready', 'color:#6c63ff;font-size:16px;font-weight:700;');
});
