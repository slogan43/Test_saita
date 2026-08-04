/* Поведение оформления: появление блоков, состояние шапки, счётчики.
   Всё необязательное — если скрипт не выполнится, страница остаётся читаемой. */
(function () {
  'use strict';

  var reduced = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── появление блоков при прокрутке ───────────────────────
     Через IntersectionObserver, а не обработчик scroll: браузер сам
     решает, когда проверять видимость, и не дёргает главный поток. */
  var reveals = document.querySelectorAll('[data-reveal]');
  if (!reveals.length) return;

  if (reduced || !('IntersectionObserver' in window)) {
    for (var i = 0; i < reveals.length; i++) reveals[i].classList.add('is-in');
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);            // показали один раз — больше не следим
        if (en.target.hasAttribute('data-count')) countUp(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    for (var j = 0; j < reveals.length; j++) io.observe(reveals[j]);
  }

  /* ── шапка получает фон, когда страница прокручена ──────── */
  var hdr = document.querySelector('.hdr');
  if (hdr) {
    var onScroll = function () {
      hdr.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── счётчики: число «набегает» вместо мгновенного показа ── */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 900, t0 = null;

    function step(ts) {
      if (t0 === null) t0 = ts;
      var k = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - k, 3);          // замедление к концу
      el.textContent = Math.round(target * eased).toLocaleString('ru-RU') + suffix;
      if (k < 1) requestAnimationFrame(step);
    }
    if (reduced) {
      el.textContent = target.toLocaleString('ru-RU') + suffix;
    } else {
      requestAnimationFrame(step);
    }
  }
})();
