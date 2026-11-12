for (const range of document.querySelectorAll(".case input[type=range]")) {
  const comparison = range.closest(".compare");
  range.addEventListener("input", () => {
    comparison.style.setProperty("--split", range.value + "%");
  });
}


const gallery = document.querySelector("#galeria-resultados");
const controls = document.querySelector(".case-nav");
const position = document.querySelector(".case-position");
const cards = Array.from(gallery.querySelectorAll(".case"));
const [previous, next] = controls.querySelectorAll("button");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

function updateGalleryControls() {
  const overflow = gallery.scrollWidth - gallery.clientWidth;
  controls.hidden = overflow < 2;
  previous.disabled = gallery.scrollLeft < 2;
  next.disabled = gallery.scrollLeft >= overflow - 2;
  const viewport = gallery.getBoundingClientRect();
  const visibleCards = cards.filter((card) => {
    const frame = card.getBoundingClientRect();
    const visibleWidth = Math.min(frame.right, viewport.right) - Math.max(frame.left, viewport.left);
    return visibleWidth >= frame.width / 2;
  });
  const first = cards.indexOf(visibleCards[0]) + 1;
  const last = cards.indexOf(visibleCards.at(-1)) + 1;
  position.hidden = overflow < 2 || first === 0;
  const label = first === last ? first : first + "–" + last;
  position.textContent = label + " de " + cards.length;
}

for (const button of [previous, next]) {
  button.addEventListener("click", () => {
    const firstCard = gallery.querySelector(".case");
    const gap = parseFloat(getComputedStyle(gallery).columnGap);
    const step = firstCard.offsetWidth + gap;
    gallery.scrollBy({
      left: Number(button.dataset.step) * step,
      behavior: reducedMotion.matches ? "instant" : "smooth",
    });
  });
}
gallery.addEventListener("scroll", updateGalleryControls, { passive: true });
new ResizeObserver(updateGalleryControls).observe(gallery);
updateGalleryControls();

if (!reducedMotion.matches && "IntersectionObserver" in window) {
  const reveal = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.animate(
        [{ opacity: .65, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" }
      );
      reveal.unobserve(entry.target);
    }
  }, { threshold: .2 });
  document.querySelectorAll(".section h2, .hero-portrait").forEach((element) => reveal.observe(element));
}
