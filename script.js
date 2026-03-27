/* ═══════════════════════════════════════════════════════
   SUNRISE MULTI SPECIALITY DENTAL CLINIC
   Interactive JavaScript
═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── LUCIDE ICONS ─────────────────────────────────── */
  if (typeof lucide !== 'undefined') lucide.createIcons();

  /* ─── LOADER ───────────────────────────────────────── */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hide');
      // Re-init icons after load
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 900);
  });

  /* ─── NAVBAR SCROLL ────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  const handleNavScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', handleNavScroll, { passive: true });

  /* ─── MOBILE MENU ──────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  /* ─── SMOOTH SCROLL (offset for sticky nav) ────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 80;
      const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  /* ─── SCROLL REVEAL ────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ─── ACTIVE NAV LINK (scroll spy) ────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navAnchorLinks = document.querySelectorAll('.nav-link');

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navAnchorLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-50% 0px -45% 0px' });

  sections.forEach(s => spyObserver.observe(s));

  // Style active nav links
  const style = document.createElement('style');
  style.textContent = `.nav-link.active { color: var(--blue-600); background: var(--blue-50); }`;
  document.head.appendChild(style);

  /* ─── TESTIMONIAL SLIDER ───────────────────────────── */
  const track    = document.getElementById('testimonialTrack');
  const dotsWrap = document.getElementById('testimonialDots');
  const cards    = track ? track.querySelectorAll('.testimonial-card') : [];
  let currentSlide = 0;
  let autoSlideTimer;
  const visibleCount = () => window.innerWidth < 520 ? 1 : window.innerWidth < 900 ? 2 : 3;

  const totalSlides = () => Math.max(0, cards.length - visibleCount());

  function buildDots() {
    dotsWrap.innerHTML = '';
    const count = totalSlides() + 1;
    for (let i = 0; i < count; i++) {
      const btn = document.createElement('button');
      btn.setAttribute('aria-label', `Slide ${i + 1}`);
      btn.classList.toggle('active', i === currentSlide);
      btn.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(btn);
    }
  }

  function updateDots() {
    dotsWrap.querySelectorAll('button').forEach((btn, i) => {
      btn.classList.toggle('active', i === currentSlide);
    });
  }

  function goTo(index) {
    currentSlide = Math.max(0, Math.min(index, totalSlides()));
    const cardWidth  = cards[0] ? cards[0].offsetWidth + 24 : 364;
    track.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
    updateDots();
    resetAutoSlide();
  }

  function nextSlide() {
    const next = currentSlide >= totalSlides() ? 0 : currentSlide + 1;
    goTo(next);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideTimer);
    autoSlideTimer = setInterval(nextSlide, 4000);
  }

  if (cards.length) {
    buildDots();
    resetAutoSlide();

    // Touch support
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : goTo(currentSlide - 1);
    });

    window.addEventListener('resize', () => { buildDots(); goTo(currentSlide); });
  }

  /* ─── FORM VALIDATION ──────────────────────────────── */
  const form = document.getElementById('appointmentForm');

  const validators = {
    fname:    { required: true, label: 'Full name is required.' },
    fphone:   { required: true, regex: /^[6-9]\d{9}$|^\+91[6-9]\d{9}$|^\+?[\d\s\-]{10,15}$/, label: 'Enter a valid phone number.' },
    femail:   { required: false, regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, label: 'Enter a valid email address.' },
    fservice: { required: true, label: 'Please select a service.' },
    fdate:    { required: true, label: 'Please select a preferred date.' },
  };

  function showError(fieldId, msg) {
    const el = document.getElementById(fieldId);
    const errEl = document.getElementById(`${fieldId}Error`);
    if (el) el.classList.toggle('error', !!msg);
    if (errEl) errEl.textContent = msg || '';
  }

  function validateField(id, value) {
    const v = validators[id];
    if (!v) return true;
    if (v.required && !value.trim()) { showError(id, v.label); return false; }
    if (v.regex && value.trim() && !v.regex.test(value.trim())) { showError(id, v.label); return false; }
    showError(id, '');
    return true;
  }

  // Live validation
  Object.keys(validators).forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('blur', () => validateField(id, el.value));
      el.addEventListener('input', () => {
        if (el.classList.contains('error')) validateField(id, el.value);
      });
    }
  });

  // Date min = today
  const fdateEl = document.getElementById('fdate');
  if (fdateEl) {
    const today = new Date().toISOString().split('T')[0];
    fdateEl.setAttribute('min', today);
  }

  // Submit
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      Object.keys(validators).forEach(id => {
        const el = document.getElementById(id);
        if (el && !validateField(id, el.value)) valid = false;
      });

      if (!valid) {
        // Shake the submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.style.animation = 'shake .4s ease';
        setTimeout(() => { submitBtn.style.animation = ''; }, 400);
        return;
      }

      // Success
      form.reset();
      showSuccessModal();
    });
  }

  // Shake animation
  const shakeStyle = document.createElement('style');
  shakeStyle.textContent = `
    @keyframes shake {
      0%,100%{transform:translateX(0)}
      20%{transform:translateX(-8px)}
      40%{transform:translateX(8px)}
      60%{transform:translateX(-6px)}
      80%{transform:translateX(6px)}
    }
  `;
  document.head.appendChild(shakeStyle);

  /* ─── SUCCESS MODAL ────────────────────────────────── */
  const modal     = document.getElementById('successModal');
  const modalClose = document.getElementById('modalClose');

  function showSuccessModal() {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function hideModal() {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  if (modalClose) modalClose.addEventListener('click', hideModal);
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) hideModal(); });

  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('show')) hideModal(); });

  /* ─── FLOATING BUTTONS — HIDE ON TOP ──────────────── */
  const fabWa   = document.querySelector('.fab-whatsapp');
  const fabAppt = document.querySelector('.fab-appt');

  window.addEventListener('scroll', () => {
    const atTop = window.scrollY < 200;
    if (fabWa)   fabWa.style.opacity   = atTop ? '0' : '1';
    if (fabAppt) fabAppt.style.opacity = atTop ? '0' : '1';
  }, { passive: true });

  /* ─── COUNTER ANIMATION (stats) ───────────────────── */
  const stats = document.querySelectorAll('.stat strong');
  let countersRun = false;

  function animateCount(el) {
    const text   = el.textContent;
    const num    = parseInt(text.replace(/\D/g, ''));
    const suffix = text.replace(/[\d]/g, '');
    let start = 0;
    const dur  = 1600;
    const step = dur / 60;
    const increment = num / (dur / (1000 / 60));
    const timer = setInterval(() => {
      start += increment;
      if (start >= num) { start = num; clearInterval(timer); }
      el.textContent = `${Math.floor(start)}${suffix}`;
    }, step);
  }

  const heroSection = document.getElementById('home');
  const counterObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !countersRun) {
      countersRun = true;
      stats.forEach(animateCount);
    }
  }, { threshold: 0.5 });

  if (heroSection) counterObserver.observe(heroSection);

  /* ─── PARALLAX HERO ORBS (subtle) ─────────────────── */
  const orb1 = document.querySelector('.hero-orb-1');
  const orb2 = document.querySelector('.hero-orb-2');
  window.addEventListener('mousemove', e => {
    const mx = (e.clientX / window.innerWidth - .5) * 20;
    const my = (e.clientY / window.innerHeight - .5) * 20;
    if (orb1) orb1.style.transform = `translate(${mx}px, ${my}px)`;
    if (orb2) orb2.style.transform = `translate(${-mx * .5}px, ${-my * .5}px)`;
  }, { passive: true });

  /* ─── SERVICE CARD TILT ────────────────────────────── */
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const cx     = rect.width / 2;
      const cy     = rect.height / 2;
      const rotX   = ((y - cy) / cy) * -4;
      const rotY   = ((x - cx) / cx) * 4;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ─── WHATSAPP PRE-FILL ─────────────────────────────── */
  // Dynamically update WA link when form service changes
  const fserviceEl = document.getElementById('fservice');
  const waLinks    = document.querySelectorAll('.fab-whatsapp');
  if (fserviceEl) {
    fserviceEl.addEventListener('change', () => {
      const service = fserviceEl.value || 'an appointment';
      const msg = encodeURIComponent(`Hi, I would like to book an appointment for ${service} at Sunrise Dental Clinic.`);
      waLinks.forEach(link => link.setAttribute('href', `https://wa.me/917988192365?text=${msg}`));
    });
  }

  /* ─── INIT CHECK ───────────────────────────────────── */
  console.log('%c🦷 Sunrise Dental — Loaded Successfully', 'color:#2563eb;font-size:14px;font-weight:bold;');

}); // end DOMContentLoaded
