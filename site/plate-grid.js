/* ============================================================
   Plate grid + lightbox — shared renderer.
   Single source of truth for the four project records.
   Usage:  PlateArchive.mount('#plate-grid');
   ============================================================ */
(function () {
  const PROJECTS = [
    {
      plate: '01', code: 'STRYKE', year: '2022 – Present',
      title: 'Consumer hardware company',
      role: 'Embedded electronics engineer · in-house',
      tag: 'Consumer · Production · Field',
      alt: 'Schematic — connected device',
      imgs: ['assets/plate01.png'],
      prose: "End-to-end development of a testing system for harnesses and connected devices, deployed across multiple production and service sites, gating mass production and enabling field maintenance across the product's deployed locations. Alongside this, contributions to other product development and R&D projects, working closely with electronics and harness manufacturers and in tight cooperation with product designers. The role asked for a bridge across disciplines (electronics, firmware, manufacturing, design) and ownership of the work that lets a consumer product actually ship and stay running in the field.",
      meta: [
        ['Domain', 'Consumer hardware'],
        ['Owned', 'Test system · DFM / DFT'],
        ['Output', 'Production-gating fixtures, field rigs'],
        ['Scale', 'Multi-site deployment'],
      ],
    },
    {
      plate: '02', code: 'SELENE', year: '2020 – 2022',
      title: 'Aerospace R&D company',
      role: 'Drone payload · navigation validation',
      tag: 'Aerospace · R&D · Flight',
      alt: 'Schematic — GNSS payload',
      imgs: ['assets/plate02.jpeg'],
      prose: "Designed the electronics envelope for a sensor payload flown on a drone testbed to validate vision-based navigation algorithms destined for a lunar lander. Owned power conditioning, sensor synchronisation, telemetry, and a hardened harness built for repeated outdoor flights. Tight coupling with the algorithms team meant the payload had to be re-flashable, instrumented, and recoverable when something failed mid-flight, and it had to fit a tight mass budget. Delivered a flight-ready unit the team used across a full test-flight campaign.",
      meta: [
        ['Domain', 'Aerospace R&D'],
        ['Owned', 'Power · sync · telemetry · harness'],
        ['Constraint', 'Mass budget · flight-rated'],
        ['Outcome', 'Full test-flight campaign'],
      ],
    },
    {
      plate: '03', code: 'E50', year: '2018 – 2020',
      title: 'Formula Student team',
      role: 'Electrical Technical Director · race car',
      tag: 'Motorsport · Autonomous · HV',
      alt: 'Schematic — Formula Student race car',
      imgs: ['assets/plate03.png', 'assets/plate03-photo.jpg'],
      prose: "Owned the electrical system of a Formula Student autonomous car: the high-voltage tractive system, the low-voltage control buses, and the safety chain that ties them together. Led a team of engineers through a season of design, manufacture, and competition: from schematic reviews, to harness fabrication, to scrutineering. The job was as much project management as engineering: keeping the car compliant, the team unblocked, and the car on the track when the gun went off.",
      meta: [
        ['Domain', 'Motorsport · autonomous'],
        ['Owned', 'HV tractive · LV control · safety chain'],
        ['Lead', 'Multi-engineer EE team'],
        ['Outcome', 'Competed full season'],
      ],
    },
    {
      plate: '04', code: '3D-CAVE', year: '2017 – 2018',
      title: 'Research institute · MSc thesis',
      role: 'FPGA-accelerated computer vision · SLAM',
      tag: 'Research · FPGA · Computer vision',
      alt: 'Schematic — FPGA accelerator board',
      imgs: ['assets/plate04.png', 'assets/plate04-photo.jpg'],
      prose: "Implemented an FPGA accelerator for the feature-detection front-end of a visual SLAM pipeline, aimed at small mobile robots where CPU budget is tight. Designed the dataflow, the HDL, and the host integration that let the rest of the SLAM stack consume features at frame-rate without choking the bus. The trade-offs were architectural (what to bake into silicon, what to leave soft), and the thesis was as much about making those calls defensibly as it was about the bits.",
      meta: [
        ['Domain', 'Robotics research'],
        ['Stack', 'FPGA · HDL · CV front-end'],
        ['Target', 'Mobile robots · low CPU'],
        ['Outcome', 'MSc thesis, INESC-ID'],
      ],
    },
  ];

  const CTA_HREF = 'mailto:andremestrecosta@gmail.com';
  const VIEW_LABELS = ['Detail', 'Exploded', 'In-situ'];
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const isDrawing = (src) => /drawing|plate0[0-9]/i.test(src) && !/photo/i.test(src);

  // ---- grid markup -----------------------------------------
  function plateMarkup(p, i) {
    const n = p.imgs.length;
    const primary = p.imgs[0] || '';
    const frameInner = primary
      ? `<img src="${primary}" alt="${esc(p.alt)}" />`
      : `<div class="plate-pending"><div class="glyph">✱</div><div class="pl"><b>Awaiting schematic</b><br/>${esc(p.title)}</div></div>`;
    const status = primary
      ? `<span class="plate-status ready">● Drawn</span>`
      : `<span class="plate-status">○ To draw</span>`;
    const views = n > 1 ? `<span class="plate-views">${n} views</span>` : '';
    return `
      <button class="plate" type="button" data-idx="${i}">
        <div class="plate-frame">
          ${frameInner}
          <span class="plate-tab">Plate ${p.plate} / IV</span>
          ${status}
          ${views}
          <span class="plate-open">Open plate →</span>
        </div>
        <div class="plate-cap">
          <h3>${esc(p.title)}</h3>
          <span class="code">${esc(p.code)}</span>
          <span class="role">${esc(p.role)}</span>
        </div>
      </button>`;
  }

  function ctaMarkup() {
    return `
      <a class="plate-cta" href="${CTA_HREF}">
        <span class="tab">Plate 05 / next</span>
        <span class="status">◐ In construction</span>
        <div class="plate-cta-inner">
          <div class="glyph">+</div>
          <div>
            <h3>Let's make the <em>next sketch</em> together.</h3>
            <p>Your project, drawn into the archive · start a conversation →</p>
          </div>
          <div class="arrow">→</div>
        </div>
      </a>`;
  }

  function lightboxMarkup() {
    return `
      <div class="lb" id="lb" aria-hidden="true">
        <div class="lb-count" id="lbCount"></div>
        <button class="lb-close" id="lbClose" aria-label="Close">✕</button>
        <button class="lb-nav lb-prev" id="lbPrev" aria-label="Previous">←</button>
        <button class="lb-nav lb-next" id="lbNext" aria-label="Next">→</button>
        <div class="lb-card" role="dialog" aria-modal="true">
          <div class="lb-figure" id="lbFigure">
            <span class="lb-tab" id="lbTab"></span>
          </div>
          <div class="lb-body">
            <div class="lb-scroll">
              <div class="lb-code"><span id="lbCode"></span><span class="yr" id="lbYear"></span></div>
              <h2 id="lbTitle"></h2>
              <div class="lb-role" id="lbRole"></div>
              <div id="lbProse"></div>
            </div>
            <div class="lb-views">
              <div class="vh">// Plate set · same hand, multiple views</div>
              <div class="lb-thumbs" id="lbThumbs"></div>
            </div>
          </div>
        </div>
      </div>`;
  }

  function mount(selector, opts) {
    opts = opts || {};
    const container = document.querySelector(selector);
    if (!container) return;

    // grid
    let html = '<div class="plate-grid">';
    PROJECTS.forEach((p, i) => { html += plateMarkup(p, i); });
    if (opts.cta !== false) html += ctaMarkup();
    html += '</div>';
    container.innerHTML = html;

    // lightbox (one per page)
    let lb = document.getElementById('lb');
    if (!lb) {
      const holder = document.createElement('div');
      holder.innerHTML = lightboxMarkup();
      document.body.appendChild(holder.firstElementChild);
      lb = document.getElementById('lb');
    }

    let current = -1;
    let currentPendText = 'Schematic';

    function pendingMarkup(text) {
      return '<div class="plate-pending"><div class="glyph">✱</div>' +
             '<div class="pl"><b>Awaiting schematic</b><br/>' + text + '</div></div>';
    }
    function setMainImage(src, alt) {
      const fig = document.getElementById('lbFigure');
      const old = fig.querySelector('img, .plate-pending');
      if (old) old.remove();
      let node;
      if (src) {
        node = document.createElement('img');
        node.src = src; node.alt = alt;
        if (isDrawing(src)) node.style.objectFit = 'contain';
      } else {
        const wrap = document.createElement('div');
        wrap.innerHTML = pendingMarkup(currentPendText);
        node = wrap.firstChild;
      }
      fig.insertBefore(node, document.getElementById('lbTab').nextSibling);
    }

    function open(i) {
      const p = PROJECTS[i];
      current = i;
      const imgs = p.imgs;
      currentPendText = p.title;

      document.getElementById('lbTab').textContent = 'Plate ' + p.plate + ' / IV';
      document.getElementById('lbCode').textContent = 'Project ‘' + p.code + '’';
      document.getElementById('lbYear').textContent = p.year;
      document.getElementById('lbTitle').textContent = p.title;
      document.getElementById('lbRole').textContent = p.role;

      let metaHtml = '';
      p.meta.forEach(([k, v]) => { metaHtml += '<dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd>'; });
      document.getElementById('lbProse').innerHTML =
        '<p>' + esc(p.prose) + '</p><dl class="lb-meta">' + metaHtml + '</dl>';

      document.getElementById('lbCount').textContent =
        'Plate ' + p.plate + ' of ' + String(PROJECTS.length).padStart(2, '0');

      setMainImage(imgs[0] || '', p.title);

      const thumbs = document.getElementById('lbThumbs');
      thumbs.innerHTML = '';
      imgs.forEach((src, idx) => {
        const t = document.createElement('button');
        t.type = 'button';
        t.className = 'lb-thumb' + (idx === 0 ? ' active' : '');
        t.innerHTML = '<img src="' + src + '" alt="">';
        t.addEventListener('click', () => {
          setMainImage(src, p.title);
          thumbs.querySelectorAll('.lb-thumb').forEach((x) => x.classList.remove('active'));
          t.classList.add('active');
        });
        thumbs.appendChild(t);
      });
      for (let k = imgs.length; k < 3; k++) {
        const t = document.createElement('div');
        t.className = 'lb-thumb';
        t.innerHTML = '<div class="vlabel">' + (VIEW_LABELS[k] || 'View') + '<br/>· to draw</div>';
        thumbs.appendChild(t);
      }

      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lb-locked');
    }
    function close() {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lb-locked');
      current = -1;
    }
    function step(dir) {
      if (current < 0) return;
      open((current + dir + PROJECTS.length) % PROJECTS.length);
    }

    container.querySelectorAll('.plate').forEach((el) => {
      el.addEventListener('click', () => open(parseInt(el.dataset.idx, 10)));
    });
    document.getElementById('lbClose').addEventListener('click', close);
    document.getElementById('lbPrev').addEventListener('click', () => step(-1));
    document.getElementById('lbNext').addEventListener('click', () => step(1));
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    document.addEventListener('keydown', (e) => {
      if (current < 0) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });
  }

  window.PlateArchive = { mount, PROJECTS };
})();
