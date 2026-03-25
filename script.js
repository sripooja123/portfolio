(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Footer year
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Theme toggle (persist)
  const themeBtn = document.querySelector("[data-theme-toggle]");
  const getTheme = () => document.documentElement.getAttribute("data-theme") || "";
  const setTheme = (theme) => {
    if (theme) document.documentElement.setAttribute("data-theme", theme);
    else document.documentElement.removeAttribute("data-theme");
    try {
      if (theme) localStorage.setItem("theme", theme);
      else localStorage.removeItem("theme");
    } catch (_) {}
  };
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const cur = getTheme();
      setTheme(cur === "light" ? "dark" : "light");
    });
  }

  // Mobile nav toggle
  const navToggle = $("[data-nav-toggle]");
  const navLinks = $("[data-nav-links]");
  const closeNav = () => {
    if (!navToggle || !navLinks) return;
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  };
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // Close on link click (mobile)
    $$(".nav__link", navLinks).forEach((a) => a.addEventListener("click", closeNav));
    // Close on outside click
    document.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      if (navLinks.classList.contains("is-open")) {
        if (!navLinks.contains(t) && !navToggle.contains(t)) closeNav();
      }
    });
    // Close on escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });
  }

  // Smooth scroll (for same-page anchors)
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const a = t.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (href.length <= 1) return;
    const el = document.getElementById(href.slice(1));
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Scrollspy (active nav link)
  const navAnchors = $$(".nav__link").filter((a) => (a.getAttribute("href") || "").startsWith("#"));
  const ids = navAnchors
    .map((a) => (a.getAttribute("href") || "").slice(1))
    .filter(Boolean);
  const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
  const setActive = (id) => {
    navAnchors.forEach((a) => {
      const match = (a.getAttribute("href") || "") === `#${id}`;
      a.classList.toggle("is-active", match);
    });
  };
  if (sections.length) {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((en) => en.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
        if (visible && visible.target && visible.target.id) setActive(visible.target.id);
      },
      { root: null, rootMargin: "-25% 0px -65% 0px", threshold: [0.1, 0.2, 0.35] }
    );
    sections.forEach((s) => io.observe(s));
  }

  // Project filter
  const projectsRoot = $("[data-projects]");
  const filterBtns = $$("[data-filter]");
  const setFilterActive = (tag) => {
    filterBtns.forEach((b) => b.classList.toggle("is-active", b.dataset.filter === tag));
  };
  const applyFilter = (tag) => {
    if (!projectsRoot) return;
    const cards = $$(".project", projectsRoot);
    cards.forEach((card) => {
      const tags = (card.getAttribute("data-tags") || "").split(/\s+/).filter(Boolean);
      const show = tag === "all" ? true : tags.includes(tag);
      card.classList.toggle("is-hidden", !show);
    });
  };
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tag = btn.dataset.filter || "all";
      setFilterActive(tag);
      applyFilter(tag);
    });
  });

  // Contact form -> mailto
  const form = $("[data-contact-form]");
  if (form instanceof HTMLFormElement) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const email = String(fd.get("email") || "").trim();
      const message = String(fd.get("message") || "").trim();
      const subject = encodeURIComponent(`Portfolio contact from ${name || "someone"}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`
      );
      window.location.href = `mailto:sripooja782@gmail.com?subject=${subject}&body=${body}`;
      form.reset();
    });
  }

  // Print resume
  const printBtn = $("[data-print]");
  if (printBtn) printBtn.addEventListener("click", () => window.print());
})();

