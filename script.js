"use strict";
/* Gallery: filters, photo zoom (mouse AND keyboard), arrows to change photo. */
function filtrer(categorie, bouton) {
  document.querySelectorAll(".filtres button").forEach(btn => {
    btn.classList.remove("selectionne");
    btn.setAttribute("aria-pressed", "false");
  });
  bouton.classList.add("selectionne");
  bouton.setAttribute("aria-pressed", "true");
  document.querySelectorAll(".image-galerie").forEach(image => {
    image.style.display = (categorie === "toutes" || image.classList.contains(categorie)) ? "block" : "none";
  });
}

let imageOuverte = null;
function photosVisibles() {
  return [...document.querySelectorAll("img[onclick]")].filter(img => img.offsetParent !== null);
}
function agrandir(image) {
  const modal = document.getElementById("modal"), grande = document.getElementById("grandeImage");
  if (!modal || !grande) return;
  imageOuverte = image;
  grande.src = image.src;
  grande.alt = image.alt || "Photo agrandie";
  modal.style.display = "flex";
  const fermerBtn = modal.querySelector("button");
  if (fermerBtn) fermerBtn.focus();
}
function fermer() {
  const modal = document.getElementById("modal");
  if (!modal || modal.style.display !== "flex") return;
  modal.style.display = "none";
  if (imageOuverte) imageOuverte.focus();
  imageOuverte = null;
}
function fermerModal(event) { if (event.target.id === "modal") fermer(); }
function changerPhoto(sens) {
  const photos = photosVisibles();
  if (!imageOuverte || photos.length < 2) return;
  const i = photos.indexOf(imageOuverte);
  agrandir(photos[(i + sens + photos.length) % photos.length]);
}

document.addEventListener("keydown", e => {
  const modal = document.getElementById("modal");
  if (!modal || modal.style.display !== "flex") return;
  if (e.key === "Escape") fermer();
  if (e.key === "ArrowRight") changerPhoto(1);
  if (e.key === "ArrowLeft") changerPhoto(-1);
});

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  if (modal) {
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Photo agrandie");
    const btn = modal.querySelector("button");
    if (btn) btn.setAttribute("aria-label", "Fermer la photo");
  }
  // Clickable photos also become usable with the keyboard (Tab then Enter).
  document.querySelectorAll("img[onclick]").forEach(img => {
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", "Agrandir : " + (img.alt || "photo"));
    img.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); agrandir(img); }
    });
  });
  document.querySelectorAll(".filtres button").forEach(btn => {
    btn.setAttribute("aria-pressed", btn.classList.contains("selectionne") ? "true" : "false");
  });
});
