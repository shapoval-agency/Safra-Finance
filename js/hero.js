function initHero() {
  const root = document.querySelector("[data-hero]");
  if (!root) return;

  initHeroVideo(root);

  if (typeof Swiper === "undefined") return;

  const AUTOPLAY_MS = 5000;

  const slides = [
    {
      sub: "Кредити та лізинг для бізнесу і приватних клієнтів — коли для наступного кроку потрібне фінансування.",
      cta: "Отримати фінансування",
    },
    {
      sub: "Фінансування закупівлі товарів і сировини, сезонних потреб, виконання контрактів та поточної діяльності.",
      cta: "Поповнити обігові кошти",
    },
    {
      sub: "Кредит або лізинг на легкові автомобілі, комерційний транспорт, сільськогосподарську та спеціальну техніку.",
      cta: "Придбати авто або техніку",
    },
    {
      sub: "Фінансування придбання обладнання, виробничих потужностей, офісної, торговельної та комерційної нерухомості.",
      cta: "Отримати фінансування",
    },
    {
      sub: "Кредити для приватних клієнтів під заставу нерухомості або автомобіля — на значні покупки, інвестиції та інші потреби.",
      cta: "Отримати кошти",
    },
  ];

  const titleEls = [...root.querySelectorAll("[data-hero-title]")];
  const subtitleEl = root.querySelector("[data-hero-subtitle]");
  const ctaEl = root.querySelector("[data-hero-cta]");
  const swiperEl = root.querySelector("[data-hero-swiper]");
  const btnPrev = root.querySelector("[data-hero-prev]");
  const btnNext = root.querySelector("[data-hero-next]");
  const gradients = [...root.querySelectorAll("[data-hero-gradient]")];

  if (!titleEls.length || !subtitleEl || !ctaEl || !swiperEl) return;

  let active = 0;
  let rafId = null;
  let startTime = null;

  const swiper = new Swiper(swiperEl, {
    slidesPerView: "auto",
    spaceBetween: 16,
    speed: 450,
    watchOverflow: true,
    grabCursor: true,
    breakpoints: {
      0: {
        slidesPerView: "auto",
        spaceBetween: 8,
      },
      1280: {
        slidesPerView: "auto",
        spaceBetween: 16,
      },
    },
  });

  function getCards() {
    return [...swiperEl.querySelectorAll("[data-hero-slide]")];
  }

  function syncContent(index) {
    const slide = slides[index];
    if (!slide) return;

    titleEls.forEach((titleEl) => {
      const isActive = Number(titleEl.getAttribute("data-hero-title")) === index;
      titleEl.classList.toggle("is-active", isActive);
      titleEl.setAttribute("aria-hidden", isActive ? "false" : "true");
    });

    subtitleEl.innerHTML = slide.sub;
    ctaEl.textContent = slide.cta;

    getCards().forEach((card, i) => {
      const isActive = i === index;
      card.classList.toggle("is-active", isActive);
      card.setAttribute("aria-current", isActive ? "true" : "false");

      const fill = card.querySelector(".hero-card__progress-fill");
      if (fill) fill.style.width = "0%";
    });

    gradients.forEach((gradient, i) => {
      gradient.classList.toggle("is-active", i === index);
    });
  }

  function stopProgress() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function startProgress() {
    stopProgress();

    const fill = getCards()[active]?.querySelector(".hero-card__progress-fill");
    if (!fill) return;

    fill.style.width = "0%";
    startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / AUTOPLAY_MS, 1);
      fill.style.width = `${progress * 100}%`;

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        goTo(active + 1);
      }
    }

    rafId = requestAnimationFrame(tick);
  }

  function goTo(index) {
    active = ((index % slides.length) + slides.length) % slides.length;
    syncContent(active);
    startProgress();
    swiper.slideTo(active);
  }

  getCards().forEach((card, index) => {
    card.addEventListener("click", () => goTo(index));
  });

  btnPrev?.addEventListener("click", () => goTo(active - 1));
  btnNext?.addEventListener("click", () => goTo(active + 1));

  swiperEl.addEventListener("touchstart", stopProgress, { passive: true });
  swiperEl.addEventListener("touchend", () => startProgress(), { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopProgress();
    else startProgress();
  });

  goTo(0);
}

function initHeroVideo(root) {
  const desktop = root.querySelector(".hero__video--desktop");
  const mobile = root.querySelector(".hero__video--mobile");
  if (!desktop || !mobile) return;

  const mq = window.matchMedia("(min-width: 1280px)");

  function loadAndPlay(video) {
    const src = video.getAttribute("data-src");
    if (!src) return;

    if (video.dataset.loaded !== "true") {
      video.src = src;
      video.dataset.loaded = "true";
      video.load();
    }

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }

  function stopVideo(video) {
    video.pause();
    video.currentTime = 0;
  }

  function apply() {
    if (mq.matches) {
      stopVideo(mobile);
      loadAndPlay(desktop);
      return;
    }

    stopVideo(desktop);
    loadAndPlay(mobile);
  }

  apply();

  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", apply);
  } else {
    mq.addListener(apply);
  }
}
