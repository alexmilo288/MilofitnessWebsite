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
   FADE-IN ON SCROLL
---------------------------------------------------------- */
const fadeStyle = document.createElement('style');
fadeStyle.textContent = `
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
document.head.appendChild(fadeStyle);

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll(
  '.program-card, .social-card, .stat-item, .testimonial-card, .about-teaser__text'
).forEach((el, i) => {
  el.classList.add('fade-up');
  el.style.transitionDelay = `${(i % 4) * 0.08}s`;
  fadeObserver.observe(el);
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
let glowAnimating = false;

function animateGlow() {
  glowX += (mouseX - glowX) * 0.15;
  glowY += (mouseY - glowY) * 0.15;
  cursorGlow.style.left = glowX + 'px';
  cursorGlow.style.top  = glowY + 'px';
  glowAnimating = true;
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
   ABOUT / JOURNEY PAGE
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
      weight: 60, bf: 18,
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
      weight: 82, bf: 12,
    },
    {
      phase: 'Chapter 03',
      title: 'Stage Ready',
      quote: '"Standing on that stage, I realised — this is what I was always meant to do."',
      body:  "In 2023 Milo competed in his first NABBA bodybuilding competition. Months of peak-week nutrition, posing practice, and meticulous programming led to a top-5 finish in Men's Physique. The experience sharpened every method he now coaches his clients through.",
      stats: [
        { val: '78<small>kg</small>', label: 'Stage Weight'    },
        { val: '6<small>%</small>',   label: 'Body Fat'         },
        { val: 'Top 5',               label: 'NABBA Nationals'  },
      ],
      weight: 78, bf: 6,
    },
  ];

  /* ----------------------------------------------------------
     SILHOUETTE PHASE DATA
  ---------------------------------------------------------- */
  const phases = [
    { shoulderW: 72,  chestW: 64,  waistW: 52, hipW: 58, armW: 12, legW: 22, torsoH: 110, waistH: 40, legH: 150 },
    { shoulderW: 100, chestW: 92,  waistW: 58, hipW: 68, armW: 20, legW: 30, torsoH: 110, waistH: 40, legH: 150 },
    { shoulderW: 118, chestW: 105, waistW: 54, hipW: 70, armW: 24, legW: 34, torsoH: 110, waistH: 40, legH: 150 },
  ];

  /* ----------------------------------------------------------
     HELPERS
  ---------------------------------------------------------- */
  function lerp(a, b, t) { return a + (b - a) * t; }

  function lerpPhase(p1, p2, t) {
    const out = {};
    for (const key in p1) out[key] = lerp(p1[key], p2[key], t);
    return out;
  }

  function buildPoints(p) {
    const cx       = 150;
    const torsoTop = 100;
    const torsoBot = torsoTop + p.torsoH;
    const waistBot = torsoBot + p.waistH;
    const legBot   = waistBot + p.legH;
    const { shoulderW: sh, chestW: ch, waistW: wa, hipW: hi, armW: aw, legW: lw } = p;

    return {
      torso: [
        [cx - sh/2, torsoTop], [cx + sh/2, torsoTop],
        [cx + ch/2, torsoTop + 30], [cx + wa/2, torsoBot],
        [cx - wa/2, torsoBot], [cx - ch/2, torsoTop + 30],
      ],
      armL: [
        [cx - sh/2, torsoTop + 5], [cx - sh/2 - aw, torsoTop + 5],
        [cx - sh/2 - aw + 6, torsoBot - 10], [cx - wa/2, torsoBot - 10],
      ],
      armR: [
        [cx + sh/2, torsoTop + 5], [cx + sh/2 + aw, torsoTop + 5],
        [cx + sh/2 + aw - 6, torsoBot - 10], [cx + wa/2, torsoBot - 10],
      ],
      waist: [
        [cx - wa/2, torsoBot], [cx + wa/2, torsoBot],
        [cx + hi/2, waistBot], [cx - hi/2, waistBot],
      ],
      legL: [
        [cx - hi/2 + 4, waistBot], [cx - 4, waistBot],
        [cx - 4, legBot], [cx - hi/2 + 4 - (lw - 22), legBot],
      ],
      legR: [
        [cx + 4, waistBot], [cx + hi/2 - 4, waistBot],
        [cx + hi/2 - 4 + (lw - 22), legBot], [cx + 4, legBot],
      ],
    };
  }

  function pStr(arr) {
    return arr.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  }

  /* ----------------------------------------------------------
     DOM REFS
  ---------------------------------------------------------- */
  const phaseLabel   = document.getElementById('phase-label');
  const badgeWeight  = document.getElementById('badgeWeight');
  const badgeBf      = document.getElementById('badgeBf');
  const measureLines = document.getElementById('measure-lines');
  const svgEl        = document.getElementById('silhouetteSvg');
  const cardPhase    = document.getElementById('cardPhase');
  const cardTitle    = document.getElementById('cardTitle');
  const cardQuote    = document.getElementById('cardQuote');
  const cardBody     = document.getElementById('cardBody');
  const cardStats    = document.getElementById('chapterStats');
  const chapterDots  = document.querySelectorAll('.chapter-dot');
  const chapterCard  = document.querySelector('.chapter-card');

  const svgParts = {
    torso:  document.getElementById('s-torso'),
    torsoO: document.getElementById('s-torso-outline'),
    armL:   document.getElementById('s-arm-l'),
    armLO:  document.getElementById('s-arm-l-outline'),
    armR:   document.getElementById('s-arm-r'),
    armRO:  document.getElementById('s-arm-r-outline'),
    waist:  document.getElementById('s-waist'),
    waistO: document.getElementById('s-waist-outline'),
    legL:   document.getElementById('s-leg-l'),
    legLO:  document.getElementById('s-leg-l-outline'),
    legR:   document.getElementById('s-leg-r'),
    legRO:  document.getElementById('s-leg-r-outline'),
  };

  /* ----------------------------------------------------------
     UPDATE SILHOUETTE
  ---------------------------------------------------------- */
  function updateSilhouette(progress) {
    const t = progress / 100;

    const phaseIdx = t <= 0.5 ? 0 : 1;
    const localT   = t <= 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
    const p        = lerpPhase(phases[phaseIdx], phases[phaseIdx + 1], localT);
    const pts      = buildPoints(p);

    svgParts.torso.setAttribute('points',  pStr(pts.torso));
    svgParts.torsoO.setAttribute('points', pStr(pts.torso));
    svgParts.armL.setAttribute('points',   pStr(pts.armL));
    svgParts.armLO.setAttribute('points',  pStr(pts.armL));
    svgParts.armR.setAttribute('points',   pStr(pts.armR));
    svgParts.armRO.setAttribute('points',  pStr(pts.armR));
    svgParts.waist.setAttribute('points',  pStr(pts.waist));
    svgParts.waistO.setAttribute('points', pStr(pts.waist));
    svgParts.legL.setAttribute('points',   pStr(pts.legL));
    svgParts.legLO.setAttribute('points',  pStr(pts.legL));
    svgParts.legR.setAttribute('points',   pStr(pts.legR));
    svgParts.legRO.setAttribute('points',  pStr(pts.legR));

    phaseLabel.textContent = 'PHASE ' + (t < 0.33 ? 1 : t < 0.66 ? 2 : 3) + ' OF 3';
    measureLines.style.opacity = t > 0.85 ? ((t - 0.85) / 0.15).toFixed(2) : 0;
    svgEl.classList.toggle('phase-2', t > 0.66);

    badgeWeight.textContent = Math.round(lerp(chapters[0].weight, chapters[2].weight, t));
    badgeBf.textContent     = Math.round(lerp(chapters[0].bf,     chapters[2].bf,     t));

    const activeChapter = t < 0.4 ? 0 : t < 0.75 ? 1 : 2;
    chapterDots.forEach((dot, i) => dot.classList.toggle('active', i === activeChapter));
    updateChapterCard(activeChapter);

    slider.style.backgroundSize = progress + '% 100%';
  }

  /* ----------------------------------------------------------
     CHAPTER CARD SWAP
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
    }, 180);
  }

  /* ----------------------------------------------------------
     SLIDER INPUT
  ---------------------------------------------------------- */
  slider.addEventListener('input', () => {
    updateSilhouette(parseInt(slider.value, 10));
  });

  /* ----------------------------------------------------------
     CHAPTER DOT CLICKS — animated jump
  ---------------------------------------------------------- */
  chapterDots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      animateSlider(i === 0 ? 0 : i === 1 ? 50 : 100);
    });
  });

  function animateSlider(target) {
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
      updateSilhouette(val);
      if (prog < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ----------------------------------------------------------
     SCROLL-IN TIMELINE CARDS
  ---------------------------------------------------------- */
  const timelineCards = document.querySelectorAll('.timeline-card');

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
  updateSilhouette(0);

})();