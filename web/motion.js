export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const ease = 'cubic-bezier(.22,1,.36,1)';
const activeDetails = new WeakMap();

export function enterDetail(element) {
  if (reducedMotion.matches) return;
  activeDetails.get(element)?.cancel();
  activeDetails.set(element,element.animate([
    {opacity:.35,transform:'translateY(9px)'},
    {opacity:1,transform:'translateY(0)'}
  ],{duration:440,easing:ease}));
}

export function setupMotion() {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const {target,isIntersecting} of entries) {
        if (!isIntersecting) continue;
        observer.unobserve(target);
        target.classList.add('revealed');
      }
    },{threshold:.12});
    document.querySelectorAll('.atlas,.feature .intro,.people-panel,.record-grid').forEach(element => {
      element.classList.add('reveal');
      observer.observe(element);
    });
  }
  for (const surface of document.querySelectorAll('.hero,.atlas')) {
    let frame = 0;
    let point;
    surface.addEventListener('pointermove',event => {
      if (!finePointer.matches || reducedMotion.matches || event.pointerType !== 'mouse') return;
      point = [event.clientX,event.clientY];
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const bounds = surface.getBoundingClientRect();
        surface.style.setProperty('--light-x',point[0]-bounds.left+'px');
        surface.style.setProperty('--light-y',point[1]-bounds.top+'px');
        surface.classList.add('lit');
      });
    });
    surface.addEventListener('pointerleave',() => {
      cancelAnimationFrame(frame);
      frame = 0;
      surface.classList.remove('lit');
    });
  }
  const button = document.querySelector('.magnetic');

  button.addEventListener('pointermove',event => {
    if (!finePointer.matches || reducedMotion.matches || event.pointerType !== 'mouse') return;
    const bounds = button.getBoundingClientRect();
    const current = new DOMMatrix(getComputedStyle(button).transform);
    button.style.setProperty('--button-x',(event.clientX-bounds.left-bounds.width/2+current.m41)*.13+'px');
    button.style.setProperty('--button-y',(event.clientY-bounds.top-bounds.height/2+current.m42)*.26+'px');
  });
  button.addEventListener('pointerleave',() => {
    button.style.removeProperty('--button-x');
    button.style.removeProperty('--button-y');
  });
}
