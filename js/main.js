/* Rafel Beltrán · IFBB Pro — interacciones */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const body = document.body;

  gsap.registerPlugin(ScrollTrigger);
  $$('.js-year').forEach(e => { e.textContent = new Date().getFullYear(); });

  /* ---------- utilidades FX ---------- */
  const flashEl = $('.flash');
  const speedEl = $('.speed--fx');
  function flash(strength = 1, dur = .9) {
    gsap.fromTo(flashEl, { opacity: strength }, { opacity: 0, duration: dur, ease: 'power2.out' });
  }
  function speedLines(dur = .7) {
    if (reduce) return;
    gsap.fromTo(speedEl, { opacity: .55 }, { opacity: 0, duration: dur, ease: 'power2.out' });
  }
  const toastEl = $('.toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2600);
  }

  /* ---------- LOADER: scouter ---------- */
  function runLoader(done) {
    const L = $('.loader');
    const num = $('.loader__num');
    const msg = $('.loader__msg');
    if (reduce) { L.remove(); done(); return; }
    const st = { v: 0 };
    const tl = gsap.timeline({ onComplete: () => { L.remove(); done(); } });
    tl.to(st, {
      v: 9001, duration: 2.2, ease: 'expo.in',
      onUpdate() { num.textContent = String(Math.floor(st.v)).padStart(4, '0'); }
    })
      .add(() => { L.classList.add('is-over'); msg.textContent = '¡¿Más de 9000?!'; })
      .to('.loader__lens', { scale: 1.08, duration: .08, yoyo: true, repeat: 5 })
      .add(() => L.classList.add('is-crack'), '+=.1')
      .to(flashEl, { opacity: 1, duration: .1 }, '+=.35')
      .set(L, { autoAlpha: 0 });
    L.addEventListener('click', () => tl.progress(1));
  }

  /* ---------- HERO ---------- */
  const hero = $('.hero');
  const cssVar = (el, v) => getComputedStyle(el).getPropertyValue(v).trim();

  const base = { t: cssVar(hero, '--win-t'), b: cssVar(hero, '--win-b'), l: cssVar(hero, '--win-l'), r: cssVar(hero, '--win-r') };

  function heroIntro(done) {
    gsap.to(flashEl, { opacity: 0, duration: 1, ease: 'power2.out' });
    speedLines(1.1);
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: done });
    tl.fromTo(hero, { '--win-t': '50%', '--win-b': '50%' }, { '--win-t': base.t, '--win-b': base.b, duration: 1.4 }, 0)
      .from('.hero__fig img', { scale: 1.5, duration: 2 }, 0)
      .from('.hero__last', { yPercent: 40, opacity: 0, duration: 1.4 }, .15)
      .from('.hero__first', { letterSpacing: '2em', opacity: 0, duration: 1.6 }, .2)
      .from('.hero__outline', { opacity: 0, duration: 1 }, .6)
      .from('.hero__hud, .hero__kana, .hero__scroll', { opacity: 0, y: 20, duration: 1, stagger: .08 }, .6)
      .from('.nav', { yPercent: -100, opacity: 0, duration: 1 }, .5);
    if (reduce) tl.progress(1);
  }

  // Se crea al arrancar (antes que el resto) para que el pin cuente en todas las posiciones
  function heroScroll() {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: hero, start: 'top top', end: '+=150%', scrub: .5, pin: true, anticipatePin: 1 }
    });
    tl.fromTo(hero,
      { '--win-t': base.t, '--win-b': base.b, '--win-l': base.l, '--win-r': base.r, '--win-rad': '26px' },
      { '--win-t': '0%', '--win-b': '0%', '--win-l': '0%', '--win-r': '0%', '--win-rad': '0px', ease: 'power2.inOut', duration: 1 }, 0)
      .fromTo('.hero__name', { scale: 1, opacity: 1 }, { scale: 1.3, opacity: 0, ease: 'power1.in', duration: .6 }, 0)
      .fromTo('.hero__outline', { opacity: 1 }, { opacity: 0, duration: .45 }, 0)
      .fromTo('.hero__hud, .hero__kana, .hero__scroll', { opacity: 1, y: 0 }, { opacity: 0, y: 20, duration: .3 }, 0)
      .fromTo('.hero__frame', { opacity: 1 }, { opacity: 0, duration: .5 }, .3)
      .fromTo('.hero__fig img', { scale: 1.12 }, { scale: 1, ease: 'none', duration: 1 }, 0)
      .fromTo('.hero__shade', { opacity: 0 }, { opacity: 1, duration: .4 }, .7)
      .fromTo('.hero__caption', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: .4 }, .8)
      .to({}, { duration: .35 });
  }

  // Aura de ki alrededor del marco + rayos
  function heroFX() {
    const c = $('.hero__fx');
    if (!c || reduce) return;
    const ctx = c.getContext('2d');
    const frame = $('.hero__frame');
    let W, H, parts = [], visible = true;
    function size() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = c.clientWidth; H = c.clientHeight;
      c.width = W * dpr; c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    addEventListener('resize', size);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop(); }).observe(hero);

    function spawn(r, cr) {
      const side = Math.random();
      let x, y;
      if (side < .45) { x = r.left + Math.random() * r.width; y = r.bottom - Math.random() * 30; }
      else if (side < .95) { x = (Math.random() < .5 ? r.left : r.right) + (Math.random() - .5) * 26; y = r.top + Math.random() * r.height; }
      else { x = r.left + Math.random() * r.width; y = r.top; }
      parts.push({ x: x - cr.left, y: y - cr.top, vx: (Math.random() - .5) * .7, vy: -(1.2 + Math.random() * 2.8), life: 0, max: 40 + Math.random() * 60, s: 14 + Math.random() * 34, ph: Math.random() * 6 });
    }
    function bolt(r, cr, col) {
      let x = r.left - cr.left + (Math.random() < .5 ? -10 : r.width + 10);
      let y = r.top - cr.top + Math.random() * r.height;
      ctx.beginPath(); ctx.moveTo(x, y);
      for (let i = 0; i < 7; i++) { x += (Math.random() - .5) * 40; y += 10 + Math.random() * 18; ctx.lineTo(x, y); }
      ctx.strokeStyle = `rgba(${col},.9)`; ctx.lineWidth = 1.6; ctx.shadowBlur = 16; ctx.shadowColor = `rgb(${col})`;
      ctx.stroke(); ctx.shadowBlur = 0;
    }
    let raf = 0;
    function loop() {
      cancelAnimationFrame(raf);
      if (!visible) return;
      ctx.clearRect(0, 0, W, H);
      const ssj = body.classList.contains('ssj');
      const r = frame.getBoundingClientRect();
      const cr = c.getBoundingClientRect();
      const fade = +getComputedStyle(frame).opacity;
      if (fade > .05) for (let i = 0; i < (ssj ? 7 : 4); i++) spawn(r, cr);
      const col = ssj ? '255,196,60' : '90,130,255';
      ctx.globalCompositeOperation = 'lighter';
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life++;
        p.x += p.vx + Math.sin(p.life * .12 + p.ph) * .6;
        p.y += p.vy;
        const k = p.life / p.max;
        if (k >= 1) { parts.splice(i, 1); continue; }
        const a = (1 - k) * (ssj ? .3 : .24);
        const s = p.s * (1 - k * .6);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s);
        g.addColorStop(0, `rgba(255,255,255,${a})`);
        g.addColorStop(.35, `rgba(${col},${a})`);
        g.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, Math.PI * 2); ctx.fill();
      }
      if (fade > .05 && Math.random() < (ssj ? .09 : .025)) bolt(r, cr, ssj ? '255,230,140' : '170,200,255');
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(loop);
    }
    loop();
  }

  // Lectura de poder que no se queda quieta
  function powerJitter() {
    const els = [$('.hero__pl')];
    setInterval(() => {
      const ssj = body.classList.contains('ssj');
      const v = (ssj ? 450000 : 9001) + Math.floor(Math.random() * (ssj ? 50000 : 180));
      els.forEach(e => { if (e) e.textContent = v.toLocaleString('es-ES'); });
    }, 140);
  }

  /* ---------- MANIFIESTO: palabra a palabra ---------- */
  function splitWords(el) {
    const words = [];
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const s = document.createElement('span');
            s.className = 'w'; s.textContent = part;
            frag.appendChild(s); words.push(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    return words;
  }
  function manifest() {
    const el = $('.manifest__text');
    const words = splitWords(el);
    gsap.to(words, {
      opacity: 1, stagger: .1, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 50%', scrub: true }
    });
    gsap.from('.manifest__en', { opacity: 0, y: 30, duration: 1, scrollTrigger: { trigger: '.manifest', start: 'top 75%' } });
  }

  /* ---------- NIVEL DE PODER ---------- */
  function power() {
    const meter = $('.power__meter i');
    ScrollTrigger.create({
      trigger: '.power', start: 'top 75%', once: true,
      onEnter() {
        gsap.fromTo(meter, { '--p': 0 }, { '--p': 1, duration: 2.2, ease: 'power3.inOut' });
        $$('.power__grid b').forEach((b, i) => {
          const to = parseFloat(b.dataset.count);
          const dec = +(b.dataset.dec || 0);
          const suf = b.dataset.suffix || '';
          const o = { v: 0 };
          gsap.to(o, {
            v: to, duration: 1.8, delay: i * .12, ease: 'power3.out',
            onUpdate() { b.textContent = o.v.toFixed(dec).replace('.', ',') + suf; }
          });
        });
        gsap.from('.power__grid li', { y: 60, opacity: 0, duration: 1, stagger: .1, ease: 'expo.out' });
      }
    });
  }

  /* ---------- SAGA horizontal ---------- */
  function saga() {
    const mm = gsap.matchMedia();
    const track = $('.saga__track');
    const bar = $('.saga__bar i');
    mm.add('(min-width: 821px)', () => {
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      const tween = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: '.saga', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .6,
          invalidateOnRefresh: true,
          onUpdate: s => { bar.style.transform = `scaleX(${s.progress})`; }
        }
      });
      $$('.ep').forEach(ep => {
        gsap.from(ep.querySelector('.ep__media img'), {
          scale: 1.35, ease: 'none',
          scrollTrigger: { trigger: ep, containerAnimation: tween, start: 'left right', end: 'center center', scrub: true }
        });
      });
      return () => gsap.set(track, { x: 0 });
    });
    mm.add('(max-width: 820px)', () => {
      $$('.ep').forEach(ep => gsap.from(ep, { y: 80, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: ep, start: 'top 88%' } }));
    });
  }

  /* ---------- SCOUTER ---------- */
  function scouter() {
    const stage = $('.scouter__stage');
    const lens = $('.scouter__lens');
    const img = stage.querySelector('img');
    const plEls = [$('.scouter__pl'), $('.scouter__lensnum')];
    const Z = 2.2;
    let lx = 0, ly = 0;
    const setBg = () => { lens.style.backgroundImage = `url("${img.currentSrc || img.src}")`; };
    if (img.complete) setBg(); else img.addEventListener('load', setBg);

    function place(x, y) {
      const w = stage.clientWidth, h = stage.clientHeight, R = lens.offsetWidth / 2;
      lx = x; ly = y;
      lens.style.transform = `translate(${x}px, ${y}px)`;
      lens.style.backgroundSize = `${w * Z}px ${h * Z}px`;
      lens.style.backgroundPosition = `${-(x * Z - R)}px ${-(y * Z - R)}px`;
      const ssj = body.classList.contains('ssj');
      const v = Math.round((ssj ? 450000 : 7600) + (1 - y / h) * (ssj ? 40000 : 2400) + Math.random() * 90);
      plEls.forEach(e => { e.textContent = v.toLocaleString('es-ES'); });
      plEls[0].classList.toggle('is-over', v > 9000);
    }
    const center = () => place(stage.clientWidth * .5, stage.clientHeight * .38);
    center();
    addEventListener('resize', () => place(Math.min(lx, stage.clientWidth), Math.min(ly, stage.clientHeight)));

    if (finePointer) {
      const qx = { x: 0, y: 0 };
      stage.addEventListener('pointermove', e => {
        const r = stage.getBoundingClientRect();
        gsap.to(qx, { x: e.clientX - r.left, y: e.clientY - r.top, duration: .35, ease: 'power3.out', overwrite: true, onUpdate: () => place(qx.x, qx.y) });
      });
      stage.addEventListener('pointerenter', () => { qx.x = lx; qx.y = ly; });
    } else {
      // En táctil el scouter barre solo
      let t = 0, on = false;
      new IntersectionObserver(([e]) => { on = e.isIntersecting; }).observe(stage);
      gsap.ticker.add(() => {
        if (!on) return;
        t += .012;
        const w = stage.clientWidth, h = stage.clientHeight;
        place(w * (.5 + .3 * Math.sin(t * 1.3)), h * (.42 + .26 * Math.sin(t * .9 + 1)));
      });
    }
    gsap.from('.scouter__data div', { x: -30, opacity: 0, stagger: .06, duration: .8, ease: 'expo.out', scrollTrigger: { trigger: '.scouter__data', start: 'top 80%' } });
    gsap.from(stage, { clipPath: 'inset(50% 0 50% 0 round 20px)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: stage, start: 'top 75%' } });
  }

  /* ---------- MAJIN ---------- */
  function majin() {
    const path = $('.majin__path');
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.timeline({ scrollTrigger: { trigger: '.majin__mark', start: 'top 80%', end: 'bottom 40%', scrub: .6 } })
      .to(path, { strokeDashoffset: 0, ease: 'none' })
      .to(path, { fill: 'rgba(255,59,79,.9)', duration: .3 });
    ScrollTrigger.create({ trigger: '.majin', start: 'top 60%', once: true, onEnter: () => speedLines(.8) });
    gsap.from('.majin__copy > *', { y: 40, opacity: 0, stagger: .08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.majin__copy', start: 'top 78%' } });
    gsap.fromTo('.majin__kana', { yPercent: 10 }, { yPercent: -25, ease: 'none', scrollTrigger: { trigger: '.majin', start: 'top bottom', end: 'bottom top', scrub: true } });

    // Vídeo del móvil: se reproduce solo cuando está a la vista
    const v = $('.phone video');
    const snd = $('.phone__sound');
    new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }, { threshold: .35 }).observe(v);
    snd.addEventListener('click', () => {
      v.muted = !v.muted;
      snd.classList.toggle('is-on', !v.muted);
      snd.textContent = v.muted ? 'Sonido' : 'Silenciar';
      v.play().catch(() => {});
    });

    // Tres toques en la M = Super Saiyan
    let taps = 0, tapT;
    $('.majin__btn').addEventListener('click', () => {
      taps++;
      gsap.fromTo('.majin__mark svg', { scale: .92 }, { scale: 1, duration: .5, ease: 'elastic.out(1, .4)' });
      clearTimeout(tapT);
      tapT = setTimeout(() => { taps = 0; }, 900);
      if (taps >= 3) { taps = 0; toggleSSJ(); }
    });
  }

  /* ---------- SUPER SAIYAN (easter egg) ---------- */
  function toggleSSJ() {
    const on = !body.classList.contains('ssj');
    flash(.95, 1.1);
    speedLines(1.2);
    body.classList.toggle('ssj', on);
    gsap.fromTo('main', { x: -6 }, { x: 0, duration: .5, ease: 'elastic.out(1.2, .2)', clearProps: 'transform' });
    toast(on ? 'Modo Super Saiyan activado' : 'Vuelta al estado base');
  }
  function eggKeys() {
    let buf = '';
    addEventListener('keydown', e => {
      if (e.target.closest && e.target.closest('input, textarea')) return;
      if (e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-10);
      if (/(vegeta|kakarot|saiyan|9000)$/.test(buf)) { buf = ''; toggleSSJ(); }
    });
  }

  /* ---------- MIEDO: cartas apiladas ---------- */
  function fear() {
    const cards = $$('.fcard');
    cards.forEach((c, i) => c.style.setProperty('--i', i));
    cards.forEach((c, i) => {
      const next = cards[i + 1];
      if (!next) return;
      gsap.to(c, {
        scale: .92, filter: 'brightness(.5)', ease: 'none',
        scrollTrigger: { trigger: next, start: 'top 65%', end: 'top 15%', scrub: true }
      });
    });
    gsap.from('.fear__line', {
      yPercent: 70, opacity: 0, skewY: 5, stagger: .18, duration: 1.1, ease: 'expo.out',
      scrollTrigger: { trigger: '.fear__close', start: 'top 70%' }
    });
    gsap.from('.fear__sub', { opacity: 0, y: 30, duration: 1, delay: .6, scrollTrigger: { trigger: '.fear__close', start: 'top 70%' } });
    ScrollTrigger.create({ trigger: '.fear__line--gold', start: 'top 75%', once: true, onEnter: () => setTimeout(() => speedLines(.6), 500) });
  }

  /* ---------- EL PORQUÉ ---------- */
  function why() {
    gsap.fromTo('.why__media', { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: '.why__media', start: 'top 80%' } });
    gsap.from('.why__media img', { scale: 1.3, duration: 2, ease: 'expo.out', scrollTrigger: { trigger: '.why__media', start: 'top 80%' } });
    gsap.from('.why__copy > *, .why__quote p, .why__quote footer', { y: 40, opacity: 0, stagger: .1, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.why__copy', start: 'top 75%' } });
    gsap.from('.why__big', { y: 80, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.why__big', start: 'top 85%' } });
    const btn = $('.why__play');
    const vid = $('.why__media video');
    btn.addEventListener('click', () => {
      vid.hidden = false;
      btn.hidden = true;
      vid.play().catch(() => {});
    });
  }

  /* ---------- REELS ---------- */
  function reels() {
    const row = $('.reels__row');
    const lb = $('.lightbox');
    const lbv = lb.querySelector('video');
    let dragged = false;

    $$('.reel').forEach(r => {
      const v = r.querySelector('video');
      const load = () => { if (!v.src) v.src = r.dataset.src; };
      r.addEventListener('pointerenter', e => {
        if (e.pointerType !== 'mouse') return;
        load(); v.play().then(() => r.classList.add('is-playing')).catch(() => {});
      });
      r.addEventListener('pointerleave', () => { v.pause(); r.classList.remove('is-playing'); });
      r.addEventListener('click', () => {
        if (dragged) return;
        v.pause();
        lbv.src = r.dataset.src;
        lb.hidden = false;
        lbv.muted = false;
        lbv.play().catch(() => {});
        lb.querySelector('.lightbox__close').focus();
      });
    });
    const close = () => { lbv.pause(); lbv.removeAttribute('src'); lbv.load(); lb.hidden = true; };
    lb.addEventListener('click', e => { if (e.target !== lbv) close(); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) close(); });

    // Arrastrar con el ratón
    let down = false, sx = 0, sl = 0;
    row.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse') return;
      down = true; dragged = false; sx = e.clientX; sl = row.scrollLeft;
    });
    addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 6) { dragged = true; row.classList.add('is-drag'); }
      if (dragged) row.scrollLeft = sl - dx;
    });
    addEventListener('pointerup', () => {
      if (!down) return;
      down = false; row.classList.remove('is-drag');
      setTimeout(() => { dragged = false; }, 50);
    });
    // Rueda vertical → horizontal cuando el ratón está encima
    gsap.from('.reel', { y: 100, opacity: 0, stagger: .07, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: row, start: 'top 85%' } });
  }

  /* ---------- MUSCLE BEACH ---------- */
  function mb() {
    gsap.from('.mb__logo', { rotate: -12, scale: .6, opacity: 0, duration: 1.4, ease: 'elastic.out(1, .5)', scrollTrigger: { trigger: '.mb__head', start: 'top 78%' } });
    gsap.from('.tile', { y: 70, opacity: 0, stagger: .07, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.bento', start: 'top 82%' } });
    gsap.from('.mb__info > *', { y: 50, opacity: 0, stagger: .1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.mb__info', start: 'top 85%' } });
  }

  /* ---------- FINAL FLASH ---------- */
  function finalFlash() {
    const btn = $('.flashbtn');
    const hint = $('.flashbtn__hint');
    const sec = $('.final');
    const st = { p: 0 };
    let holding = false, raf = 0, burst = 0;

    const render = () => {
      btn.style.setProperty('--p', st.p.toFixed(3));
      if (holding && st.p < 1) hint.textContent = `Cargando ki… ${Math.round(st.p * 100)}%`;
    };
    function tick() {
      if (!holding) return;
      st.p = Math.min(1, st.p + (reduce ? .05 : .011));
      render();
      if (st.p >= 1) {
        btn.classList.add('is-full');
        btn.classList.remove('is-charging');
        hint.textContent = '¡Suelta!';
        return;
      }
      raf = requestAnimationFrame(tick);
    }
    btn.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      holding = true;
      btn.classList.add('is-charging');
      gsap.killTweensOf(st);
      cancelAnimationFrame(raf);
      tick();
    });
    let justFired = false;
    function fireFx() {
      flash(1, 1.4);
      speedLines(1.2);
      burst = 1;
      setTimeout(() => {
        st.p = 0; render();
        btn.classList.remove('is-full');
        hint.textContent = 'Mantén pulsado';
      }, 900);
    }
    const release = e => {
      if (!holding) return;
      holding = false;
      btn.classList.remove('is-charging');
      cancelAnimationFrame(raf);
      if (st.p >= 1 && e.type === 'pointerup') {
        // Se abre aquí (gesto del usuario) porque en móvil una pulsación larga no siempre genera click
        fireFx();
        justFired = true;
        setTimeout(() => { justFired = false; }, 800);
        window.open(btn.href, '_blank', 'noopener');
        return;
      }
      if (st.p < 1) {
        hint.textContent = 'Mantén pulsado';
        gsap.to(st, { p: 0, duration: .6, ease: 'power2.out', onUpdate: render });
      }
    };
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointercancel', release);
    btn.addEventListener('pointerleave', release);
    btn.addEventListener('contextmenu', e => e.preventDefault());
    btn.addEventListener('click', e => {
      if (justFired) { e.preventDefault(); justFired = false; return; }
      // Con puntero hay que cargar el ataque; con teclado (detail 0) abre directo
      if (e.detail !== 0) {
        e.preventDefault();
        gsap.fromTo(btn, { x: -8 }, { x: 0, duration: .5, ease: 'elastic.out(1.2, .25)' });
        return;
      }
      fireFx();
    });

    // Partículas de ki que convergen en el botón
    const c = $('.final__fx');
    if (!c || reduce) return;
    const ctx = c.getContext('2d');
    let W, H, parts = [], visible = false;
    function size() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = c.clientWidth; H = c.clientHeight;
      c.width = W * dpr; c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    addEventListener('resize', size);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop(); }).observe(sec);
    let rafL = 0;
    function loop() {
      cancelAnimationFrame(rafL);
      if (!visible) return;
      ctx.clearRect(0, 0, W, H);
      const br = btn.getBoundingClientRect(), cr = c.getBoundingClientRect();
      const cx = br.left + br.width / 2 - cr.left, cy = br.top + br.height / 2 - cr.top;
      const n = 1 + Math.floor(st.p * 6);
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, d = Math.max(W, H) * (.35 + Math.random() * .4);
        parts.push({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, life: 0, s: 1 + Math.random() * 2.2 });
      }
      ctx.globalCompositeOperation = 'lighter';
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life++;
        const pull = .012 + st.p * .06;
        p.x += (cx - p.x) * pull;
        p.y += (cy - p.y) * pull;
        const dist = Math.hypot(cx - p.x, cy - p.y);
        if (dist < 30 || p.life > 260) { parts.splice(i, 1); continue; }
        const al = Math.min(1, p.life / 30) * (.35 + st.p * .6);
        ctx.fillStyle = `rgba(255,${200 + Math.floor(st.p * 40)},90,${al})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill();
      }
      if (burst > 0) {
        const R = (1 - burst) * Math.max(W, H);
        const g = ctx.createRadialGradient(cx, cy, R * .6, cx, cy, R);
        g.addColorStop(0, 'rgba(255,230,140,0)');
        g.addColorStop(.8, `rgba(255,230,140,${burst * .8})`);
        g.addColorStop(1, 'rgba(255,230,140,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        burst = Math.max(0, burst - .02);
      }
      ctx.globalCompositeOperation = 'source-over';
      rafL = requestAnimationFrame(loop);
    }
    gsap.from('.final__title', { yPercent: 30, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.final', start: 'top 65%' } });
    gsap.from('.flashbtn', { scale: 0, rotate: -90, duration: 1.4, ease: 'elastic.out(1, .5)', scrollTrigger: { trigger: '.flashbtn', start: 'top 90%' } });
  }

  /* ---------- Cursor de ki + barra de progreso ---------- */
  function kiCursor() {
    if (!finePointer || reduce) return;
    const ki = $('.ki');
    const xTo = gsap.quickTo(ki, 'x', { duration: .35, ease: 'power3.out' });
    const yTo = gsap.quickTo(ki, 'y', { duration: .35, ease: 'power3.out' });
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      ki.classList.add('is-on');
      xTo(e.clientX); yTo(e.clientY);
      const t = e.target.closest && e.target.closest('a, button, .reel');
      ki.classList.toggle('is-big', !!t);
    });
    document.addEventListener('pointerleave', () => ki.classList.remove('is-on'));
  }
  function kiBar() {
    const bar = $('.kibar i');
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => { bar.style.transform = `scaleX(${s.progress})`; } });
  }

  /* ---------- Arranque ---------- */
  heroScroll();
  manifest();
  power();
  saga();
  scouter();
  majin();
  fear();
  why();
  reels();
  mb();
  finalFlash();
  kiCursor();
  kiBar();
  eggKeys();
  powerJitter();

  runLoader(() => {
    heroFX();
    heroIntro(() => body.classList.remove('is-loading'));
  });
  addEventListener('load', () => ScrollTrigger.refresh());
})();
