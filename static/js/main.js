/* ============================================================
   MILOFITNESS — main.js
   ============================================================ */

// ---------- Navbar scroll effect ----------
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ---------- Mobile nav toggle ----------
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

// ---------- Testimonials slider ----------
const track  = document.getElementById('testimonialsTrack');
const dotsEl = document.getElementById('tDots');
const prevBtn = document.getElementById('tPrev');
const nextBtn = document.getElementById('tNext');

if (track) {
  const cards = track.querySelectorAll('.testimonial-card');
  let current = 0;

  // Build dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.classList.add('t-dot');
    dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function goTo(index) {
    current = (index + cards.length) % cards.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsEl.querySelectorAll('.t-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Auto-advance every 6 seconds
  setInterval(() => goTo(current + 1), 6000);
}

// ---------- Fade-in on scroll (intersection observer) ----------
const observerOptions = {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Add the CSS for the animation dynamically so it degrades gracefully
const style = document.createElement('style');
style.textContent = `
  .fade-up {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .fade-up.visible {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(style);

// Observe cards and key elements
document.querySelectorAll(
  '.program-card, .social-card, .stat-item, .testimonial-card, .about-teaser__text'
).forEach((el, i) => {
  el.classList.add('fade-up');
  el.style.transitionDelay = `${(i % 4) * 0.08}s`;
  observer.observe(el);
});

// ---------- Auto-dismiss flash messages ----------
document.querySelectorAll('.flash-msg').forEach(msg => {
  setTimeout(() => {
    msg.style.opacity = '0';
    msg.style.transition = 'opacity 0.4s ease';
    setTimeout(() => msg.remove(), 400);
  }, 4000);
});


// ============================================================
// CURSOR GLOW EFFECT - Premium Interaction
// ============================================================

// Create the main glow element
const cursorGlow = document.createElement('div');
cursorGlow.id = 'cursorGlow';
cursorGlow.style.cssText = `
  position: fixed;
  width: 400px;
  height: 400px;
  background: radial-gradient(
    circle, 
    rgba(10, 132, 255, 0.15) 0%,
    rgba(10, 132, 255, 0.08) 30%,
    transparent 70%
  );
  border-radius: 50%;
  pointer-events: none;
  z-index: 9998;
  transition: transform 0.08s ease-out, width 0.2s ease, height 0.2s ease;
  transform: translate(-50%, -50%);
  filter: blur(6px);
`;

// Create the center dot (optional but looks amazing)
const cursorDot = document.createElement('div');
cursorDot.id = 'cursorDot';
cursorDot.style.cssText = `
  position: fixed;
  width: 6px;
  height: 6px;
  background: #0a84ff;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transition: transform 0.05s ease-out, width 0.2s ease, height 0.2s ease;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 15px #0a84ff;
`;

// Add them to the page
document.body.appendChild(cursorGlow);
document.body.appendChild(cursorDot);

// Track mouse movement
let mouseX = 0, mouseY = 0;
let glowX = 0, glowY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  
  // Update cursor dot instantly
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top = mouseY + 'px';
  
  // Smooth follow for glow (creates a slight trailing effect)
  requestAnimationFrame(() => {
    glowX += (mouseX - glowX) * 0.15;
    glowY += (mouseY - glowY) * 0.15;
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';
  });
});

// Make glow react to hover on interactive elements
const interactiveElements = document.querySelectorAll('a, button, .btn, .program-card, .social-card, .nav-link');

interactiveElements.forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursorGlow.style.width = '500px';
    cursorGlow.style.height = '500px';
    cursorGlow.style.background = `radial-gradient(
      circle, 
      rgba(10, 132, 255, 0.25) 0%,
      rgba(10, 132, 255, 0.12) 30%,
      transparent 70%
    )`;
    cursorDot.style.width = '10px';
    cursorDot.style.height = '10px';
    cursorDot.style.boxShadow = '0 0 25px #0a84ff';
  });
  
  el.addEventListener('mouseleave', () => {
    cursorGlow.style.width = '400px';
    cursorGlow.style.height = '400px';
    cursorGlow.style.background = `radial-gradient(
      circle, 
      rgba(10, 132, 255, 0.15) 0%,
      rgba(10, 132, 255, 0.08) 30%,
      transparent 70%
    )`;
    cursorDot.style.width = '6px';
    cursorDot.style.height = '6px';
    cursorDot.style.boxShadow = '0 0 15px #0a84ff';
  });
});

// Hide cursor glow when leaving window (cleaner UX)
document.addEventListener('mouseleave', () => {
  cursorGlow.style.opacity = '0';
  cursorDot.style.opacity = '0';
});

document.addEventListener('mouseenter', () => {
  cursorGlow.style.opacity = '1';
  cursorDot.style.opacity = '1';
});