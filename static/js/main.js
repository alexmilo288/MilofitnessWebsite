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
      phase: 'Chapter 01',
      title: 'The Skinny Kid',
      quote: '"I was embarrassed to take my shirt off. Something had to change."',
      body:  'At 17, Milo weighed just 60kg. Despite being active, he struggled to build any muscle and felt invisible in every room he walked into. Fed up with feeling weak, he walked into a gym for the first time with no plan — just a decision to never look the same again.',
      stats: [
        { val: '60<small>kg</small>', label: 'Start Weight'  },
        { val: '0',                   label: 'Gym Sessions'  },
        { val: 'Day 1',               label: 'The Decision'  },
      ],
    },
    {
      phase: 'Chapter 02',
      title: 'The Grind',
      quote: '"Two years in and people started asking me what I was doing. That was the moment I knew."',
      body:  'Between 2020 and 2022, Milo trained 5 days a week without exception. He studied nutrition, tracked everything, and began coaching friends for free. The discipline he built in those years became the foundation of every program he writes today.',
      stats: [
        { val: '82<small>kg</small>', label: 'Peak Weight'     },
        { val: '500+',                label: 'Sessions Logged'  },
        { val: '2021',                label: 'PT Certified'     },
      ],
    },
    {
      phase: 'Chapter 03',
      title: 'Stage Ready',
      quote: '"Standing on that stage, I realised — this is what I was always meant to do."',
      body:  "In 2023 Milo competed in his first NABBA bodybuilding competition. Months of peak-week nutrition, posing practice, and meticulous programming led to a top-5 finish in Men's Physique. The experience sharpened every method he now coaches his clients through.",
      stats: [
        { val: '..<small>kg</small>', label: 'Stage Weight'    },
        { val: '..<small>%</small>',   label: 'Body Fat'         },
        { val: '......',               label: '....'  },
      ],
    },
  ];

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
     UPDATE CHAPTER CARD
  ---------------------------------------------------------- */
  let currentChapter = -1;

  function updateChapterCard(idx) {
    if (idx === currentChapter) return;
    currentChapter = idx;

    const ch = chapters[idx];

    chapterCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    chapterCard.style.opacity    = '0';
    chapterCard.style.transform  = 'translateY(8px)';

    setTimeout(() => {
      cardPhase.textContent = ch.phase;
      cardTitle.textContent = ch.title;
      cardQuote.textContent = ch.quote;
      cardBody.textContent  = ch.body;
      cardStats.innerHTML   = ch.stats.map(s =>
        `<div class="cstat">
          <span class="cstat__val">${s.val}</span>
          <span class="cstat__label">${s.label}</span>
        </div>`
      ).join('');

      chapterCard.style.opacity   = '1';
      chapterCard.style.transform = 'translateY(0)';
    }, 200);
  }

  /* ----------------------------------------------------------
     UPDATE CHAPTER DOTS
  ---------------------------------------------------------- */
  function updateDots(idx) {
    chapterDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === idx);
    });
  }

  /* ----------------------------------------------------------
     MASTER UPDATE — called on every slider move
  ---------------------------------------------------------- */
  function updateAll(progress) {
    const t = progress / 100;

    /* Which chapter are we in */
    const activeChapter = t < 0.4 ? 0 : t < 0.75 ? 1 : 2;

    /* Update slider fill track */
    slider.style.backgroundSize = progress + '% 100%';

    /* Update all UI */
    updateDots(activeChapter);
    updateChapterCard(activeChapter);
    switchPhoto(activeChapter);
  }

  /* ----------------------------------------------------------
     SLIDER INPUT — single source of truth
  ---------------------------------------------------------- */
  slider.addEventListener('input', () => {
    updateAll(parseInt(slider.value, 10));
  });

  /* ----------------------------------------------------------
     CHAPTER DOT CLICKS — animated jump to target value
  ---------------------------------------------------------- */
  chapterDots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const target = i === 0 ? 0 : i === 1 ? 50 : 100;
      animateSliderTo(target);
    });
  });

  /* ----------------------------------------------------------
     THUMBNAIL CLICKS — jump to chapter
  ---------------------------------------------------------- */
  photoThumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const idx    = parseInt(thumb.dataset.thumb, 10);
      const target = idx === 0 ? 0 : idx === 1 ? 50 : 100;
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
      /* ease in-out quad */
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
     INIT — set everything to chapter 0 state
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
