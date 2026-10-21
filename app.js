/* Shirt photos live in images/colors/<color>-front.jpg and -back.jpg.
   images/hero.jpg is the Dark Green front. images/founders.jpg appears if added.
   Signups stay in this browser until a list is connected.
*/
(function () {
  const SIGNUP_KEY = "stryde-drop-01";
  const DYE_KEY = "stryde-dye";

  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  const dyeInputs = [...document.querySelectorAll('input[name="dye"]')];
  const viewFront = document.getElementById("view-front");
  const viewBack = document.getElementById("view-back");
  const form = document.getElementById("drop-form");
  const success = document.getElementById("drop-success");
  let dyeAnnounced = false;
  let view = "front";

  function selectedDye() {
    return dyeInputs.find((input) => input.checked) || dyeInputs[0];
  }

  function selectedSize() {
    return document.querySelector('input[name="size"]:checked');
  }

  function holdingText() {
    const name = selectedDye().dataset.name;
    const size = selectedSize();
    return size ? `Holding a ${name} tee, size ${size.value}.` : `Holding a ${name} tee.`;
  }

  function syncDye() {
    const dye = selectedDye();
    const name = dye.dataset.name;
    document.getElementById("stage-index").textContent = dye.dataset.index;
    document.getElementById("stage-name").textContent = name;
    document.getElementById("stage-note").textContent = dye.dataset.note;
    document.getElementById("stage-join").textContent = `Join in ${name}`;
    document.getElementById("holding").textContent = holdingText();
    document.querySelectorAll(".swatch").forEach((swatch) => {
      const input = swatch.querySelector("input");
      const img = swatch.querySelector("img");
      const url = view === "back" ? input.dataset.back : input.dataset.front;
      if (img.getAttribute("src") !== url) img.src = url;
    });
    viewFront.setAttribute("aria-pressed", String(view === "front"));
    viewBack.setAttribute("aria-pressed", String(view === "back"));
    if (dyeAnnounced) {
      document.getElementById("stage-live").textContent = `Selected ${name}, ${view} view.`;
    }
    dyeAnnounced = true;
    try { sessionStorage.setItem(DYE_KEY, dye.value); } catch (_) { /* private mode */ }
  }

  function mountSwatch(img) {
    const swatch = img.closest(".swatch");
    const reveal = () => {
      if (img.naturalWidth > 0) swatch.classList.add("has-photo");
    };
    const hide = () => { img.hidden = true; };
    img.addEventListener("load", reveal);
    img.addEventListener("error", hide);
    if (img.complete && img.naturalWidth > 0) reveal();
    else if (img.complete) hide();
  }

  function mountHero() {
    const shot = document.querySelector(".hero-shot");
    const media = document.getElementById("hero-media");
    const mark = document.querySelector(".hero-mark");
    const reveal = () => {
      if (!shot.naturalWidth) return;
      media.classList.add("has-photo");
      mark.alt = "";
      mark.setAttribute("aria-hidden", "true");
    };
    const hide = () => { shot.hidden = true; };
    shot.addEventListener("load", reveal);
    shot.addEventListener("error", hide);
    if (shot.complete && shot.naturalWidth > 0) reveal();
    else if (shot.complete) hide();
  }

  function mountFounders() {
    const figure = document.querySelector(".founders");
    const img = figure.querySelector("img");
    const reveal = () => {
      if (img.naturalWidth > 0) figure.hidden = false;
    };
    img.addEventListener("load", reveal);
    img.addEventListener("error", () => { figure.hidden = true; });
    if (img.complete && img.naturalWidth > 0) reveal();
  }

  function readSignup() {
    try { return JSON.parse(localStorage.getItem(SIGNUP_KEY) || "null"); }
    catch (_) { return null; }
  }

  function writeSignup(entry) {
    try { localStorage.setItem(SIGNUP_KEY, JSON.stringify(entry)); }
    catch (_) { /* the note still shows for this visit */ }
  }

  function signupCopy(entry) {
    const sizeBit = entry.size ? ` in size ${entry.size}` : "";
    return `The ${entry.colorName} Performance Tee${sizeBit} is noted for ${entry.email}. We'll write when Drop 01 is ready to order.`;
  }

  function showSuccess(entry) {
    document.getElementById("success-copy").textContent = signupCopy(entry);
    form.hidden = true;
    success.hidden = false;
  }

  function showForm() {
    success.hidden = true;
    form.hidden = false;
  }

  dyeInputs.forEach((input) => {
    input.addEventListener("change", syncDye);
    ["front", "back"].forEach((side) => {
      const preload = new Image();
      preload.src = input.dataset[side];
    });
  });

  viewFront.addEventListener("click", () => {
    if (view === "front") return;
    view = "front";
    syncDye();
  });

  viewBack.addEventListener("click", () => {
    if (view === "back") return;
    view = "back";
    syncDye();
  });
  document.querySelectorAll('input[name="size"]').forEach((input) => {
    input.addEventListener("change", () => {
      document.getElementById("holding").textContent = holdingText();
    });
  });

  try {
    const savedDye = sessionStorage.getItem(DYE_KEY);
    const match = dyeInputs.find((input) => input.value === savedDye);
    if (match) match.checked = true;
  } catch (_) { /* ignore */ }

  syncDye();
  document.querySelectorAll(".swatch .chip img").forEach(mountSwatch);
  mountHero();
  mountFounders();

  document.getElementById("stage-join").addEventListener("click", () => {
    window.setTimeout(() => {
      if (!form.hidden) document.getElementById("email").focus({ preventScroll: true });
    }, 350);
  });

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "Close" : "Menu";
    document.body.style.overflow = open ? "hidden" : "";
  }

  toggle.addEventListener("click", () => {
    setMenu(!nav.classList.contains("is-open"));
  });

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      setMenu(false);
      toggle.focus();
    }
  });

  window.addEventListener("scroll", () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 4);
  }, { passive: true });

  const existing = readSignup();
  if (existing && existing.email) showSuccess(existing);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const dye = selectedDye();
    const size = selectedSize();
    const entry = {
      email,
      color: dye.value,
      colorName: dye.dataset.name,
      size: size ? size.value : "",
      at: new Date().toISOString()
    };
    writeSignup(entry);
    showSuccess(entry);
  });

  document.getElementById("success-reset").addEventListener("click", () => {
    try { localStorage.removeItem(SIGNUP_KEY); } catch (_) { /* ignore */ }
    showForm();
    document.getElementById("email").focus();
  });
})();
