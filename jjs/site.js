for (const link of document.querySelectorAll("[data-wa]")) {
  const service = link.dataset.wa;
  const message = service
    ? "Olá, JJS! Gostaria de pedir um orçamento para " + service + "."
    : "Olá, JJS! Vi o site e gostaria de pedir um orçamento.";
  link.href = "https://wa.me/5531990907881?text=" + encodeURIComponent(message);
}

const dialog = document.querySelector("dialog");
const enlargedPhoto = dialog.querySelector("img");
for (const link of document.querySelectorAll("[data-photo]")) {
  link.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    enlargedPhoto.src = link.href;
    enlargedPhoto.alt = link.querySelector("img").alt;
    dialog.showModal();
  });
}
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#menu-principal");
menuToggle.hidden = false;
function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  navigation.classList.remove("is-open");
}
menuToggle.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  if (expanded) {
    closeMenu();
    return;
  }
  menuToggle.setAttribute("aria-expanded", "true");
  navigation.classList.add("is-open");
});
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation.classList.contains("is-open")) {
    closeMenu();
    menuToggle.focus();
  }
});
window.matchMedia("(min-width: 901px)").addEventListener("change", closeMenu);
