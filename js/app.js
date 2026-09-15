/* André Macouzet Ruiz — portafolio personal */
(function () {
  'use strict';

  /* ---------- datos ---------- */
  var WORK = [
    {
      name: 'NORTHPOINT',
      kind: { es: 'Plataforma de trading · Producto de datos', en: 'Trading platform · Data product' },
      desc: {
        es: 'Del examen de fondeo al payout. Califica cada operación contra reglas escritas, lleva la bitácora, corre el backtesting en R y proyecta los retiros. Los fills entran solos desde el CSV del broker vía un backend de sincronización propio.',
        en: 'From the funding exam to the payout. It scores every trade against written rules, keeps the journal, runs backtesting in R and projects withdrawals. Fills load themselves from the broker CSV through a sync backend I wrote.'
      },
      tags: ['JavaScript', 'Supabase', 'Broker API', 'R'],
      url: 'https://studioamr.github.io/northpoint/'
    },
    {
      name: 'ABONO',
      kind: { es: 'AgTech · En uso real', en: 'AgTech · In real use' },
      desc: {
        es: 'Responde la única pregunta que el productor de invernadero no podía contestar: ¿este ciclo ganó dinero? Cortes, gastos y rendimiento en un número. Un productor real lo usa hoy.',
        en: 'It answers the one question a greenhouse grower could not answer: did this cycle make money? Harvests, costs and yield in a single number. A real grower uses it today.'
      },
      tags: ['JavaScript', 'PWA', 'Supabase'],
      url: 'https://studioamr.github.io/agrofin/'
    },
    {
      name: 'PARFECT',
      kind: { es: 'Analítica deportiva', en: 'Sports analytics' },
      desc: {
        es: 'Le dice al golfista exactamente qué golpe le está costando más strokes por ronda. Registro hoyo por hoyo, tendencias y el diagnóstico concreto en vez de un promedio que no sirve para nada.',
        en: 'It tells a golfer exactly which shot is costing them the most strokes per round. Hole-by-hole logging, trends, and a concrete diagnosis instead of an average that helps nobody.'
      },
      tags: ['JavaScript', 'PWA', 'Data viz'],
      url: 'https://studioamr.github.io/parfect/'
    },
    {
      name: 'FIRMLINE',
      kind: { es: 'Software B2B · IA aplicada', en: 'B2B software · Applied AI' },
      desc: {
        es: 'Recepcionista con IA para despachos de abogados en Estados Unidos: contesta, califica al prospecto y agenda. Un despacho que no contesta el teléfono pierde el caso, y ese es todo el argumento de venta.',
        en: 'An AI receptionist for U.S. law firms: it answers, qualifies the lead and books the consult. A firm that does not pick up the phone loses the case, and that is the entire sales argument.'
      },
      tags: ['IA', 'Voz', 'SaaS'],
      url: 'https://studioamr.github.io/firmline/'
    },
    {
      name: 'PULIRA',
      kind: { es: 'E-commerce · Modelo de unidad', en: 'E-commerce · Unit economics' },
      desc: {
        es: 'Tienda de dispositivos de beauty tech con proveedores reales verificados en México, y un modelo de márgenes que encadena costo, unidades y utilidad en vivo. El catálogo y la aritmética del negocio en la misma pieza.',
        en: 'A beauty-tech device store with real suppliers verified in Mexico, plus a margin model that chains cost, units and profit live. The catalogue and the arithmetic of the business in one piece.'
      },
      tags: ['E-commerce', 'Unit economics', 'Shopify'],
      url: 'https://studioamr.github.io/pulira/'
    },
    {
      name: 'HEARTS',
      kind: { es: 'Juego de navegador', en: 'Browser game' },
      desc: {
        es: 'Un juego completo y jugable en el navegador: modos, mapas, oponentes con IA y sistema de rankeo. Está aquí porque la ingeniería de un juego en tiempo real no perdona errores de estado.',
        en: 'A complete, playable browser game: modes, maps, AI opponents and a ranked system. It is here because real-time game engineering does not forgive state bugs.'
      },
      tags: ['Canvas', 'Vanilla JS', 'Game loop'],
      url: 'https://studioamr.github.io/hearts/'
    }
  ];

  var REPOS = [
    {
      name: { es: 'Mercado de autos', en: 'Vehicle market' },
      kind: 'Streamlit · Plotly · Python',
      desc: {
        es: 'Panel interactivo de tendencias y precios del mercado de vehículos: comparación por marca y estado, depreciación y detección de outliers.',
        en: 'Interactive dashboard of vehicle-market trends and prices: comparison by make and condition, depreciation and outlier detection.'
      },
      url: 'https://github.com/andremacouzetruiz/Dificultad-para-entender-las-tendencias-y-precios-en-el-mercado-de-autos'
    },
    {
      name: { es: 'ADAM Quant', en: 'ADAM Quant' },
      kind: 'Python · Pandas',
      desc: {
        es: 'Backtesting de futuros: métricas de estrategia, curva de equity y análisis de riesgo sobre datos de mercado.',
        en: 'Futures backtesting: strategy metrics, equity curve and risk analysis over market data.'
      },
      url: 'https://github.com/andremacouzetruiz/ADAM_Quant'
    },
    {
      name: { es: 'Quant Journal', en: 'Quant Journal' },
      kind: 'Python',
      desc: {
        es: 'Bitácora de operaciones: registro de fills, profit factor, drawdown y búsqueda de patrones en el historial propio.',
        en: 'Trade journal: fill logging, profit factor, drawdown and pattern hunting across my own history.'
      },
      url: 'https://github.com/andremacouzetruiz/quantjournal'
    },
    {
      name: { es: 'NorthPoint Sync', en: 'NorthPoint Sync' },
      kind: 'JavaScript · Broker API',
      desc: {
        es: 'Backend de sincronización en vivo entre la plataforma NorthPoint y el broker: las operaciones entran solas desde el CSV de Tradovate.',
        en: 'Live sync backend between the NorthPoint platform and the broker: trades load themselves from the Tradovate CSV.'
      },
      url: 'https://github.com/andremacouzetruiz/northpoint-sync'
    }
  ];

  /* ---------- helpers ---------- */
  function bi(o) {
    return '<span data-es>' + o.es + '</span><span data-en>' + o.en + '</span>';
  }
  function pretty(u) {
    return u.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  /* ---------- render ---------- */
  var work = document.getElementById('work');
  if (work) {
    work.innerHTML = WORK.map(function (p, i) {
      var n = String(i + 1).padStart(2, '0');
      return '' +
        '<article class="case rv">' +
          '<div class="case-info">' +
            '<p class="case-idx">' + n + ' / ' + String(WORK.length).padStart(2, '0') + '</p>' +
            '<h3 class="case-name">' + p.name + '</h3>' +
            '<p class="case-kind">' + bi(p.kind) + '</p>' +
            '<p class="case-desc">' + bi(p.desc) + '</p>' +
            '<div class="tags">' + p.tags.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('') + '</div>' +
            '<a class="case-link" href="' + p.url + '" target="_blank" rel="noopener">' +
              '<span data-es>Abrir el proyecto</span><span data-en>Open the project</span> ↗</a>' +
          '</div>' +
          '<div class="case-shot">' +
            '<div class="frame">' +
              '<div class="frame-bar">' +
                '<span class="dots"><i></i><i></i><i></i></span>' +
                '<span class="frame-url">' + pretty(p.url) + '</span>' +
                '<span class="frame-live"><i></i><span data-es>En vivo</span><span data-en>Live</span></span>' +
              '</div>' +
              '<div class="frame-body" data-src="' + p.url + '">' +
                '<div class="skeleton"><span data-es>Cargando…</span><span data-en>Loading…</span></div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</article>';
    }).join('');
  }

  var repos = document.getElementById('repos');
  if (repos) {
    repos.innerHTML = REPOS.map(function (r) {
      return '' +
        '<a class="repo" href="' + r.url + '" target="_blank" rel="noopener">' +
          '<h3>' + bi(r.name) + '</h3>' +
          '<p class="k">' + r.kind + '</p>' +
          '<p>' + bi(r.desc) + '</p>' +
          '<span class="go"><span data-es>Ver el repositorio</span><span data-en>View the repo</span> ↗</span>' +
        '</a>';
    }).join('');
  }

  /* ---------- previews en vivo (lazy) ---------- */
  var bodies = document.querySelectorAll('.frame-body[data-src]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        io.unobserve(el);
        var f = document.createElement('iframe');
        f.setAttribute('loading', 'lazy');
        f.setAttribute('tabindex', '-1');
        f.setAttribute('aria-hidden', 'true');
        f.setAttribute('scrolling', 'no');
        f.setAttribute('sandbox', 'allow-scripts allow-same-origin');
        f.src = el.getAttribute('data-src');
        f.addEventListener('load', function () { el.classList.add('on'); });
        el.appendChild(f);
        setTimeout(function () { el.classList.add('on'); }, 4000);
      });
    }, { rootMargin: '500px 0px' });
    Array.prototype.forEach.call(bodies, function (b) { io.observe(b); });
  } else {
    Array.prototype.forEach.call(bodies, function (b) {
      var f = document.createElement('iframe');
      f.src = b.getAttribute('data-src');
      b.appendChild(f);
      b.classList.add('on');
    });
  }

  /* ---------- reveal ---------- */
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
    Array.prototype.forEach.call(rv, function (el) { ro.observe(el); });
  } else {
    Array.prototype.forEach.call(rv, function (el) { el.classList.add('in'); });
  }

  /* ---------- idioma ---------- */
  var btn = document.getElementById('lang');
  function setLang(l) {
    document.body.classList.toggle('en', l === 'en');
    document.documentElement.lang = l;
    if (btn) btn.textContent = l === 'en' ? 'ES' : 'EN';
    try { localStorage.setItem('amr-lang', l); } catch (err) {}
  }
  var saved = null;
  try { saved = localStorage.getItem('amr-lang'); } catch (err) {}
  if (!saved) saved = (navigator.language || 'es').toLowerCase().indexOf('es') === 0 ? 'es' : 'en';
  setLang(saved);
  if (btn) {
    btn.addEventListener('click', function () {
      setLang(document.body.classList.contains('en') ? 'es' : 'en');
    });
  }
})();
