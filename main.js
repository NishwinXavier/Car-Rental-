import Lenis from 'lenis';

const BOOK_NOW_REDIRECT = 'book.html';

function redirectToBooking(button) {
  if (!button) return;

  const overlay = document.getElementById('page-transition-overlay');

  button.style.opacity = '0.9';
  button.style.transform = 'translateY(-1px) scale(0.98)';

  if (overlay) {
    overlay.classList.add('active');
  }

  setTimeout(() => {
    window.location.href = BOOK_NOW_REDIRECT;
  }, 180);
}

document.querySelectorAll('.btn-book').forEach((button) => {
  if (button.hasAttribute('onclick') || button.tagName === 'A') return;

  button.addEventListener('click', (event) => {
    event.preventDefault();
    redirectToBooking(button);
  });
});

const TOTAL_FRAMES = 300;
const frames = new Array(TOTAL_FRAMES);
let loadedFramesCount = 0;

const canvas = document.getElementById('animation-canvas');
const ctx = canvas.getContext('2d');
const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const loaderText = document.getElementById('loader-text');
const scrollHint = document.getElementById('scroll-hint');

let currentFrame = 0;
let targetFrame = 0;
let lastDrawnFrame = -1;
let isLoaderHidden = false;

// Format frame filename: ezgif-frame-001.jpg -> ezgif-frame-300.jpg
function getFrameUrl(index) {
  const paddedIndex = String(index).padStart(3, '0');
  return `/frames/ezgif-frame-${paddedIndex}.jpg`;
}

// Hide preloader smoothly
function hideLoader() {
  if (isLoaderHidden) return;
  isLoaderHidden = true;
  if (loader) {
    loader.classList.add('loaded');
  }
}

// Update preloader progress bar
function updateProgress() {
  const percent = Math.min(100, Math.floor((loadedFramesCount / TOTAL_FRAMES) * 100));
  if (loaderBar) loaderBar.style.width = `${percent}%`;
  if (loaderText) loaderText.textContent = `Loading ${percent}%`;
  
  if (percent >= 100) {
    hideLoader();
  }
}

// Load a single frame image
function loadFrame(i) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = getFrameUrl(i + 1); // 1-indexed filenames
    img.onload = () => {
      frames[i] = img;
      loadedFramesCount++;
      updateProgress();
      
      // Render first frame immediately as soon as frame 0 arrives
      if (i === 0 && lastDrawnFrame === -1) {
        resizeCanvas();
      }
      resolve(img);
    };
    img.onerror = () => {
      loadedFramesCount++;
      updateProgress();
      resolve(null);
    };
  });
}

// Batch preload frames in concurrent chunks to maximize network throughput
async function preloadFrames() {
  // First load Frame 0 (ezgif-frame-001.jpg) immediately
  await loadFrame(0);

  // Preload rest in chunks of 15 concurrent downloads
  const CHUNK_SIZE = 15;
  for (let i = 1; i < TOTAL_FRAMES; i += CHUNK_SIZE) {
    const batch = [];
    for (let j = i; j < Math.min(TOTAL_FRAMES, i + CHUNK_SIZE); j++) {
      batch.push(loadFrame(j));
    }
    await Promise.all(batch);
  }

  hideLoader();
}

// Canvas sizing
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
  renderFrame(Math.round(currentFrame));
}

// Find nearest loaded frame if current target is still downloading
function getBestAvailableFrame(index) {
  if (frames[index] && frames[index].complete && frames[index].naturalWidth > 0) {
    return frames[index];
  }
  // Search outwards for closest ready frame
  for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
    const prev = index - offset;
    if (prev >= 0 && frames[prev] && frames[prev].complete && frames[prev].naturalWidth > 0) {
      return frames[prev];
    }
    const next = index + offset;
    if (next < TOTAL_FRAMES && frames[next] && frames[next].complete && frames[next].naturalWidth > 0) {
      return frames[next];
    }
  }
  return null;
}

// Render image frame on canvas
function renderFrame(index) {
  const img = getBestAvailableFrame(index);

  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  // Always fill background first — prevents black flash on refresh
  ctx.fillStyle = '#100b0d';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  if (!img) return;

  // Calculate cover fit scale (full bleed edge-to-edge with no side/top black bars)
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth, drawHeight, drawX, drawY;

  if (canvasRatio > imgRatio) {
    drawWidth = canvasWidth;
    drawHeight = canvasWidth / imgRatio;
    drawX = 0;
    drawY = (canvasHeight - drawHeight) / 2;
  } else {
    drawHeight = canvasHeight;
    drawWidth = canvasHeight * imgRatio;
    drawX = (canvasWidth - drawWidth) / 2;
    drawY = 0;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}


// Calculate target frame index from scroll position
function updateTargetFrame() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  
  const scrollFraction = Math.max(0, Math.min(1, scrollTop / maxScroll));
  targetFrame = Math.min(TOTAL_FRAMES - 1, Math.floor(scrollFraction * TOTAL_FRAMES));

  // Toggle scroll hint visibility
  if (scrollTop > 30) {
    if (scrollHint) scrollHint.classList.add('hidden');
  } else {
    if (scrollHint) scrollHint.classList.remove('hidden');
  }
}

// Main animation loop (LERP interpolation)
function animate() {
  const diff = targetFrame - currentFrame;
  
  // Smooth factor
  currentFrame += diff * 0.15;

  const frameToDraw = Math.round(currentFrame);
  if (frameToDraw !== lastDrawnFrame) {
    renderFrame(frameToDraw);
    lastDrawnFrame = frameToDraw;
  }

  requestAnimationFrame(animate);
}

// Move the nav sliding indicator to the given link element
function moveIndicatorToLink(link) {
  const indicator = document.querySelector('.nav-indicator');
  const nav = document.querySelector('.nav-links');
  if (!indicator || !link || !nav) return;

  const navRect = nav.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();

  indicator.style.left = `${linkRect.left - navRect.left}px`;
  indicator.style.width = `${linkRect.width}px`;
  indicator.classList.add('visible');
}

// Setup active navigation links based on scroll position
function setupActiveLinks() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');
  const indicator = document.querySelector('.nav-indicator');

  let isClickScrolling = false;
  let clickTimeout = null;

  navLinks.forEach((link) => {
    // Position indicator on hover
    link.addEventListener('mouseenter', () => {
      moveIndicatorToLink(link);
    });

    // Handle click: instantly activate and move indicator, suppressing scroll observer jumps
    link.addEventListener('click', () => {
      isClickScrolling = true;
      if (clickTimeout) clearTimeout(clickTimeout);

      navLinks.forEach((l) => l.classList.remove('active'));
      link.classList.add('active');
      moveIndicatorToLink(link);

      clickTimeout = setTimeout(() => {
        isClickScrolling = false;
      }, 1000);
    });
  });

  // Restore indicator to active link on mouse leave
  const nav = document.querySelector('.nav-links');
  if (nav) {
    nav.addEventListener('mouseleave', () => {
      const activeLink = document.querySelector('.nav-link.active');
      if (activeLink) {
        moveIndicatorToLink(activeLink);
      } else {
        if (indicator) indicator.classList.remove('visible');
      }
    });
  }

  // Update active link + indicator on scroll (bypassed during link click scroll)
  const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    if (isClickScrolling) return;
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${entry.target.id}`) {
            link.classList.add('active');
            moveIndicatorToLink(link);
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    observer.observe(section);
  });

  // Set initial indicator position to Home
  requestAnimationFrame(() => {
    const homeLink = document.querySelector('.nav-link.active');
    if (homeLink) moveIndicatorToLink(homeLink);
  });
}

// Reposition indicator when window is resized
window.addEventListener('resize', () => {
  const activeLink = document.querySelector('.nav-link.active');
  if (activeLink) moveIndicatorToLink(activeLink);
});


// Application entrypoint
async function init() {
  // Safety timeout: ensure loader hides after max 2.5s even on slow connections
  setTimeout(() => {
    hideLoader();
  }, 2500);

  // Resize listener
  window.addEventListener('resize', resizeCanvas);

  // Scroll listeners
  window.addEventListener('scroll', updateTargetFrame, { passive: true });

  // Initialize active link observer
  setupActiveLinks();

  // Initialize Lenis smooth scroll
  try {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenis.on('scroll', () => {
      updateTargetFrame();
    });

    function lenisRaf(time) {
      lenis.raf(time);
      requestAnimationFrame(lenisRaf);
    }
    requestAnimationFrame(lenisRaf);
  } catch (err) {
    console.warn('Lenis scroll fallback:', err);
  }

  // Initial sizing & layout
  resizeCanvas();
  updateTargetFrame();

  // Paint dark background immediately so canvas is never black on refresh
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
  ctx.fillStyle = '#100b0d';
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  // Start animation loop
  requestAnimationFrame(animate);

  // Start preloading frames
  preloadFrames();
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
