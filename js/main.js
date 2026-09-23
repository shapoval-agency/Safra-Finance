document.addEventListener("DOMContentLoaded", () => {
  initBurger();
  initDropdowns();
  initLangSwitcher();
  initHero();
  initLenis();
  initAOS();
  initFancybox();
  initSwiper();
  initCasesSwiper();
  initCitiesSwiper();
  initCitiesBoxSwiper();
  initReviews();
  initFaq();
  initFooterAccordion();
  initPopups();
  initGsap();
});

function initBurger() {
  const burger = document.querySelector(".burger");
  const menu = document.querySelector("#mobile-menu");
  if (!burger || !menu) return;

  const openLabel = "Відкрити меню";
  const closeLabel = "Закрити меню";

  function setOpen(isOpen) {
    burger.classList.toggle("is-active", isOpen);
    menu.classList.toggle("is-open", isOpen);
    menu.hidden = !isOpen;
    burger.setAttribute("aria-expanded", String(isOpen));
    burger.setAttribute("aria-label", isOpen ? closeLabel : openLabel);
    document.body.classList.toggle("is-menu-open", isOpen);

    if (!isOpen) closeAllDropdowns();
  }

  burger.addEventListener("click", () => {
    setOpen(menu.hidden);
  });

  menu.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) {
      setOpen(false);
      burger.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setOpen(false);
    }
  });
}

function closeDropdown(root) {
  const trigger = root.querySelector("[data-dropdown-trigger]");
  const menu = root.querySelector("[data-dropdown-menu]");
  if (!trigger || !menu) return;

  trigger.setAttribute("aria-expanded", "false");
  trigger.classList.remove("is-active");
  menu.classList.remove("is-open");
  menu.hidden = true;
}

function openDropdown(root) {
  const trigger = root.querySelector("[data-dropdown-trigger]");
  const menu = root.querySelector("[data-dropdown-menu]");
  if (!trigger || !menu) return;

  trigger.setAttribute("aria-expanded", "true");
  trigger.classList.add("is-active");
  menu.classList.add("is-open");
  menu.hidden = false;
}

function closeAllDropdowns(except = null) {
  document
    .querySelectorAll("[data-dropdown], .nav__item--dropdown, .menu__item--dropdown")
    .forEach((root) => {
      if (root === except) return;
      closeDropdown(root);
    });
}

function initDropdowns() {
  document
    .querySelectorAll("[data-dropdown], .nav__item--dropdown, .menu__item--dropdown")
    .forEach((root) => {
      const trigger = root.querySelector("[data-dropdown-trigger]");
      if (!trigger) return;

      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const isOpen = trigger.getAttribute("aria-expanded") === "true";
        closeAllDropdowns(root);

        if (isOpen) {
          closeDropdown(root);
        } else {
          openDropdown(root);
        }
      });
    });

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-dropdown], .nav__item--dropdown, .menu__item--dropdown")) {
      return;
    }
    closeAllDropdowns();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAllDropdowns();
  });
}

function initLangSwitcher() {
  const langs = document.querySelectorAll(".lang");
  if (!langs.length) return;

  langs.forEach((lang) => {
    const links = lang.querySelectorAll(".lang__link");

    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        // Убери preventDefault, когда появятся реальные URL языков
        event.preventDefault();

        const code = link.getAttribute("data-lang");
        if (!code) return;

        document.querySelectorAll("[data-lang-current]").forEach((current) => {
          current.textContent = code;
        });

        document.querySelectorAll(".lang__link").forEach((item) => {
          const active = item.getAttribute("data-lang") === code;
          item.classList.toggle("is-active", active);
          const option = item.closest('[role="option"]');
          if (option) option.setAttribute("aria-selected", String(active));
        });

        closeDropdown(lang);
      });
    });
  });
}

function initLenis() {
  if (typeof Lenis === "undefined") return;

  const lenis = new Lenis({
    duration: 1.2,
    smoothWheel: true,
  });

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  window.lenis = lenis;
}

function initAOS() {
  if (typeof AOS === "undefined") return;

  AOS.init({
    duration: 800,
    once: true,
    offset: 80,
  });
}

function initFancybox() {
  if (typeof Fancybox === "undefined") return;

  Fancybox.bind("[data-fancybox]", {});
}

function initSwiper() {
  if (typeof Swiper === "undefined") return;

  document.querySelectorAll(".js-swiper").forEach((el) => {
    new Swiper(el, {
      slidesPerView: 1,
      spaceBetween: 16,
      loop: true,
      pagination: {
        el: el.querySelector(".swiper-pagination"),
        clickable: true,
      },
      navigation: {
        nextEl: el.querySelector(".swiper-button-next"),
        prevEl: el.querySelector(".swiper-button-prev"),
      },
    });
  });
}

function initCasesSwiper() {
  if (typeof Swiper === "undefined") return;

  const root = document.querySelector(".cases");
  if (!root) return;

  const el = root.querySelector(".cases__swiper");
  const prevEl = root.querySelector(".cases__nav-prev");
  const nextEl = root.querySelector(".cases__nav-next");
  if (!el) return;

  new Swiper(el, {
    slidesPerView: "auto",
    spaceBetween: 16,
    speed: 450,
    grabCursor: true,
    watchOverflow: true,
    resistanceRatio: 0.65,
    touchStartPreventDefault: false,
    navigation: {
      prevEl,
      nextEl,
    },
    breakpoints: {
      1280: {
        spaceBetween: 24,
      },
    },
  });
}

function initCitiesSwiper() {
  if (typeof Swiper === "undefined") return;

  const root = document.querySelector(".cities");
  if (!root) return;

  const el = root.querySelector(".cities__swiper");
  const prevEl = root.querySelector(".cities__nav-prev");
  const nextEl = root.querySelector(".cities__nav-next");
  if (!el) return;

  new Swiper(el, {
    slidesPerView: "auto",
    spaceBetween: 16,
    speed: 450,
    grabCursor: true,
    watchOverflow: true,
    resistanceRatio: 0.65,
    touchStartPreventDefault: false,
    navigation: {
      prevEl,
      nextEl,
    },
    breakpoints: {
      1280: {
        spaceBetween: 8,
      },
    },
  });
}

function initCitiesBoxSwiper() {
  if (typeof Swiper === "undefined") return;

  const root = document.querySelector(".cities__box");
  if (!root) return;

  const el = root.querySelector(".cities__box-swiper");
  const prevEl = root.querySelector(".cities__box-nav-prev");
  const nextEl = root.querySelector(".cities__box-nav-next");
  const nav = root.querySelector(".cities__box-nav");
  if (!el) return;

  const mq = window.matchMedia("(max-width: 1279px)");
  let swiper = null;

  function enable() {
    if (nav) nav.hidden = false;
    if (swiper) {
      swiper.update();
      return;
    }

    swiper = new Swiper(el, {
      slidesPerView: "auto",
      spaceBetween: 8,
      speed: 450,
      grabCursor: true,
      watchOverflow: false,
      resistanceRatio: 0.65,
      touchStartPreventDefault: false,
      navigation: {
        prevEl,
        nextEl,
      },
    });
  }

  function disable() {
    if (swiper) {
      swiper.destroy(true, true);
      swiper = null;
    }

    if (nav) nav.hidden = true;
  }

  function sync() {
    if (mq.matches) enable();
    else disable();
  }

  sync();

  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", sync);
  } else {
    mq.addListener(sync);
  }
}

function initReviews() {
  const root = document.querySelector(".reviews");
  if (!root) return;

  const cards = [...root.querySelectorAll(".review-card")];
  const moreBtn = root.querySelector(".reviews__button");
  const moreCount = root.querySelector("[data-reviews-more-count]");
  const STEP = 4;
  let visible = cards.filter((card) => !card.hidden).length || STEP;

  function syncMoreButton() {
    if (!moreBtn) return;

    const remaining = cards.length - visible;

    if (remaining <= 0) {
      moreBtn.hidden = true;
      return;
    }

    moreBtn.hidden = false;
    if (moreCount) moreCount.textContent = String(Math.min(STEP, remaining));
  }

  function revealMore() {
    visible = Math.min(visible + STEP, cards.length);
    cards.forEach((card, index) => {
      card.hidden = index >= visible;
    });
    syncMoreButton();
  }

  function openReview(card) {
    if (typeof Fancybox === "undefined") return;

    const content = card.querySelector(".review-card__content");
    if (!content) return;

    const modal = document.createElement("div");
    modal.className = "review-modal";
    modal.appendChild(content.cloneNode(true));

    Fancybox.show(
      [
        {
          src: modal.outerHTML,
          type: "html",
        },
      ],
      {
        mainClass: "review-fancybox",
        autoFocus: false,
      }
    );
  }

  moreBtn?.addEventListener("click", revealMore);

  root.querySelector(".reviews__body")?.addEventListener("click", (event) => {
    const card = event.target.closest(".review-card");
    if (!card || card.hidden) return;
    openReview(card);
  });

  syncMoreButton();
}

function initFaq() {
  const root = document.querySelector(".faq");
  if (!root) return;

  const list = root.querySelector(".faq__list");
  const moreBtn = root.querySelector(".faq__button");
  const moreCount = root.querySelector("[data-faq-more-count]");
  const tabs = [...root.querySelectorAll("[data-faq-tab]")];
  if (!list) return;

  const STEP = 4;
  let activeCategory = "all";
  let visible = STEP;

  function getFilteredItems() {
    return [...list.querySelectorAll(".faq__item")].filter((item) => {
      if (activeCategory === "all") return true;
      return item.dataset.faqCategory === activeCategory;
    });
  }

  function closeItem(item) {
    const button = item.querySelector(".faq__item-button");
    const content = item.querySelector(".faq__item-content");
    item.classList.remove("is-open");
    if (button) button.setAttribute("aria-expanded", "false");
    if (content) content.hidden = true;
  }

  function openItem(item) {
    const button = item.querySelector(".faq__item-button");
    const content = item.querySelector(".faq__item-content");
    item.classList.add("is-open");
    if (button) button.setAttribute("aria-expanded", "true");
    if (content) content.hidden = false;
  }

  function toggleItem(item) {
    if (item.classList.contains("is-open")) closeItem(item);
    else openItem(item);
  }

  function syncList() {
    const filtered = getFilteredItems();
    const allItems = [...list.querySelectorAll(".faq__item")];

    allItems.forEach((item) => {
      const inCategory =
        activeCategory === "all" || item.dataset.faqCategory === activeCategory;
      const index = filtered.indexOf(item);
      const shouldShow = inCategory && index > -1 && index < visible;

      item.hidden = !shouldShow;
      if (!shouldShow) closeItem(item);
    });

    if (!moreBtn) return;

    const remaining = filtered.length - visible;
    if (remaining <= 0) {
      moreBtn.hidden = true;
      return;
    }

    moreBtn.hidden = false;
    if (moreCount) moreCount.textContent = String(Math.min(STEP, remaining));
  }

  list.addEventListener("click", (event) => {
    const button = event.target.closest(".faq__item-button");
    const header = event.target.closest(".faq__item-header");
    if (!button && !header) return;

    const item = event.target.closest(".faq__item");
    if (!item || item.hidden) return;
    toggleItem(item);
  });

  moreBtn?.addEventListener("click", () => {
    visible = Math.min(visible + STEP, getFilteredItems().length);
    syncList();
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeCategory = tab.dataset.faqTab || "all";
      visible = STEP;
      tabs.forEach((item) => {
        item.classList.toggle("is-active", item === tab);
      });
      syncList();
    });
  });

  syncList();
}

function initFooterAccordion() {
  const root = document.querySelector(".footer__bottom-content-accardion");
  if (!root) return;

  const items = [...root.querySelectorAll(".footer__bottom-content-accardion-item")];
  if (!items.length) return;

  function closeItem(item) {
    const button = item.querySelector(".footer__bottom-content-accardion-button");
    const panel = item.querySelector(".footer__bottom-content-accardion-panel");
    item.classList.remove("is-open");
    if (button) button.setAttribute("aria-expanded", "false");
    if (panel) panel.hidden = true;
  }

  function openItem(item) {
    items.forEach((other) => {
      if (other !== item) closeItem(other);
    });

    const button = item.querySelector(".footer__bottom-content-accardion-button");
    const panel = item.querySelector(".footer__bottom-content-accardion-panel");
    item.classList.add("is-open");
    if (button) button.setAttribute("aria-expanded", "true");
    if (panel) panel.hidden = false;
  }

  function toggleItem(item) {
    if (item.classList.contains("is-open")) closeItem(item);
    else openItem(item);
  }

  root.addEventListener("click", (event) => {
    const button = event.target.closest(".footer__bottom-content-accardion-button");
    if (!button || !root.contains(button)) return;

    const item = button.closest(".footer__bottom-content-accardion-item");
    if (!item) return;
    toggleItem(item);
  });
}

function initPopups() {
  const applyPopup = document.querySelector("#popup-apply");
  const successPopup = document.querySelector("#popup-success");
  const form = document.querySelector("#popup-apply-form");
  const ctaForm = document.querySelector("#cta-form");
  if (!successPopup) return;

  function lockScroll() {
    document.body.classList.add("is-popup-open");
    document.documentElement.classList.add("is-popup-open");
    window.lenis?.stop();
  }

  function unlockScroll() {
    if (applyPopup?.open || successPopup.open) return;
    document.body.classList.remove("is-popup-open");
    document.documentElement.classList.remove("is-popup-open");
    window.lenis?.start();
  }

  function openPopup(popup) {
    if (typeof popup.showModal === "function") popup.showModal();
    else popup.setAttribute("open", "");
    lockScroll();
  }

  function closePopup(popup) {
    if (!popup) return;
    if (typeof popup.close === "function") popup.close();
    else popup.removeAttribute("open");
    unlockScroll();
  }

  function openApply() {
    if (!applyPopup) return;
    closePopup(successPopup);
    openPopup(applyPopup);
  }

  function openSuccess() {
    if (applyPopup) closePopup(applyPopup);
    openPopup(successPopup);
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest('a[href="#apply"], [data-popup="apply"]');
    if (trigger) {
      event.preventDefault();
      openApply();
      return;
    }

    const closer = event.target.closest("[data-popup-close]");
    if (closer) {
      const popup = closer.closest("dialog.popup");
      if (popup) closePopup(popup);
    }
  });

  [applyPopup, successPopup].filter(Boolean).forEach((popup) => {
    popup.addEventListener("click", (event) => {
      if (event.target === popup) closePopup(popup);
    });

    popup.addEventListener("close", () => {
      unlockScroll();
    });
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    openSuccess();
    form.reset();
  });

  ctaForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!ctaForm.checkValidity()) {
      ctaForm.reportValidity();
      return;
    }
    openSuccess();
    ctaForm.reset();
  });
}

function initGsap() {
  if (typeof gsap === "undefined") return;
  if (typeof ScrollTrigger === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  gsap.registerPlugin(ScrollTrigger);

  const ease = "power2.out";

  function reveal(elements, options = {}) {
    const targets = gsap.utils.toArray(elements).filter(Boolean);
    if (!targets.length) return;

    gsap.from(targets, {
      opacity: 0,
      y: options.y ?? 40,
      duration: options.duration ?? 0.9,
      ease,
      stagger: options.stagger ?? 0,
      // Don't leave visibility/transform inline — breaks CSS :hover on cards
      clearProps: "opacity,visibility,transform",
      scrollTrigger: options.immediate
        ? undefined
        : {
            trigger: options.trigger || targets[0],
            start: options.start || "top 85%",
            toggleActions: "play none none none",
          },
    });
  }

  // Hero — entrance like Diia fadeIn
  reveal(
    [
      ".hero__titles",
      ".hero__subtitle",
      ".hero__cta-row",
      ".hero__controls",
      ".hero__cards .swiper-slide",
    ],
    { immediate: true, stagger: 0.1, y: 36, duration: 1 }
  );

  // Solutions
  gsap.set(".solutions .solution-card, .about__body .solution-card", {
    clearProps: "opacity,visibility,transform",
  });
  reveal(".solutions__header > *", {
    trigger: ".solutions",
    stagger: 0.12,
  });
  reveal(".solutions .solution-card", {
    trigger: ".solutions__list",
    stagger: 0.08,
    y: 32,
  });

  // Banner
  reveal([".banner__content > *", ".banner__action"], {
    trigger: ".banner",
    stagger: 0.1,
  });

  // Choose solution
  reveal(".choose-solution__header > *", {
    trigger: ".choose-solution",
    stagger: 0.1,
  });
  reveal(".choose-solution__card", {
    trigger: ".choose-solution__list",
    stagger: 0.1,
    y: 32,
  });

  // How it works
  reveal([".how-it-works__label", ".how-it-works__title", ".how-it-works__features .how-it-works__feature"], {
    trigger: ".how-it-works",
    stagger: 0.08,
  });
  reveal(".how-it-works__step", {
    trigger: ".how-it-works__steps",
    stagger: 0.12,
    y: 36,
  });

  // About
  reveal([".about__content-left > *", ".about__content-right"], {
    trigger: ".about",
    stagger: 0.12,
  });
  reveal(".about__body .solution-card", {
    trigger: ".about__body",
    stagger: 0.08,
    y: 28,
  });

  // Cases
  reveal([".cases__content > *", ".cases__nav"], {
    trigger: ".cases",
    stagger: 0.1,
  });
  reveal(".cases__swiper-slide", {
    trigger: ".cases__swiper",
    stagger: 0.08,
    y: 32,
  });

  // Reviews — animate body as a whole (cards use [hidden] for show-more)
  gsap.set(".reviews .review-card", { clearProps: "opacity,visibility,transform" });
  reveal([".reviews__content > *", ".reviews__link"], {
    trigger: ".reviews",
    stagger: 0.1,
  });
  reveal(".reviews__body", {
    trigger: ".reviews",
    y: 28,
  });

  // CTA
  reveal([".cta__image", ".cta__content > *"], {
    trigger: ".cta",
    stagger: 0.1,
  });

  // FAQ — animate list as a whole (items use [hidden] for tabs/show-more)
  gsap.set(".faq__item", { clearProps: "opacity,visibility,transform" });
  reveal([".faq__content > *", ".faq__link", ".faq__tabs"], {
    trigger: ".faq",
    stagger: 0.08,
    y: 28,
  });
  reveal(".faq__list", {
    trigger: ".faq",
    y: 28,
  });
  reveal(".faq__button", {
    trigger: ".faq",
    y: 20,
  });

  // Info / legal
  reveal([".info__content > *", ".info__body-item"], {
    trigger: ".info",
    stagger: 0.08,
  });

  // Cities
  reveal([".cities__content > *", ".cities__subtitle", ".cities__box"], {
    trigger: ".cities",
    stagger: 0.12,
    y: 36,
  });

  // SEO
  reveal([".seo__content > *", ".seo__right"], {
    trigger: ".seo",
    stagger: 0.12,
  });

  // Footer
  reveal([".footer__top > *", ".footer__bottom > *"], {
    trigger: ".footer",
    stagger: 0.1,
    y: 28,
    start: "top 90%",
  });
}
