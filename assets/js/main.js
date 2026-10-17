(function () {
  'use strict';

  var root = document.documentElement;

  // Theme toggle
  var themeBtn = document.getElementById('theme-toggle');
  themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // Nav: shadow on scroll
  var nav = document.querySelector('.nav');
  function onScroll() { nav.classList.toggle('is-scrolled', window.scrollY > 8); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  var burger = document.getElementById('nav-toggle');
  var links = document.getElementById('nav-links');
  function setMenu(open) {
    links.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  burger.addEventListener('click', function () { setMenu(!links.classList.contains('is-open')); });
  links.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', function (e) {
    if (links.classList.contains('is-open') && !e.target.closest('#nav-links, #nav-toggle')) setMenu(false);
  });

  // Long experience lists: show the first few on phones, with a toggle for the rest
  document.querySelectorAll('.job__list').forEach(function (list) {
    var total = list.children.length;
    if (total <= 5) return;
    list.classList.add('is-collapsed');
    var more = document.createElement('button');
    more.type = 'button';
    more.className = 'job__more';
    more.setAttribute('aria-expanded', 'false');
    more.textContent = 'Show all ' + total + ' ↓';
    more.addEventListener('click', function () {
      var collapsed = list.classList.toggle('is-collapsed');
      more.setAttribute('aria-expanded', String(!collapsed));
      more.textContent = collapsed ? 'Show all ' + total + ' ↓' : 'Show less ↑';
    });
    list.insertAdjacentElement('afterend', more);
  });

  // Scroll reveal and active nav link
  var reveals = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { revealObs.observe(el); });

    var navLinks = {};
    links.querySelectorAll('a').forEach(function (a) { navLinks[a.getAttribute('href').slice(1)] = a; });
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = navLinks[entry.target.id];
        if (!link || !entry.isIntersecting) return;
        Object.keys(navLinks).forEach(function (k) { navLinks[k].classList.remove('is-active'); });
        link.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { sectionObs.observe(s); });
  }

  // Pointer effects: only for a real mouse, and never with reduced motion
  if (matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    initPointerFx();
  }

  function initPointerFx() {
    root.classList.add('fx');

    var mouse = { x: innerWidth / 2, y: innerHeight * 0.3 };
    var glowPos = { x: mouse.x, y: mouse.y };
    var glow = document.querySelector('.bg-glow');
    var frame = 0;

    // Spotlight layers on every card-like surface; only on-screen ones are updated
    var visible = new Set();
    var spotObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target);
      });
    });
    document.querySelectorAll('.card, .job__body, .feature, .skill-group, .project, .cp, .edu, .flow__node')
      .forEach(function (el) {
        el.classList.add('spot');
        ['spot__fill', 'spot__ring'].forEach(function (cls) {
          var layer = document.createElement('span');
          layer.className = cls;
          layer.setAttribute('aria-hidden', 'true');
          el.appendChild(layer);
        });
        spotObs.observe(el);
      });

    var magnets = document.querySelectorAll('[data-magnetic]');
    var MAGNET_MAX = 6; // px

    function schedule() { if (!frame) frame = requestAnimationFrame(tick); }

    function tick() {
      frame = 0;

      root.style.setProperty('--mx', mouse.x + 'px');
      root.style.setProperty('--my', mouse.y + 'px');

      visible.forEach(function (el) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--x', (mouse.x - r.left) + 'px');
        el.style.setProperty('--y', (mouse.y - r.top) + 'px');
      });

      // Only the nearest magnetic element moves, capped so neighbours never overlap
      var pulled = null, best = Infinity;
      magnets.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var dx = mouse.x - (r.left + r.width / 2);
        var dy = mouse.y - (r.top + r.height / 2);
        var dist = Math.hypot(dx, dy);
        if (dist < Math.max(r.width, r.height) / 2 + 24 && dist < best) {
          best = dist;
          pulled = { el: el, dx: dx, dy: dy, dist: dist };
        }
      });
      magnets.forEach(function (el) {
        if (pulled && el === pulled.el) {
          var scale = Math.min(0.25, MAGNET_MAX / (pulled.dist || 1));
          el.style.translate = (pulled.dx * scale).toFixed(1) + 'px ' + (pulled.dy * scale).toFixed(1) + 'px';
        } else if (el.style.translate) {
          el.style.translate = '';
        }
      });

      // Background glow eases toward the cursor
      glowPos.x += (mouse.x - glowPos.x) * 0.06;
      glowPos.y += (mouse.y - glowPos.y) * 0.06;
      var gx = (glowPos.x - innerWidth / 2) * 0.4;
      var gy = (glowPos.y - innerHeight * 0.3) * 0.4;
      glow.style.transform = 'translate(calc(-50% + ' + gx.toFixed(1) + 'px), ' + gy.toFixed(1) + 'px)';
      if (Math.abs(mouse.x - glowPos.x) > 0.5 || Math.abs(mouse.y - glowPos.y) > 0.5) schedule();
    }

    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      root.classList.add('fx-active');
      schedule();
    }, { passive: true });
    window.addEventListener('scroll', schedule, { passive: true });
    document.addEventListener('mouseleave', function () {
      root.classList.remove('fx-active');
      magnets.forEach(function (el) { el.style.translate = ''; });
    });

    // 3D tilt on the code card
    var tilt = document.querySelector('.tilt');
    if (tilt) {
      tilt.addEventListener('pointermove', function (e) {
        var r = tilt.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        tilt.classList.add('is-tilting');
        tilt.style.setProperty('--rx', ((0.5 - py) * 8).toFixed(2) + 'deg');
        tilt.style.setProperty('--ry', ((px - 0.5) * 10).toFixed(2) + 'deg');
        tilt.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        tilt.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
      });
      tilt.addEventListener('pointerleave', function () {
        tilt.classList.remove('is-tilting');
        tilt.style.setProperty('--rx', '0deg');
        tilt.style.setProperty('--ry', '0deg');
      });
    }
  }

  // Copy email
  var toast = document.getElementById('toast');
  var toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 2200);
  }
  var copyBtn = document.getElementById('copy-email');
  copyBtn.addEventListener('click', function () {
    var email = copyBtn.getAttribute('data-email');
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(email).then(
        function () { showToast('Email copied to clipboard'); },
        function () { showToast(email); }
      );
    } else {
      showToast(email);
    }
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
