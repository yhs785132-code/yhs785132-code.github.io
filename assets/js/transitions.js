(() => {
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const pages = new Map([
    ['index.html', 'home'], ['academic.html', 'academic'],
    ['games.html', 'games'], ['anime.html', 'anime']
  ]);
  const handoffKey = 'world-transition';
  let activeTransition;

  function worldAt(address) {
    if (!address) return null;
    try {
      const url = new URL(address, location.href);
      const directory = new URL('.', location.href);
      if (url.origin !== directory.origin || new URL('.', url).pathname !== directory.pathname) return null;
      return pages.get(url.pathname.split('/').pop() || 'index.html') || null;
    } catch { return null; }
  }

  function configure(transition, from, to, viewportFade = false) {
    // The outgoing ready promise rejects normally once its document is hidden.
    transition.ready.catch(() => {});
    transition.updateCallbackDone?.catch(() => {});
    if (!to || from === to) {
      transition.skipTransition();
      return;
    }
    activeTransition = transition;
    const homeNavigation = from === 'home' || to === 'home';
    const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0;
    root.style.setProperty('--world-viewport', `${Math.max(1, innerHeight - Math.max(0, headerBottom))}px`);
    if (homeNavigation && from) {
      // A home chapter can be far down the document. Capture the visible
      // viewport, then reveal the destination using that chapter's effect.
      root.dataset.transitionScope = 'viewport';
      root.dataset.worldTransition = reducedMotion.matches ? 'viewport-fade' : `${from}-to-${to}`;
    } else {
      root.dataset.worldTransition = viewportFade ? 'viewport-fade' : reducedMotion.matches || !from ? 'fade' : `${from}-to-${to}`;
    }
    const cleanup = () => {
      if (activeTransition !== transition) return;
      delete root.dataset.worldTransition;
      delete root.dataset.transitionScope;
      root.style.removeProperty('--world-viewport');
      activeTransition = undefined;
    };
    transition.finished.then(cleanup, cleanup);
  }

  function takeHandoff(to) {
    try {
      const stored = sessionStorage.getItem(handoffKey);
      sessionStorage.removeItem(handoffKey);
      const handoff = JSON.parse(stored);
      const age = Date.now() - handoff?.time;
      if (handoff?.to === to && age >= 0 && age < 5000 && [...pages.values()].includes(handoff.from)) return handoff;
    } catch {}
    return null;
  }

  window.addEventListener('pageswap', event => {
    document.querySelectorAll('audio, video').forEach(media => media.pause());
    if (event.viewTransition) {
      const from = worldAt(location.href);
      const to = worldAt(event.activation?.entry?.url);
      const viewportFade = (document.querySelector('.world-content')?.getBoundingClientRect().top || 0) < -1;
      // Some privacy settings omit activation.from. Pass only two world names
      // within this tab, then consume them on arrival. Never store URLs or identity.
      try {
        sessionStorage.removeItem(handoffKey);
        if (from && to && from !== to) sessionStorage.setItem(handoffKey, JSON.stringify({from, to, viewportFade, time: Date.now()}));
      } catch {}
      configure(event.viewTransition, from, to, viewportFade);
    }
  });

  // This file is deliberately loaded in the head without defer: pagereveal runs
  // before the first painted frame, including a page restored from the back cache.
  window.addEventListener('pagereveal', event => {
    const to = worldAt(location.href);
    const handoff = takeHandoff(to);
    if (event.viewTransition) {
      const from = worldAt(window.navigation?.activation?.from?.url) || handoff?.from;
      configure(event.viewTransition, from, to, handoff?.viewportFade === true);
    }
  });

  // The header stays outside spatial snapshots. A new interaction ends the
  // visual effect immediately, without waiting for the animation to finish.
  function finishEarly(event) {
    if (!activeTransition) return;
    // Snapshots can temporarily remove navigation from hit testing, including
    // the header during a scrolled-page fade. Preserve the first real click.
    const isPrimaryClick = event.type === 'pointerdown' && event.button === 0 &&
      event.isPrimary && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
    const link = isPrimaryClick && [...document.querySelectorAll('.home-page a[href], .site-header a[href]')].find(anchor => {
      const rect = anchor.getBoundingClientRect();
      return event.clientX >= rect.left && event.clientX <= rect.right &&
        event.clientY >= rect.top && event.clientY <= rect.bottom;
    });
    activeTransition.skipTransition();
    if (!link || event.target.closest?.('a') === link) return;
    const followLink = click => {
      clearTimeout(expiry);
      if (click.defaultPrevented || click.button !== 0 || click.ctrlKey || click.metaKey ||
          click.shiftKey || click.altKey || click.target.closest?.('a') ||
          Math.hypot(click.clientX - event.clientX, click.clientY - event.clientY) > 8) return;
      click.preventDefault();
      link.click();
    };
    document.addEventListener('click', followLink, {capture: true, once: true});
    const expiry = setTimeout(() => document.removeEventListener('click', followLink, true), 700);
  }
  document.addEventListener('pointerdown', finishEarly, {capture: true, passive: true});
  document.addEventListener('keydown', finishEarly, {capture: true});
  reducedMotion.addEventListener('change', finishEarly);
})();
