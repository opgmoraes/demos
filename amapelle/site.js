const select = (query, root = document) => root.querySelector(query);
const all = (query, root = document) => [...root.querySelectorAll(query)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function setupHeader() {
  const header = select('.header');
  const menu = select('#menu');
  const nav = select('.desktop-nav');
  const links = all('a', nav);
  let activeLink = null;
  const placeIndicator = () => {
    const indicator = select('.nav-indicator', nav);
    indicator.style.setProperty('--nav-x', (activeLink?.offsetLeft ?? 0) + 'px');
    indicator.style.setProperty('--nav-w', activeLink?.offsetWidth ?? 0);
  };
  const syncHeader = () => header.classList.toggle('scrolled', scrollY > 48);
  syncHeader();
  addEventListener('scroll', syncHeader, { passive: true });
  addEventListener('resize', placeIndicator);
  document.fonts.ready.then(placeIndicator);
  const sections = all('main section');
  const visible = new Set();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    const section = sections.find(item => visible.has(item));
    activeLink = links.find(link => link.hash === '#' + section?.id);
    for (const link of [...links, ...all('nav a', menu)]) {
      if (link.hash === activeLink?.hash) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    placeIndicator();
  }, { rootMargin: '-15% 0px -65% 0px' });
  sections.forEach(section => observer.observe(section));

  const trigger = select('.menu-toggle');
  trigger.addEventListener('click', () => menu.showModal());
  select('.close-menu').addEventListener('click', () => menu.close());
  menu.addEventListener('click', event => {
    if (event.target === menu || event.target.closest('a')) menu.close();
  });
  matchMedia('(min-width: 901px)').addEventListener('change', event => {
    if (event.matches && menu.open) menu.close();
  });

  const floating = select('.floating');
  new IntersectionObserver(([entry]) => {
    floating.hidden = entry.boundingClientRect.bottom > 0;
  }).observe(select('.hero'));
}

function setupTreatments() {
  const filters = select('.filters');
  const buttons = all('button', filters);
  const groups = all('[data-group]');
  const activate = (chosen) => {
    buttons.forEach(button => button.setAttribute('aria-pressed', button === chosen));
    groups.forEach(group => {
      const selected = group.dataset.group === chosen.dataset.filter;
      group.hidden = !selected;
      group.classList.toggle('active', selected);
    });
  };
  document.documentElement.classList.add('enhanced');
  filters.hidden = false;
  activate(buttons[0]);
  buttons.forEach(button => button.addEventListener('click', () => activate(button)));
}

function setupGallery() {
  const dialog = select('.lightbox');
  const photos = all('[data-gallery]');
  const picture = select('img', dialog);
  let index = 0;
  function show(position) {
    index = (position + photos.length) % photos.length;
    const photo = photos[index];
    picture.src = photo.href;
    picture.alt = select('img', photo).alt;
    select('figcaption', dialog).textContent = picture.alt;
  }
  photos.forEach((photo, position) => photo.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    show(position);
    dialog.showModal();
  }));
  select('.light-close').addEventListener('click', () => dialog.close());
  select('.previous', dialog).addEventListener('click', () => show(index - 1));
  select('.next', dialog).addEventListener('click', () => show(index + 1));
  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    }
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(index + (event.key === 'ArrowRight' ? 1 : -1));
    }
    if (event.key === 'Tab') {
      const buttons = all('button', dialog);
      if (event.shiftKey && document.activeElement === buttons[0]) {
        event.preventDefault();
        buttons.at(-1).focus();
      } else if (!event.shiftKey && document.activeElement === buttons.at(-1)) {
        event.preventDefault();
        buttons[0].focus();
      }
    }
  });
}

function setupComparisons() {
  all('.compare input').forEach(range => {
    const compare = range.parentElement;
    const update = () => {
      compare.style.setProperty('--split', range.value + '%');
      range.setAttribute('aria-valuetext', range.value + '% da foto de antes');
    };
    range.addEventListener('input', update);
    // Align touch and pointer movement with the visible handle across the full image.
    let start = null;
    range.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      start = event.clientX;
      range.setPointerCapture(event.pointerId);
      range.focus({ preventScroll: true });
      if (event.pointerType === 'mouse') move(event);
    });
    function move(event) {
      if (start === null || !event.isPrimary) return;
      const bounds = range.getBoundingClientRect();
      range.value = Math.round((event.clientX - bounds.left) * 100 / bounds.width);
      update();
    }
    range.addEventListener('pointermove', move);
    range.addEventListener('pointerup', event => {
      move(event);
      start = null;
    });
    range.addEventListener('lostpointercapture', () => { start = null; });
    update();
  });
}

function setupTestimonials() {
  const carousel = select('.testimonials');
  const track = select('.quotes', carousel);
  const slides = all('blockquote', track);
  const dots = all('.dots button', carousel);
  const toggle = select('.auto', carousel);
  let current = 0;
  let paused = reducedMotion.matches;
  let inView = false;
  let drag = null;
  const offsets = () => slides.map(slide => slide.offsetLeft - slides[0].offsetLeft);
  function selectSlide(index, smooth = !reducedMotion.matches) {
    current = (index + slides.length) % slides.length;
    track.scrollTo({ left: offsets()[current], behavior: smooth ? 'smooth' : 'instant' });
    syncDots();
  }
  function syncDots() {
    dots.forEach((dot, index) => dot.setAttribute('aria-current', index === current));
  }
  function syncToggle() {
    toggle.textContent = paused ? 'Ativar rotação' : 'Pausar rotação';
  }
  syncToggle();
  reducedMotion.addEventListener('change', event => {
    paused = event.matches;
    syncToggle();
  });
  toggle.addEventListener('click', () => {
    paused = !paused;
    syncToggle();
  });
  dots.forEach((dot, index) => dot.addEventListener('click', () => selectSlide(index)));
  select('.previous', carousel).addEventListener('click', () => selectSlide(current - 1));
  select('.next', carousel).addEventListener('click', () => selectSlide(current + 1));
  track.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    selectSlide(current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  track.addEventListener('scrollend', () => {
    const distances = offsets().map(offset => Math.abs(track.scrollLeft - offset));
    current = distances.indexOf(Math.min(...distances));
    syncDots();
  });
  track.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = { x: event.clientX, left: track.scrollLeft };
    track.setPointerCapture(event.pointerId);
    track.classList.add('dragging');
  });
  track.addEventListener('pointermove', event => {
    if (drag) track.scrollLeft = drag.left + drag.x - event.clientX;
  });
  track.addEventListener('lostpointercapture', () => {
    drag = null;
    const distances = offsets().map(offset => Math.abs(track.scrollLeft - offset));
    track.classList.remove('dragging');
    selectSlide(distances.indexOf(Math.min(...distances)));
  });
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }).observe(carousel);
  setInterval(() => {
    if (!paused && inView && !document.hidden && !carousel.matches(':hover,:focus-within') && !drag) {
      selectSlide(current + 1);
    }
  }, 6500);
}

function setupMedia() {
  all('.video').forEach(container => {
    const video = select('video', container);
    const play = select('.play', container);
    video.controls = false;
    play.hidden = false;
    play.addEventListener('click', async () => {
      video.controls = true;
      try {
        await video.play();
        play.hidden = true;
        video.focus({ preventScroll: true });
      } catch {
        play.hidden = true;
      }
    });
    video.addEventListener('play', () => {
      all('video').filter(other => other !== video).forEach(other => other.pause());
    });
  });
  const trigger = select('[data-map]');
  trigger.hidden = false;
  trigger.addEventListener('click', () => {
    const map = document.createElement('iframe');
    map.title = 'Mapa da Clínica Amapelle em Luziânia';
    map.referrerPolicy = 'strict-origin-when-cross-origin';
    map.src = 'https://maps.google.com/maps?q=-16.2502596,-47.9504578&z=17&output=embed';
    trigger.replaceWith(map);
    map.focus();
  });
}

if (select('.header')) {
  setupHeader();
  setupTreatments();
  setupGallery();
  setupComparisons();
  setupTestimonials();
  setupMedia();
  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  }, { threshold: .12 });
  all('.reveal').forEach(element => revealObserver.observe(element));
}
