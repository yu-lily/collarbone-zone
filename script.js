"use strict";

document.documentElement.classList.add("js-font-loading");

document.querySelectorAll(".social-link").forEach((link) => {
  link.target = "_blank";
  link.rel = "noopener noreferrer";
});

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.finally(() => {
    document.documentElement.classList.remove("js-font-loading");
  });
} else {
  window.addEventListener("load", () => {
    document.documentElement.classList.remove("js-font-loading");
  });
}
