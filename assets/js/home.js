(() => {
  const root = document.querySelector('.home-scroll');
  const intro = document.querySelector('.home-intro');
  const chapters = [...document.querySelectorAll('[data-chapter]')];
  if (!root || !chapters.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fields = [...document.querySelectorAll('[data-atmosphere]')].map(canvas => ({
    canvas, context: canvas.getContext('2d'), type: canvas.dataset.atmosphere,
    chapter: canvas.closest('[data-chapter]'), art: canvas.closest('.chapter-scene').querySelector('.chapter-art'),
    width: 0, height: 0, particles: [], visible: false, origin: null
  })).filter(field => field.context);
  let frame = 0;
  let departing = false;
  let atmosphereFrame = 0;
  let atmosphereTime = 0;
  const architecture = document.querySelector('.cpu-architecture');
  function randomizeCircuit() {
    if (!architecture) return;
    const routes = [...architecture.querySelectorAll('.cpu-io-signals use')];
    for (let side = 0; side < 4; side++) {
      const group = routes.filter(route => Number(route.dataset.pinSide) === side);
      for (let i = group.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [group[i], group[j]] = [group[j], group[i]];
      }
      group.forEach((route, i) => {
        const duration = 1.8 + Math.random() * 1.8;
        route.classList.toggle('is-energized', i < 10);
        route.style.setProperty('--flow-time', `${duration.toFixed(3)}s`);
        route.style.setProperty('--phase', `${(-Math.random() * duration).toFixed(3)}s`);
        route.style.setProperty('--conduct-opacity', (.45 + Math.random() * .35).toFixed(3));
      });
    }
    for (const route of architecture.querySelectorAll('.cpu-internal-signals path')) {
      const duration = 1.3 + Math.random() * 1.1;
      route.style.setProperty('--flow-time', `${duration.toFixed(3)}s`);
      route.style.setProperty('--phase', `${(-Math.random() * duration).toFixed(3)}s`);
    }
  }
  function phase(progress, start, end) {
    const value = Math.max(0, Math.min(1, (progress - start) / (end - start)));
    return value * value * (3 - 2 * value);
  }

  function ember(field, initial = false) {
    const origin = field.origin;
    const life = 3 + Math.random() * 3.5;
    return {
      x: origin.x + origin.width * (.16 + Math.random() * .68),
      y: origin.y + origin.height * (.75 + Math.random() * .2),
      age: initial ? Math.random() * life : 0, life,
      radius: .6 + Math.random() * 1.9,
      speed: 35 + Math.random() * 55,
      phase: Math.random() * Math.PI * 2
    };
  }
  function sizeField(field) {
    const rect = field.canvas.getBoundingClientRect();
    const art = field.art.getBoundingClientRect();
    field.origin = { x: art.left - rect.left, y: art.top - rect.top, width: art.width, height: art.height };
    if (field.width === rect.width && field.height === rect.height) return;
    field.width = rect.width;
    field.height = rect.height;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    field.canvas.width = Math.round(rect.width * ratio);
    field.canvas.height = Math.round(rect.height * ratio);
    field.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const small = field.width < 700;
    field.particles = Array.from({length: field.type === 'embers' ? (small ? 28 : 48) : (small ? 16 : 28)}, () => field.type === 'embers' ? ember(field, true) : ({
      x: Math.random() * field.width, y: Math.random() * field.height,
      radius: 3 + Math.random() * 4,
      speed: 26 + Math.random() * 28,
      phase: Math.random() * Math.PI * 2,
      angle: Math.random() * Math.PI * 2
    }));
  }
  function drawEmbers(field, elapsed, now) {
    const context = field.context;
    context.globalCompositeOperation = 'lighter';
    for (let i = 0; i < field.particles.length; i++) {
      let particle = field.particles[i];
      particle.age += elapsed;
      if (particle.age >= particle.life) particle = field.particles[i] = ember(field);
      const fraction = particle.age / particle.life;
      const alpha = Math.sin(fraction * Math.PI) * .8;
      const x = particle.x + Math.sin(particle.age * 1.4 + particle.phase) * 24;
      const y = particle.y - particle.age * particle.speed;
      context.fillStyle = 'rgba(255,' + Math.round(115 + 90 * (1 - fraction)) + ',56,' + alpha + ')';
      context.shadowBlur = particle.radius > 1.8 ? 7 : 0;
      context.shadowColor = '#e98237';
      context.beginPath();
      context.ellipse(x, y, particle.radius * .65, particle.radius * 1.4, Math.sin(now / 1700 + particle.phase) * .4, 0, Math.PI * 2);
      context.fill();
    }
    context.shadowBlur = 0;
    context.globalCompositeOperation = 'source-over';
  }
  function drawPetals(field, elapsed, now) {
    const context = field.context;
    for (const petal of field.particles) {
      petal.y += petal.speed * elapsed;
      petal.x += (10 + Math.sin(now / 1900 + petal.phase) * 18) * elapsed;
      if (petal.y > field.height + 12) { petal.y = -12; petal.x = Math.random() * field.width; }
      if (petal.x > field.width + 12) petal.x = -12;
      const radius = petal.radius;
      context.save();
      context.translate(petal.x, petal.y);
      context.rotate(petal.angle + now / 3400);
      context.scale(.65 + Math.sin(now / 1700 + petal.phase) * .35, 1);
      context.fillStyle = 'rgba(249,183,210,.7)';
      context.beginPath();
      context.moveTo(0, -radius);
      context.bezierCurveTo(radius * 1.2, -radius * .4, radius * .8, radius * .6, 0, radius);
      context.bezierCurveTo(-radius * .7, radius * .2, -radius * .6, -radius * .8, 0, -radius);
      context.fill();
      context.restore();
    }
  }
  function drawAtmospheres(now) {
    if (reduced.matches || document.hidden || departing || !fields.some(field => field.visible)) { atmosphereFrame = 0; return; }
    atmosphereFrame = requestAnimationFrame(drawAtmospheres);
    if (atmosphereTime && now - atmosphereTime < 1000 / 30) return;
    const elapsed = Math.min((now - (atmosphereTime || now)) / 1000, .05);
    atmosphereTime = now;
    for (const field of fields) {
      if (!field.visible) continue;
      field.context.clearRect(0, 0, field.width, field.height);
      if (field.type === 'embers') drawEmbers(field, elapsed, now);
      else drawPetals(field, elapsed, now);
    }
  }
  function syncAtmospheres() {
    const enabled = !reduced.matches && !document.hidden && !departing;
    for (const field of fields) {
      field.visible = enabled && field.chapter.classList.contains('is-current');
      if (field.visible) sizeField(field);
      else field.context.clearRect(0, 0, field.width, field.height);
    }
    if (fields.some(field => field.visible)) {
      if (!atmosphereFrame) atmosphereFrame = requestAnimationFrame(drawAtmospheres);
    } else {
      cancelAnimationFrame(atmosphereFrame);
      atmosphereFrame = 0;
      atmosphereTime = 0;
    }
  }
  function update() {
    frame = 0;
    if (document.hidden || departing) return;
    root.classList.remove('is-idle');
    root.dataset.scrollEffects = reduced.matches ? 'off' : 'on';
    const viewport = window.innerHeight;
    for (const chapter of chapters) {
      const rect = chapter.getBoundingClientRect();
      const academic = chapter.dataset.chapter === 'academic';
      const raw = reduced.matches ? 1 : Math.max(0, Math.min(1, (viewport * (academic ? .55 : .7) - rect.top) / (viewport * (academic ? 1.35 : 1.1))));
      const arrival = raw * raw * (3 - 2 * raw);
      // Fold only as the scene actually moves upward out of the viewport.
      // A pinned scene stays open; no extra scroll distance is used for closing.
      const sceneTop = chapter.querySelector('.chapter-scene').getBoundingClientRect().top;
      const departure = reduced.matches ? 1 : 1 - phase(-sceneTop, 0, viewport * .55);
      const progress = arrival * departure;
      const visible = rect.bottom > 0 && rect.top < viewport && departure > 0;
      if (academic && visible && !chapter.classList.contains('is-current')) randomizeCircuit();
      chapter.classList.toggle('is-current', visible);
      chapter.style.setProperty('--reveal', progress.toFixed(4));
      chapter.style.setProperty('--exit-visibility', departure.toFixed(4));
      chapter.style.setProperty('--scan-opacity', (4 * progress * (1 - progress)).toFixed(4));
      if (academic && architecture) {
        architecture.style.setProperty('--cpu-open', phase(progress, .05, .55).toFixed(4));
        architecture.style.setProperty('--cpu-core', phase(progress, .28, .58).toFixed(4));
        architecture.style.setProperty('--cpu-detail', phase(progress, .52, .82).toFixed(4));
        architecture.style.setProperty('--cpu-bus', phase(progress, .64, .94).toFixed(4));
        architecture.style.setProperty('--cpu-io', phase(progress, .16, .62).toFixed(4));
      }
    }
    const rect = intro?.getBoundingClientRect();
    intro?.classList.toggle('is-visible', !reduced.matches && rect.bottom > 0 && rect.top < viewport);
    syncAtmospheres();
  }
  function queue() {
    if (!frame && !document.hidden && !departing) frame = requestAnimationFrame(update);
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    root.classList.add('is-idle');
    intro?.classList.remove('is-visible');
    syncAtmospheres();
  }
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else queue(); });
  reduced.addEventListener('change', queue);
  window.addEventListener('pageswap', () => { departing = true; stop(); });
  window.addEventListener('pagehide', () => { departing = true; stop(); });
  window.addEventListener('pageshow', () => { departing = false; queue(); });
  update();
})();
