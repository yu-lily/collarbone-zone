"use strict";

document.querySelectorAll("a[target='_blank']").forEach((link) => {
  link.rel = "noopener noreferrer";
});
