(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const volume = document.querySelector('.scroll-volume');
  const pages = document.querySelector('#scroll-pages');
  const opener = document.querySelector('.scroll-cover button');
  const links = [...document.querySelectorAll('.contents nav a')];
  const sections = links.map(link => document.querySelector(link.hash));
  const progress = document.querySelector('.reading-progress span');
  let open = false;
  let pendingScroll = 0;
  let frame = 0;
  function recordLocation(hash, replace = false) {
    if (location.hash === hash) return;
    try {
      if (replace) history.replaceState(null,'',hash);
      else history.pushState(null,'',hash);
    } catch {
      // Embedded previews may restrict history updates. Reading still works.
    }
  }

  function updateReadingPosition() {
    frame = 0;
    let current = sections[0];
    if (open) {
      const visible = sections.filter(section => section.getBoundingClientRect().top <= innerHeight * .42);
      current = visible.at(-1) ?? current;
      if (scrollY + innerHeight >= document.documentElement.scrollHeight - 3) current = sections.at(-1);
    }
    for (const link of links) {
      if (link.hash === '#'+current.id) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    }
    const {top,height} = volume.getBoundingClientRect();
    const read = open ? Math.max(0,Math.min(1,(innerHeight*.42-top)/height)) : 0;
    progress.style.transform = 'scaleX('+read+')';
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(updateReadingPosition);
  }
  function setOpen(next) {
    open = next;
    pages.inert = !next;
    volume.classList.toggle('unrolled',next);
    opener.setAttribute('aria-expanded',String(next));
    opener.querySelector('span').textContent = next ? '合上族谱 ↑' : '展开族谱 ↓';
    schedule();
  }
  function goTo(section, focus = false) {
    clearTimeout(pendingScroll);
    const wasOpen = open;
    if (section.id !== 'cover') setOpen(true);
    const scroll = () => {
      section.scrollIntoView({block:'start',behavior:reducedMotion.matches ? 'instant' : 'smooth'});
      if (focus) section.querySelector('h2')?.focus({preventScroll:true});
    };
    if (wasOpen || reducedMotion.matches || section.id === 'cover') scroll();
    else pendingScroll = setTimeout(scroll,760);
  }
  opener.addEventListener('click',() => {
    if (open) {
      clearTimeout(pendingScroll);
      setOpen(false);
      goTo(sections[0]);
      recordLocation('#cover',true);
    } else {
      goTo(sections[1],true);
      recordLocation('#lineage',true);
    }
  });
  for (const [index,link] of links.entries()) {
    link.addEventListener('click',event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      goTo(sections[index],true);
      recordLocation(link.hash);
    });
  }
  const fromHash = () => {
    const target = sections.find(section => '#'+section.id === location.hash);
    if (target) goTo(target);
    else if (location.hash === '#atlas') goTo(sections[2]);
  };
  addEventListener('hashchange',fromHash);
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule);
  setOpen(false);
  volume.classList.add('volume-ready');
  fromHash();
  schedule();
})();
