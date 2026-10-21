(() => {
  "use strict";

  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("toggle");
  const openTrigger = document.getElementById("openTrigger");
  const scrim = document.getElementById("scrim");
  const body = document.body;
  const mobileQuery = window.matchMedia("(max-width: 768px)");

  if (!sidebar || !toggleBtn || !openTrigger || !scrim) return;

  let isOpen = !mobileQuery.matches;

  const render = () => {
    sidebar.dataset.state = isOpen ? "open" : "collapsed";
    body.dataset.sidebar = isOpen ? "open" : "closed";

    const expandedLabel = mobileQuery.matches ? "Close menu" : "Collapse sidebar";
    const collapsedLabel = mobileQuery.matches ? "Open menu" : "Expand sidebar";
    toggleBtn.setAttribute("aria-expanded", String(isOpen));
    toggleBtn.setAttribute("aria-label", isOpen ? expandedLabel : collapsedLabel);
    openTrigger.setAttribute("aria-expanded", String(isOpen));
  };

  const open = (focusTarget) => {
    isOpen = true;
    render();
    if (focusTarget) focusTarget.focus();
  };

  const close = (focusTarget) => {
    isOpen = false;
    render();
    if (focusTarget) focusTarget.focus();
  };

  const toggle = () => {
    if (isOpen) {
      close(mobileQuery.matches ? openTrigger : null);
    } else {
      const firstLink = sidebar.querySelector(".nav-link");
      open(mobileQuery.matches ? firstLink : null);
    }
  };

  toggleBtn.addEventListener("click", toggle);
  openTrigger.addEventListener("click", () => open(sidebar.querySelector(".nav-link")));

  scrim.addEventListener("click", () => {
    if (mobileQuery.matches && isOpen) close(openTrigger);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileQuery.matches && isOpen) {
      close(openTrigger);
    }
  });

  mobileQuery.addEventListener("change", (event) => {
    isOpen = !event.matches;
    render();
  });

  const navLinks = Array.from(sidebar.querySelectorAll(".nav-link"));
  const pageTitle = document.getElementById("pageTitle");

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.forEach((other) => {
        other.classList.remove("is-active");
        other.removeAttribute("aria-current");
      });
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");

      const label = link.querySelector(".nav-link__label");
      if (pageTitle && label) pageTitle.textContent = label.textContent;
    });
  });

  render();
})();
