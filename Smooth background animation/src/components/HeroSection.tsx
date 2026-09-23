import { useState, useEffect, useCallback } from "react";
import svgPaths from "@/imports/HeroSection/svg-6uda9tdukm";
import img98531 from "@/imports/HeroSection/a38fa06c3d58d09912c01e76b83fd951c6daef6f.png";
import img98532 from "@/imports/HeroSection/4c821c8afdccfdfbd2fd1b99ae7661ddb772e1d8.png";
import img98533 from "@/imports/HeroSection/9d4b3246cfab3162de3bf7419f7030d62cf95c42.png";
import img98534 from "@/imports/HeroSection/a0fe41a0aacc4e1bbf993fab14d872d8eafae530.png";
import img98535 from "@/imports/HeroSection/9c5dc4c91b065d9bc24b84ed9bf5f511c1c3585f.png";

const SLIDES = [
  {
    id: "01",
    label: "Для розвитку бізнесу",
    img: img98531,
    heading: ["Фінансування розвитку", "та нових можливостей вашого бізнесу"],
    sub: "Кредити та лізинг для бізнесу і приватних клієнтів — коли для наступного кроку потрібне фінансування.",
    cta: "ОТРИМАТИ ФІНАНСУВАННЯ",
  },
  {
    id: "02",
    label: "На обігові кошти",
    img: img98532,
    heading: ["Кошти для безперервної", "роботи та розвитку вашого бізнесу"],
    sub: "Фінансування закупівлі товарів і сировини, сезонних потреб, виконання контрактів та поточної діяльності.",
    cta: "ПОПОВНИТИ ОБІГОВІ КОШТИ",
  },
  {
    id: "03",
    label: "На авто та техніку",
    img: img98533,
    heading: ["Придбайте авто", "та техніку для розвитку вашого бізнесу"],
    sub: "Кредит або лізинг на легкові автомобілі, комерційний транспорт, сільськогосподарську та спеціальну техніку",
    cta: "ПРИДБАТИ АВТО АБО ТЕХНІКУ",
  },
  {
    id: "04",
    label: "На обладнання та нерухомість",
    img: img98534,
    heading: ["Інвестуйте в обладнання та нерухомість для розвитку бізнесу"],
    sub: "Фінансування придбання обладнання, виробничих потужностей, офісної, торговельної та комерційної нерухомості.",
    cta: "ОТРИМАТИ ФІНАНСУВАННЯ",
  },
  {
    id: "05",
    label: "Для особистих планів",
    img: img98535,
    heading: ["Отримайте кошти", "на важливі особисті", "плани"],
    sub: "Кредити для приватних клієнтів під заставу нерухомості або автомобіля — на значні покупки, інвестиції та інші потреби.",
    cta: "ОТРИМАТИ КОШТИ",
  },
] as const;

const SLIDE_IMAGES = [img98531, img98532, img98533, img98534, img98535];

const AUTOPLAY_MS = 5000;

export default function HeroSection() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  const next = useCallback(() => {
    setActive((i) => (i + 1) % SLIDES.length);
    setProgress(0);
  }, []);

  const prev = useCallback(() => {
    setActive((i) => (i - 1 + SLIDES.length) % SLIDES.length);
    setProgress(0);
  }, []);

  useEffect(() => {
    setProgress(0);
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - start) / AUTOPLAY_MS, 1);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else next();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, next]);

  const slide = SLIDES[active];

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center px-[52px] pt-[64px] pb-[128px]">
      {/* main content */}
      <div className="max-w-[1176px] mx-auto w-full flex flex-col gap-[32px]">

        {/* heading + cta */}
        <div className="flex flex-col gap-[64px] items-start w-full">
          <div className="flex flex-col gap-[32px] items-start w-full text-[#0a2140] not-italic">
            <div className="font-['e-ukraine:regular',sans-serif] text-[64px] leading-[1.2] tracking-[-1px] w-full">
              {slide.heading.map((line, i) => (
                <p key={i} className="leading-[1.2] mb-0">{line}</p>
              ))}
            </div>
            <p className="font-['e-ukraine:light',sans-serif] text-[22px] leading-[1.4] w-full">
              {slide.sub}
            </p>
          </div>

          {/* CTA row */}
          <div className="flex flex-wrap gap-[12px_20px] items-center w-full">
            <button className="bg-white h-[56px] rounded-[99px] px-[24px] text-[#060719] font-['e-ukraine:medium',sans-serif] text-[14px] leading-[1.5] whitespace-nowrap border border-white hover:bg-white/80 transition-colors">
              {slide.cta}
            </button>
            <div className="flex gap-[8px] items-center">
              <div className="relative shrink-0 size-[20px]">
                <div className="absolute inset-[18.75%_12.5%]">
                  <svg className="absolute block inset-0 size-full" fill="none" height="12.5007" preserveAspectRatio="none" viewBox="0 0 15.0005 12.5007" width="15.0005">
                    <path d={svgPaths.p38193000} fill="#060719" />
                  </svg>
                </div>
              </div>
              <p className="font-['e-ukraine:regular',sans-serif] text-[14px] text-[#060719] leading-[1.4] whitespace-nowrap">
                Час прийняття рішення від 15 хвилин
              </p>
            </div>
          </div>
        </div>

        {/* nav row */}
        <div className="flex flex-col gap-[32px] items-end w-full">
          {/* arrows */}
          <div className="flex gap-[4px] items-center">
            <button
              onClick={prev}
              className="h-[56px] w-[56px] rounded-[99px] border-[1.5px] border-[#0a2140] flex items-center justify-center hover:bg-[#0a2140] group transition-colors"
            >
              <svg className="size-[20px]" fill="none" viewBox="0 0 7.50084 13.7507">
                <path d={svgPaths.p331fd680} className="fill-[#0a2140] group-hover:fill-[#f1f2ff] transition-colors" />
              </svg>
            </button>
            <button
              onClick={next}
              className="h-[56px] w-[56px] rounded-[99px] border-[1.5px] border-[#0a2140] flex items-center justify-center hover:bg-[#0a2140] group transition-colors"
            >
              <svg className="size-[20px]" fill="none" viewBox="0 0 7.50084 13.7507">
                <path d={svgPaths.pb084e00} className="fill-[#0a2140] group-hover:fill-[#f1f2ff] transition-colors" />
              </svg>
            </button>
          </div>

          {/* slide cards */}
          <div className="flex gap-[16px] items-center w-full justify-end">
            {SLIDES.map((s, i) => {
              const isActive = i === active;
              return (
                <button
                  key={s.id}
                  onClick={() => { setActive(i); setProgress(0); }}
                  className="relative bg-white h-[176px] rounded-[16px] shrink-0 w-[276px] overflow-hidden text-left transition-shadow hover:shadow-md"
                >
                  {/* background image, visible only on active */}
                  <div className={`absolute inset-0 transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0"}`}>
                    <div className="absolute flex inset-0 items-center justify-center" style={{ containerType: "size" }}>
                      <div className="-scale-x-100 flex-none h-[100cqh] w-[100cqw]">
                        <div className="relative size-full">
                          <div aria-hidden className="absolute inset-0 pointer-events-none">
                            <img alt="" className="absolute max-w-none object-cover size-full" src={SLIDE_IMAGES[i]} />
                            <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(-89.9999991017915deg, rgba(0,0,0,0.6) 0.73833%, rgba(0,0,0,0) 101.99%)" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* label */}
                  <div className="relative flex flex-col justify-between h-full pt-[32px]">
                    <div className="pl-[32px] pr-[24px]">
                      <p className={`font-['e-ukraine:medium',sans-serif] text-[16px] leading-[1.5] transition-colors duration-300 ${isActive ? "text-white" : "text-[#060719]"}`}>
                        {s.label}
                      </p>
                    </div>
                    {/* progress bar */}
                    <div className="w-full h-[4px] bg-transparent overflow-hidden">
                      <div
                        className="bg-[#ee7018] h-full transition-none"
                        style={{ width: isActive ? `${progress * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
