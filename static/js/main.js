/* ============================================================
   MILOFITNESS — main.js
   ============================================================ */

/* ----------------------------------------------------------
   NAVBAR — scroll effect
---------------------------------------------------------- */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
}

/* ----------------------------------------------------------
   MOBILE NAV TOGGLE
---------------------------------------------------------- */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

/* ----------------------------------------------------------
   TESTIMONIALS SLIDER
---------------------------------------------------------- */
const track   = document.getElementById('testimonialsTrack');
const dotsEl  = document.getElementById('tDots');
const prevBtn = document.getElementById('tPrev');
const nextBtn = document.getElementById('tNext');

if (track && prevBtn && nextBtn) {
  const cards = track.querySelectorAll('.testimonial-card');
  let current = 0;

  dotsEl.textContent = `1 / ${cards.length}`;

  function goTo(index) {
    current = (index + cards.length) % cards.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsEl.textContent = `${current + 1} / ${cards.length}`;
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
  setInterval(() => goTo(current + 1), 6000);
}

/* ----------------------------------------------------------
   FADE-IN ON SCROLL (global — for home page cards etc.)
---------------------------------------------------------- */
const fadeObserverGlobal = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserverGlobal.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll(
  '.program-card, .social-card, .stat-item, .testimonial-card, .about-teaser__text'
).forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 0.08}s`;
  fadeObserverGlobal.observe(el);
});

/* ----------------------------------------------------------
   FADE-IN ON SCROLL (journey page sections)
---------------------------------------------------------- */
const fadeObserverSections = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserverSections.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.fade-up').forEach(el => {
  fadeObserverSections.observe(el);
});

/* ----------------------------------------------------------
   AUTO-DISMISS FLASH MESSAGES
---------------------------------------------------------- */
document.querySelectorAll('.flash-msg').forEach(msg => {
  setTimeout(() => {
    msg.style.opacity = '0';
    msg.style.transition = 'opacity 0.4s ease';
    setTimeout(() => msg.remove(), 400);
  }, 4000);
});

/* ----------------------------------------------------------
   CURSOR GLOW EFFECT
---------------------------------------------------------- */
const cursorGlow = document.createElement('div');
cursorGlow.id = 'cursorGlow';
cursorGlow.style.cssText = `
  position: fixed;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(10,132,255,0.15) 0%, rgba(10,132,255,0.08) 30%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9998;
  transition: width 0.2s ease, height 0.2s ease, opacity 0.3s ease;
  transform: translate(-50%, -50%);
  filter: blur(6px);
  left: -999px;
  top: -999px;
`;

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
  transform: translate(-50%, -50%);
  box-shadow: 0 0 15px #0a84ff;
  left: -999px;
  top: -999px;
`;

document.body.appendChild(cursorGlow);
document.body.appendChild(cursorDot);

let mouseX = 0, mouseY = 0;
let glowX = 0, glowY = 0;

function animateGlow() {
  glowX += (mouseX - glowX) * 0.15;
  glowY += (mouseY - glowY) * 0.15;
  cursorGlow.style.left = glowX + 'px';
  cursorGlow.style.top  = glowY + 'px';
  requestAnimationFrame(animateGlow);
}
animateGlow();

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';
});

document.querySelectorAll('a, button, .btn, .program-card, .social-card, .nav-link').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursorGlow.style.width  = '500px';
    cursorGlow.style.height = '500px';
    cursorGlow.style.background = `radial-gradient(circle, rgba(10,132,255,0.25) 0%, rgba(10,132,255,0.12) 30%, transparent 70%)`;
    cursorDot.style.width  = '10px';
    cursorDot.style.height = '10px';
    cursorDot.style.boxShadow = '0 0 25px #0a84ff';
  });
  el.addEventListener('mouseleave', () => {
    cursorGlow.style.width  = '400px';
    cursorGlow.style.height = '400px';
    cursorGlow.style.background = `radial-gradient(circle, rgba(10,132,255,0.15) 0%, rgba(10,132,255,0.08) 30%, transparent 70%)`;
    cursorDot.style.width  = '6px';
    cursorDot.style.height = '6px';
    cursorDot.style.boxShadow = '0 0 15px #0a84ff';
  });
});

document.addEventListener('mouseleave', () => {
  cursorGlow.style.opacity = '0';
  cursorDot.style.opacity  = '0';
});
document.addEventListener('mouseenter', () => {
  cursorGlow.style.opacity = '1';
  cursorDot.style.opacity  = '1';
});

/* ============================================================
   JOURNEY / ABOUT PAGE
   Only runs if the journey slider exists on this page
   ============================================================ */
(function initJourneyPage() {

  const slider = document.getElementById('journeySlider');
  if (!slider) return;

  /* ----------------------------------------------------------
     CHAPTER DATA
  ---------------------------------------------------------- */
  const chapters = [
    {
      phase: "Chapter 01",
      title: "The Skinny Kid",
      quote: "I just wanted to look big.",
      body: "2017. Alex was an anxious guy who didn't fill out any of his shirts. Finally, sick and tired of looking small, he stole his father's dumbbells and started working out in his garage.",
      stats: [
        { val: "58<small>kg</small>", label: "Body Weight" },
      ]
    },
    {
      phase: "Chapter 02",
      title: "First Steps",
      quote: "Walked into the gym and had no idea what I was doing.",
      body: "2019. Alex would spam pushups before a basketball game to look big, yet it was only until he won a gym membership in a competition at school, that he took the first steps towards his transformation. He was clueless, but he was in love with the process from day one.",
      stats: [
        { val: "60<small>kg</small>", label: "Body Weight" },

      ]
    },
    {
      phase: "Chapter 03",
      title: "The Grind",
      quote: "Three years in and I finally started to look like I lifted.",
      body: "2022. Diet dialled in. Training smarter. The compounding effect of consistency as Alex trained 5-6 days a week was finally showing up in the mirror. ",
      stats: [
        { val: "80<small>kg</small>", label: "Body Weight" },
      ]
    },
    {
      phase: "Chapter 04",
      title: "The Coach",
      quote: "If I could do this, I knew I could help others do it too.",
      body: "2023. Certified PT. 50+ clients transformed. What started as a personal obsession became a business built on real results.",
      stats: [
      ]
    },
    {
      phase: "Chapter 05",
      title: "The Stage",
      quote: "Every rep, every meal, every early morning — it all led here.",
      body: "2026. The culmination of 9 years of dedication. Stepped on stage for the first time and placed in Men's Physique. The skinny kid is gone.",
      stats: [
        { val: "89<small>kg</small>", label: "Stage Weight" },
      ]
    }
  ];

  const TOTAL = chapters.length - 1; // 4

  /* ----------------------------------------------------------
     DOM REFS
  ---------------------------------------------------------- */
  const cardPhase   = document.getElementById('cardPhase');
  const cardTitle   = document.getElementById('cardTitle');
  const cardQuote   = document.getElementById('cardQuote');
  const cardBody    = document.getElementById('cardBody');
  const cardStats   = document.getElementById('chapterStats');
  const chapterCard = document.getElementById('chapterCard');
  const chapterDots = document.querySelectorAll('.chapter-dot');
  const photoPhs    = document.querySelectorAll('.photo-ph');
  const photoThumbs = document.querySelectorAll('.photo-thumb');

  /* ----------------------------------------------------------
     SET SLIDER to 0–100 range internally for smooth fill
     but map to 5 chapters
  ---------------------------------------------------------- */
  slider.min  = '0';
  slider.max  = '100';
  slider.step = '1';
  slider.value = '0';

  /* ----------------------------------------------------------
     MAP 0–100 progress to chapter index 0–4
  ---------------------------------------------------------- */
  function progressToChapter(progress) {
    return Math.min(Math.floor(progress / (100 / chapters.length)), TOTAL);
  }

  /* ----------------------------------------------------------
     SWITCH PHOTO PANEL
  ---------------------------------------------------------- */
  function switchPhoto(idx) {
    photoPhs.forEach(ph => ph.classList.remove('active'));
    photoThumbs.forEach(t => t.classList.remove('active'));
    const ph    = document.querySelector(`.photo-ph[data-chapter="${idx}"]`);
    const thumb = document.querySelector(`.photo-thumb[data-thumb="${idx}"]`);
    if (ph)    ph.classList.add('active');
    if (thumb) thumb.classList.add('active');
  }

  /* ----------------------------------------------------------
     UPDATE CHAPTER CARD — fade transition on chapter change
  ---------------------------------------------------------- */
  let currentChapter = -1;

  function updateChapterCard(idx) {
    if (idx === currentChapter) return;
    currentChapter = idx;

    const ch = chapters[idx];

    chapterCard.style.opacity   = '0';
    chapterCard.style.transform = 'translateY(8px)';

    setTimeout(() => {
      cardPhase.textContent = ch.phase;
      cardTitle.textContent = ch.title;
      cardQuote.textContent = `"${ch.quote}"`;
      cardBody.textContent  = ch.body;
      cardStats.innerHTML   = ch.stats.map(s =>
        `<div class="cstat">
          <span class="cstat__val">${s.val}</span>
          <span class="cstat__label">${s.label}</span>
        </div>`
      ).join('');
      chapterCard.style.opacity   = '1';
      chapterCard.style.transform = 'translateY(0)';
    }, 220);
  }

  /* ----------------------------------------------------------
     UPDATE DOTS
  ---------------------------------------------------------- */
  function updateDots(idx) {
    chapterDots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
  }

  /* ----------------------------------------------------------
     MASTER UPDATE
  ---------------------------------------------------------- */
  function updateAll(progress) {
    const idx = progressToChapter(progress);
    slider.style.backgroundSize = progress + '% 100%';
    updateDots(idx);
    updateChapterCard(idx);
    switchPhoto(idx);
  }

  /* ----------------------------------------------------------
     SLIDER INPUT
  ---------------------------------------------------------- */
  slider.addEventListener('input', () => {
    updateAll(parseInt(slider.value, 10));
  });

  /* ----------------------------------------------------------
     CHAPTER DOT CLICKS — animate to correct progress value
  ---------------------------------------------------------- */
  chapterDots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      // Map chapter index back to a progress value at the centre of each band
      const target = Math.round((i / TOTAL) * 100);
      animateSliderTo(target);
    });
  });

  /* ----------------------------------------------------------
     THUMBNAIL CLICKS
  ---------------------------------------------------------- */
  photoThumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const idx    = parseInt(thumb.dataset.thumb, 10);
      const target = Math.round((idx / TOTAL) * 100);
      animateSliderTo(target);
    });
  });

  /* ----------------------------------------------------------
     ANIMATED SLIDER JUMP
  ---------------------------------------------------------- */
  function animateSliderTo(target) {
    const start   = parseInt(slider.value, 10);
    const diff    = target - start;
    const dur     = 600;
    const startTs = performance.now();

    function step(ts) {
      const elapsed = ts - startTs;
      const prog    = Math.min(elapsed / dur, 1);
      const ease    = prog < 0.5 ? 2 * prog * prog : -1 + (4 - 2 * prog) * prog;
      const val     = Math.round(start + diff * ease);
      slider.value  = val;
      updateAll(val);
      if (prog < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ----------------------------------------------------------
     SCROLL-IN TIMELINE CARDS
  ---------------------------------------------------------- */
  const timelineCards    = document.querySelectorAll('.timeline-card');
  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        timelineObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  timelineCards.forEach(card => timelineObserver.observe(card));

  /* ----------------------------------------------------------
     INIT
  ---------------------------------------------------------- */
  updateAll(0);

})();


document.addEventListener('DOMContentLoaded', function () {
  const emailInput    = document.getElementById('email');
  const emailHint     = document.getElementById('emailHint');
  const passwordInput = document.getElementById('password');
  const checklist      = document.getElementById('pwChecklist');
  const usernameInput  = document.getElementById('username');
  const form           = document.getElementById('signupForm');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const rules = {
    length:  pw => pw.length >= 8,
    upper:   pw => /[A-Z]/.test(pw),
    lower:   pw => /[a-z]/.test(pw),
    number:  pw => /[0-9]/.test(pw),
    special: pw => /[!@#$%^&*(),.?":{}|<>]/.test(pw)
  };

  function validatePassword() {
    const pw = passwordInput.value;
    let allValid = true;

    Object.keys(rules).forEach(function (key) {
      const li = checklist.querySelector('[data-rule="' + key + '"]');
      const passed = rules[key](pw);
      li.classList.toggle('pw-checklist__item--valid', passed);
      if (!passed) allValid = false;
    });

    return allValid;
  }

  function validateEmail() {
    const value = emailInput.value.trim();
    const valid = emailRegex.test(value);

    emailHint.classList.remove('field-hint--valid', 'field-hint--invalid');

    if (value.length === 0) {
      emailHint.textContent = 'Must be a valid email address';
    } else if (valid) {
      emailHint.textContent = 'Looks good';
      emailHint.classList.add('field-hint--valid');
    } else {
      emailHint.textContent = 'Enter a valid email address (e.g. name@example.com)';
      emailHint.classList.add('field-hint--invalid');
    }

    return valid;
  }

  passwordInput.addEventListener('input', validatePassword);
  emailInput.addEventListener('input', validateEmail);

  form.addEventListener('submit', function (e) {
    const pwValid = validatePassword();
    const emailValid = validateEmail();
    const usernameValid = usernameInput.value.trim().length >= 3;

    if (!pwValid || !emailValid || !usernameValid) {
      e.preventDefault();
    }
  });
});


document.querySelectorAll('.password-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    const eyeIcon = btn.querySelector('.icon-eye');
    const eyeOffIcon = btn.querySelector('.icon-eye-off');

    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    eyeIcon.style.display = isHidden ? 'none' : 'block';
    eyeOffIcon.style.display = isHidden ? 'block' : 'none';
    btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
  });
});
document.querySelectorAll('.account-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.account-tab').forEach(t => t.classList.remove('account-tab--active'));
    tab.classList.add('account-tab--active');

    const target = tab.dataset.tab;
    document.querySelectorAll('.account-form').forEach(form => {
      form.style.display = form.dataset.form === target ? 'block' : 'none';
    });
  });
});