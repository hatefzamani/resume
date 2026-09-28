(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;
  const running = new Set();
  function animate(el, frames, options) {
    const animation = el.animate(frames, options);
    running.add(animation);
    animation.finished.catch(() => {}).finally(() => running.delete(animation));
    return animation;
  }
  const easing = 'cubic-bezier(.22,1,.36,1)';
  document.querySelectorAll('.intro .eyebrow,.intro h1,.intro-bottom,.intro .text-link').forEach((el,i) => {
    animate(el,[{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],{duration:850,delay:80+i*110,easing,fill:'backwards'});
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({target,isIntersecting}) => {
      if (!isIntersecting) return;
      observer.unobserve(target);
      if (reduced.matches) return;
      animate(target,[{opacity:.15,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],{duration:720,easing});
    });
  },{threshold:.08});
  document.querySelectorAll('.section-heading,.job,.earlier,.skill-columns>div,.education,.recognition,.contact').forEach(el => observer.observe(el));
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden','true');
  document.body.append(progress);
  let scheduled = false;
  function update() {
    const max = document.documentElement.scrollHeight-innerHeight;
    progress.style.transform = 'scaleX('+(max>0?Math.min(1,Math.max(0,scrollY/max)):0)+')';
    document.querySelector('header').classList.toggle('is-scrolled',scrollY>12);
    scheduled=false;
  }
  function schedule() { if (!scheduled) { scheduled=true; requestAnimationFrame(update); } }
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule);
  document.querySelector('details')?.addEventListener('toggle',schedule);
  update();
  const card = document.querySelector('.current');
  let cardAnimation;
  if(matchMedia('(hover:hover) and (pointer:fine)').matches && card) {
    card.addEventListener('pointermove',e=>{
      if(reduced.matches) return;
      const box=card.getBoundingClientRect();
      const x=(e.clientX-box.left)/box.width-.5;
      const y=(e.clientY-box.top)/box.height-.5;
      cardAnimation?.cancel();
      card.style.transform='perspective(900px) rotateX('+(-y*3)+'deg) rotateY('+(x*4)+'deg) translateY(-2px)';
    });
    card.addEventListener('pointerleave',()=>{
      const from=card.style.transform;
      card.style.transform='';
      if(!reduced.matches) cardAnimation=animate(card,[{transform:from},{transform:'none'}],{duration:500,easing});
    });
  }
  document.querySelectorAll('.text-link,.email').forEach(link=>{
    const arrow=link.querySelector('span');
    link.addEventListener('pointerenter',()=>{
      if(arrow&&!reduced.matches) animate(arrow,[{transform:'translate(0,0)'},{transform:'translate(4px,-4px)'},{transform:'translate(0,0)'}],{duration:550,easing});
    });
  });
  reduced.addEventListener('change',()=>{
    if(!reduced.matches) return;
    observer.disconnect();
    running.forEach(a=>a.cancel());
    if(card) card.style.transform='';
    progress.remove();
    removeEventListener('scroll',schedule);
    removeEventListener('resize',schedule);
  });
})();
