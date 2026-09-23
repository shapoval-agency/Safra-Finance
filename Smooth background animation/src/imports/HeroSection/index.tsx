import svgPaths from "./svg-6uda9tdukm";
import img98531 from "./a38fa06c3d58d09912c01e76b83fd951c6daef6f.png";
import img98532 from "./4c821c8afdccfdfbd2fd1b99ae7661ddb772e1d8.png";
import img98533 from "./9d4b3246cfab3162de3bf7419f7030d62cf95c42.png";
import img98534 from "./a0fe41a0aacc4e1bbf993fab14d872d8eafae530.png";
import img98535 from "./9c5dc4c91b065d9bc24b84ed9bf5f511c1c3585f.png";
type ButtonsProps = {
  className?: string;
  color?: "blue" | "white";
  outline?: boolean;
  showLeftIcon?: boolean;
  showRughtIcon?: boolean;
  showText?: boolean;
  stats?: "normal" | "hover" | "pressed" | "blocked";
  text?: string;
};

function Buttons({ className, color = "blue", outline = true, showLeftIcon = true, showRughtIcon = true, showText = true, stats = "normal", text = "text-button" }: ButtonsProps) {
  const isBlockedAndOutlineAndBlue = stats === "blocked" && outline && color === "blue";
  const isNormalAndNotOutlineAndWhite = stats === "normal" && !outline && color === "white";
  const isNormalAndOutlineAndBlue = stats === "normal" && outline && color === "blue";
  const isNotOutlineAndWhiteAndIsHoverOrPressed = !outline && color === "white" && ["hover", "pressed"].includes(stats);
  const isOutlineAndBlueAndIsHoverOrPressed = outline && color === "blue" && ["hover", "pressed"].includes(stats);
  return (
    <div className={className || `h-[56px] relative rounded-[99px] ${stats === "pressed" && !outline && color === "white" ? "bg-[#060719]" : stats === "hover" && !outline && color === "white" ? "bg-[#060719] cursor-pointer" : isNormalAndNotOutlineAndWhite ? "bg-white" : isBlockedAndOutlineAndBlue ? "bg-[#dadced]" : stats === "pressed" && outline && color === "blue" ? "bg-[#0a2140]" : stats === "hover" && outline && color === "blue" ? "bg-[#0a2140] cursor-pointer" : ""}`}>
      <div aria-hidden className={`absolute border-[1.5px] border-solid inset-0 pointer-events-none rounded-[99px] ${isNotOutlineAndWhiteAndIsHoverOrPressed ? "border-[#060719]" : isNormalAndNotOutlineAndWhite ? "border-white" : isBlockedAndOutlineAndBlue ? "border-[#dadced]" : "border-[#0a2140]"}`} />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[24px] py-[16px] relative size-full">
          {isOutlineAndBlueAndIsHoverOrPressed && showLeftIcon && (
            <div className="overflow-clip relative shrink-0 size-[20px]" data-name="left-icon">
              <div className="absolute inset-[15.62%_34.37%_15.62%_28.12%]" data-name="Vector">
                <svg className="absolute block inset-0 size-full" fill="none" height="13.7507" preserveAspectRatio="none" viewBox="0 0 7.50084 13.7507" width="7.50084">
                  <path d={svgPaths.p331fd680} fill="#F1F2FF" id="Vector" />
                </svg>
              </div>
            </div>
          )}
          {isOutlineAndBlueAndIsHoverOrPressed && showText && <p className="[word-break:break-word] font-['e-ukraine:medium',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#f1f2ff] text-[14px] whitespace-nowrap">{text}</p>}
          {isOutlineAndBlueAndIsHoverOrPressed && showRughtIcon && (
            <div className="overflow-clip relative shrink-0 size-[20px]" data-name="right-icon">
              <div className="absolute inset-[15.62%_28.12%_15.62%_34.37%]" data-name="Vector">
                <svg className="absolute block inset-0 size-full" fill="none" height="13.7507" preserveAspectRatio="none" viewBox="0 0 7.50084 13.7507" width="7.50084">
                  <path d={svgPaths.pb084e00} fill="#F1F2FF" id="Vector" />
                </svg>
              </div>
            </div>
          )}
          {isNotOutlineAndWhiteAndIsHoverOrPressed && showLeftIcon && (
            <div className="overflow-clip relative shrink-0 size-[20px]" data-name="left-icon">
              <div className="absolute inset-[15.62%_34.37%_15.62%_28.12%]" data-name="Vector">
                <svg className="absolute block inset-0 size-full" fill="none" height="13.7507" preserveAspectRatio="none" viewBox="0 0 7.50084 13.7507" width="7.50084">
                  <path d={svgPaths.p331fd680} fill="white" id="Vector" />
                </svg>
              </div>
            </div>
          )}
          {isNotOutlineAndWhiteAndIsHoverOrPressed && showText && <p className="[word-break:break-word] font-['e-ukraine:medium',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">{text}</p>}
          {isNotOutlineAndWhiteAndIsHoverOrPressed && showRughtIcon && (
            <div className="overflow-clip relative shrink-0 size-[20px]" data-name="right-icon">
              <div className="absolute inset-[15.62%_28.12%_15.62%_34.37%]" data-name="Vector">
                <svg className="absolute block inset-0 size-full" fill="none" height="13.7507" preserveAspectRatio="none" viewBox="0 0 7.50084 13.7507" width="7.50084">
                  <path d={svgPaths.pb084e00} fill="white" id="Vector" />
                </svg>
              </div>
            </div>
          )}
          {isNormalAndOutlineAndBlue && showLeftIcon && (
            <div className="overflow-clip relative shrink-0 size-[20px]" data-name="left-icon">
              <div className="absolute inset-[15.62%_34.37%_15.62%_28.12%]" data-name="Vector">
                <svg className="absolute block inset-0 size-full" fill="none" height="13.7507" preserveAspectRatio="none" viewBox="0 0 7.50084 13.7507" width="7.50084">
                  <path d={svgPaths.p331fd680} fill="#0A2140" id="Vector" />
                </svg>
              </div>
            </div>
          )}
          {isNormalAndOutlineAndBlue && showText && <p className="[word-break:break-word] font-['e-ukraine:medium',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#0a2140] text-[14px] whitespace-nowrap">{text}</p>}
          {isNormalAndOutlineAndBlue && showRughtIcon && (
            <div className="overflow-clip relative shrink-0 size-[20px]" data-name="right-icon">
              <div className="absolute inset-[15.62%_28.12%_15.62%_34.37%]" data-name="Vector">
                <svg className="absolute block inset-0 size-full" fill="none" height="13.7507" preserveAspectRatio="none" viewBox="0 0 7.50084 13.7507" width="7.50084">
                  <path d={svgPaths.pb084e00} fill="#0A2140" id="Vector" />
                </svg>
              </div>
            </div>
          )}
          {isBlockedAndOutlineAndBlue && showLeftIcon && (
            <div className="overflow-clip relative shrink-0 size-[20px]" data-name="left-icon">
              <div className="absolute inset-[15.62%_34.37%_15.62%_28.12%]" data-name="Vector">
                <svg className="absolute block inset-0 size-full" fill="none" height="13.7507" preserveAspectRatio="none" viewBox="0 0 7.50084 13.7507" width="7.50084">
                  <path d={svgPaths.p331fd680} fill="#AEAFC3" id="Vector" />
                </svg>
              </div>
            </div>
          )}
          {isBlockedAndOutlineAndBlue && showText && <p className="[word-break:break-word] font-['e-ukraine:medium',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#aeafc3] text-[14px] whitespace-nowrap">{text}</p>}
          {isBlockedAndOutlineAndBlue && showRughtIcon && (
            <div className="overflow-clip relative shrink-0 size-[20px]" data-name="right-icon">
              <div className="absolute inset-[15.62%_28.12%_15.62%_34.37%]" data-name="Vector">
                <svg className="absolute block inset-0 size-full" fill="none" height="13.7507" preserveAspectRatio="none" viewBox="0 0 7.50084 13.7507" width="7.50084">
                  <path d={svgPaths.pb084e00} fill="#AEAFC3" id="Vector" />
                </svg>
              </div>
            </div>
          )}
          {isNormalAndNotOutlineAndWhite && showLeftIcon && (
            <div className="overflow-clip relative shrink-0 size-[20px]" data-name="left-icon">
              <div className="absolute inset-[15.62%_34.37%_15.62%_28.12%]" data-name="Vector">
                <svg className="absolute block inset-0 size-full" fill="none" height="13.7507" preserveAspectRatio="none" viewBox="0 0 7.50084 13.7507" width="7.50084">
                  <path d={svgPaths.p331fd680} fill="#060719" id="Vector" />
                </svg>
              </div>
            </div>
          )}
          {isNormalAndNotOutlineAndWhite && showText && <p className="[word-break:break-word] font-['e-ukraine:medium',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#060719] text-[14px] whitespace-nowrap">{text}</p>}
          {isNormalAndNotOutlineAndWhite && showRughtIcon && (
            <div className="overflow-clip relative shrink-0 size-[20px]" data-name="right-icon">
              <div className="absolute inset-[15.62%_28.12%_15.62%_34.37%]" data-name="Vector">
                <svg className="absolute block inset-0 size-full" fill="none" height="13.7507" preserveAspectRatio="none" viewBox="0 0 7.50084 13.7507" width="7.50084">
                  <path d={svgPaths.pb084e00} fill="#060719" id="Vector" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
type HeroSectionProps = {
  className?: string;
  device?: "desktop";
  slides?: "01" | "02" | "03" | "04" | "05";
};

function HeroSection({ className, device = "desktop", slides = "01" }: HeroSectionProps) {
  const is01Or02 = ["01", "02"].includes(slides);
  const is02 = slides === "02";
  const is02Or03Or04Or05 = ["02", "03", "04", "05"].includes(slides);
  const is03 = slides === "03";
  const is03Or04Or05 = ["03", "04", "05"].includes(slides);
  const is04 = slides === "04";
  const is04Or05 = ["04", "05"].includes(slides);
  const is05 = slides === "05";
  return (
    <div className={className || "bg-[#e7f3ff] h-[1080px] max-w-[1920px] min-w-[1280px] relative w-[1920px]"}>
      <div className="flex flex-col items-center justify-center max-w-[inherit] min-w-[inherit] overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[8px] items-center justify-center max-w-[inherit] min-w-[inherit] pb-[128px] pt-[64px] px-[52px] relative size-full">
          <div className="absolute bg-white inset-0 overflow-clip" data-name="main-bg" />
          <div className="content-stretch flex flex-col gap-[32px] items-start max-w-[1176px] relative shrink-0 w-full" data-name="cont">
            <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="line">
              <div className="content-stretch flex flex-col gap-[64px] items-start relative shrink-0 w-full" data-name="cont">
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="line">
                  <div className="[word-break:break-word] content-stretch flex flex-col gap-[32px] items-start not-italic relative shrink-0 text-[#0a2140] w-full" data-name="cont">
                    {["01", "02", "03", "05"].includes(slides) && (
                      <div className="font-['e-ukraine:regular',sans-serif] leading-[0] relative shrink-0 text-[64px] tracking-[-1px] w-full">
                        <p className="leading-[1.2] mb-0">{is05 ? "Отримайте кошти" : is03 ? "Придбайте авто" : is02 ? "Кошти для безперервної" : "Фінансування розвитку"}</p>
                        <p className={`leading-[1.2] ${is05 ? "mb-0" : ""}`}>{is05 ? "на важливі особисті" : is03 ? "та техніку для розвитку вашого бізнесу" : is02 ? "роботи та розвитку вашого бізнесу" : "та нових можливостей вашого бізнесу"}</p>
                        {is05 && <p className="leading-[1.2]">плани</p>}
                      </div>
                    )}
                    <p className={`relative shrink-0 w-full ${is04 ? 'font-["e-ukraine:regular",sans-serif] leading-[1.2] text-[64px] tracking-[-1px]' : 'font-["e-ukraine:light",sans-serif] leading-[1.4] text-[22px]'}`}>{is05 ? "Кредити для приватних клієнтів під заставу нерухомості або автомобіля — на значні покупки, інвестиції та інші потреби." : is04 ? "Інвестуйте в обладнання та нерухомість для розвитку бізнесу" : is03 ? "Кредит або лізинг на легкові автомобілі, комерційний транспорт, сільськогосподарську та спеціальну техніку" : is02 ? "Фінансування закупівлі товарів і сировини, сезонних потреб, виконання контрактів та поточної діяльності." : "Кредити та лізинг для бізнесу і приватних клієнтів — коли для наступного кроку потрібне фінансування."}</p>
                    {is04 && <p className="font-['e-ukraine:light',sans-serif] leading-[1.4] relative shrink-0 text-[22px] w-full">Фінансування придбання обладнання, виробничих потужностей, офісної, торговельної та комерційної нерухомості.</p>}
                  </div>
                </div>
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="line">
                  <div className="content-center flex flex-wrap gap-[12px_20px] items-center relative shrink-0 w-full" data-name="cont">
                    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="row">
                      <Buttons className="bg-white h-[56px] relative rounded-[99px] shrink-0 w-full" color="white" outline={false} showLeftIcon={false} showRughtIcon={false} text={is05 ? "ОТРИМАТИ КОШТИ" : is03 ? "ПРИДБАТИ АВТО АБО ТЕХНІКУ" : is02 ? "ПОПОВНИТИ ОБІГОВІ КОШТИ" : "ОТРИМАТИ ФІНАНСУВАННЯ"} />
                    </div>
                    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="row">
                      <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="cont">
                        <div className="overflow-clip relative shrink-0 size-[20px]" data-name="icons">
                          <div className="absolute inset-[18.75%_12.5%]" data-name="Vector">
                            <svg className="absolute block inset-0 size-full" fill="none" height="12.5007" preserveAspectRatio="none" viewBox="0 0 15.0005 12.5007" width="15.0005">
                              <path d={svgPaths.p38193000} fill="#060719" id="Vector" />
                            </svg>
                          </div>
                        </div>
                        <p className="[word-break:break-word] font-['e-ukraine:regular',sans-serif] leading-[1.4] not-italic relative shrink-0 text-[#060719] text-[14px] whitespace-nowrap">Час прийняття рішення від 15 хвилин</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="line">
              <div className="content-stretch flex flex-col gap-[32px] items-end relative shrink-0 w-full" data-name="cont">
                <div className="content-stretch flex flex-col items-end relative shrink-0 w-full" data-name="line">
                  <div className="content-stretch flex items-start relative shrink-0" data-name="cont">
                    <div className="content-stretch flex gap-[4px] items-start relative shrink-0" data-name="row">
                      <div className={`h-[56px] relative rounded-[99px] shrink-0 ${is02Or03Or04Or05 ? "" : "bg-[#dadced]"}`} data-name="buttons">
                        <div aria-hidden className={`absolute border-[1.5px] border-solid inset-0 pointer-events-none rounded-[99px] ${is02Or03Or04Or05 ? "border-[#0a2140]" : "border-[#dadced]"}`} />
                        <div className="flex flex-row items-center size-full">
                          <div className="content-stretch flex gap-[8px] items-center p-[16px] relative size-full">
                            <div className="overflow-clip relative shrink-0 size-[20px]" data-name="left-icon">
                              <div className="absolute inset-[15.62%_34.37%_15.62%_28.12%]" data-name="Vector">
                                <svg className="absolute block inset-0 size-full" fill="none" height="13.7507" preserveAspectRatio="none" viewBox="0 0 7.50084 13.7507" width="7.50084">
                                  <path d={svgPaths.p331fd680} fill={is02Or03Or04Or05 ? "#0A2140" : "#AEAFC3"} id="Vector" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="h-[56px] relative rounded-[99px] shrink-0" data-name="buttons">
                        <div aria-hidden className="absolute border-[#0a2140] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[99px]" />
                        <div className="flex flex-row items-center size-full">
                          <div className="content-stretch flex gap-[8px] items-center p-[16px] relative size-full">
                            <div className="overflow-clip relative shrink-0 size-[20px]" data-name="right-icon">
                              <div className="absolute inset-[15.62%_28.12%_15.62%_34.37%]" data-name="Vector">
                                <svg className="absolute block inset-0 size-full" fill="none" height="13.7507" preserveAspectRatio="none" viewBox="0 0 7.50084 13.7507" width="7.50084">
                                  <path d={svgPaths.pb084e00} fill="#0A2140" id="Vector" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="line">
                  <div className={`content-stretch flex gap-[16px] items-center relative shrink-0 w-full ${is02Or03Or04Or05 ? "justify-end" : ""}`} data-name="cont">
                    {is02Or03Or04Or05 && (
                      <button className="bg-white cursor-pointer h-[176px] relative rounded-[16px] shrink-0 w-[276px]" data-name="slide-navigation">
                        <div className="overflow-clip rounded-[inherit] size-full">
                          <div className="content-stretch flex flex-col items-start justify-between pt-[32px] relative size-full">
                            <div className="absolute inset-0 opacity-0 overflow-clip" data-name="bg">
                              <div className="absolute flex inset-0 items-center justify-center" style={{ containerType: "size" }}>
                                <div className="-scale-x-100 flex-none h-[100cqh] w-[100cqw]">
                                  <div className="relative size-full" data-name="9853 1">
                                    <div aria-hidden className="absolute inset-0 pointer-events-none">
                                      <img alt="" className="absolute max-w-none object-bottom size-full" src={img98531} />
                                      <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(-89.9999991017915deg, rgba(0, 0, 0, 0.6) 0.73833%, rgba(0, 0, 0, 0) 101.99%)" }} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="content-stretch flex items-center justify-center pl-[32px] pr-[96px] relative shrink-0 w-full" data-name="line">
                              <p className="[word-break:break-word] flex-[1_0_0] font-['e-ukraine:medium',sans-serif] leading-[1.5] min-w-px not-italic relative text-[#060719] text-[16px] text-left">Для розвитку бізнесу</p>
                            </div>
                            <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="loader">
                              <div className="bg-[#ee7018] h-[4px] relative shrink-0 w-px" />
                            </div>
                          </div>
                        </div>
                      </button>
                    )}
                    {is03Or04Or05 && (
                      <button className="bg-white cursor-pointer h-[176px] relative rounded-[16px] shrink-0 w-[276px]" data-name="slide-navigation">
                        <div className="overflow-clip rounded-[inherit] size-full">
                          <div className="content-stretch flex flex-col items-start justify-between pt-[32px] relative size-full">
                            <div className="absolute inset-0 opacity-0 overflow-clip" data-name="bg">
                              <div className="absolute flex inset-0 items-center justify-center" style={{ containerType: "size" }}>
                                <div className="-scale-x-100 flex-none h-[100cqh] w-[100cqw]">
                                  <div className="relative size-full" data-name="9853 1">
                                    <div aria-hidden className="absolute inset-0 pointer-events-none">
                                      <img alt="" className="absolute max-w-none object-bottom size-full" src={img98532} />
                                      <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(-89.9999991017915deg, rgba(0, 0, 0, 0.6) 0.73833%, rgba(0, 0, 0, 0) 101.99%)" }} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="content-stretch flex items-center justify-center pl-[32px] pr-[96px] relative shrink-0 w-full" data-name="line">
                              <p className="[word-break:break-word] flex-[1_0_0] font-['e-ukraine:medium',sans-serif] leading-[1.5] min-w-px not-italic relative text-[#060719] text-[16px] text-left">На обігові кошти</p>
                            </div>
                            <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="loader">
                              <div className="bg-[#ee7018] h-[4px] relative shrink-0 w-px" />
                            </div>
                          </div>
                        </div>
                      </button>
                    )}
                    {["01", "02", "03"].includes(slides) && (
                      <div className="bg-white h-[176px] relative rounded-[16px] shrink-0 w-[276px]" data-name="slide-navigation">
                        <div className="overflow-clip rounded-[inherit] size-full">
                          <div className="content-stretch flex flex-col items-start justify-between pt-[32px] relative size-full">
                            <div className="absolute inset-0 overflow-clip" data-name="bg">
                              <div className="absolute flex inset-0 items-center justify-center" style={{ containerType: "size" }}>
                                <div className="-scale-x-100 flex-none h-[100cqh] w-[100cqw]">
                                  <div className="relative size-full" data-name="9853 1">
                                    <div aria-hidden className="absolute inset-0 pointer-events-none">
                                      {is01Or02 && <img alt="" className="absolute max-w-none object-bottom size-full" src={is02 ? img98532 : img98531} />}
                                      <div className={`absolute inset-0 ${is03 ? "overflow-hidden" : ""}`} style={is01Or02 ? { backgroundImage: "linear-gradient(-89.9999991017915deg, rgba(0, 0, 0, 0.6) 0.73833%, rgba(0, 0, 0, 0) 101.99%)" } : undefined}>
                                        {is03 && <img alt="" className="absolute h-[216.67%] left-[129.97%] max-w-none top-[-58.33%] w-[-207.25%]" src={img98533} />}
                                      </div>
                                      {is03 && <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(-89.9999991017915deg, rgba(0, 0, 0, 0.6) 0.73833%, rgba(0, 0, 0, 0) 101.99%)" }} />}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="content-stretch flex items-center justify-center pl-[32px] pr-[96px] relative shrink-0 w-full" data-name="cont">
                              <p className="[word-break:break-word] flex-[1_0_0] font-['e-ukraine:medium',sans-serif] leading-[1.5] min-w-px not-italic relative text-[16px] text-white">{is03 ? "На авто та техніку" : is02 ? "На обігові кошти" : "Для розвитку бізнесу"}</p>
                            </div>
                            <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="loader">
                              <div className="bg-[#ee7018] h-[4px] relative shrink-0 w-[80px]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {is03Or04Or05 && (
                      <button className="bg-white cursor-pointer h-[176px] relative rounded-[16px] shrink-0 w-[276px]" data-name="slide-navigation">
                        <div className="overflow-clip rounded-[inherit] size-full">
                          <div className="content-stretch flex flex-col items-start justify-between pt-[32px] relative size-full">
                            <div className="absolute inset-0 opacity-0 overflow-clip" data-name="bg">
                              <div className="absolute flex inset-0 items-center justify-center" style={{ containerType: "size" }}>
                                <div className="-scale-x-100 flex-none h-[100cqh] w-[100cqw]">
                                  <div className="relative size-full" data-name="9853 1">
                                    <div aria-hidden className="absolute inset-0 pointer-events-none">
                                      {is04Or05 && (
                                        <>
                                          <div className="absolute inset-0 overflow-hidden">
                                            <img alt="" className="absolute h-[216.67%] left-[129.97%] max-w-none top-[-58.33%] w-[-207.25%]" src={img98533} />
                                          </div>
                                          <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(-89.9999991017915deg, rgba(0, 0, 0, 0.6) 0.73833%, rgba(0, 0, 0, 0) 101.99%)" }} />
                                        </>
                                      )}
                                      {is03 && (
                                        <>
                                          <img alt="" className="absolute max-w-none object-bottom size-full" src={img98534} />
                                          <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(-89.9999991017915deg, rgba(0, 0, 0, 0.6) 0.73833%, rgba(0, 0, 0, 0) 101.99%)" }} />
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="content-stretch flex items-center justify-center pl-[32px] pr-[96px] relative shrink-0 w-full" data-name="line">
                              <p className="[word-break:break-word] flex-[1_0_0] font-['e-ukraine:medium',sans-serif] leading-[1.5] min-w-px not-italic relative text-[#060719] text-[16px] text-left">{is04Or05 ? "На авто та техніку" : is03 ? "На обладнання та нерухомість" : ""}</p>
                            </div>
                            <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="loader">
                              <div className="bg-[#ee7018] h-[4px] relative shrink-0 w-px" />
                            </div>
                          </div>
                        </div>
                      </button>
                    )}
                    {["03", "05"].includes(slides) && (
                      <button className="bg-white cursor-pointer h-[176px] relative rounded-[16px] shrink-0 w-[276px]" data-name="slide-navigation">
                        <div className="overflow-clip rounded-[inherit] size-full">
                          <div className="content-stretch flex flex-col items-start justify-between pt-[32px] relative size-full">
                            <div className="absolute inset-0 opacity-0 overflow-clip" data-name="bg">
                              <div className="absolute flex inset-0 items-center justify-center" style={{ containerType: "size" }}>
                                <div className="-scale-x-100 flex-none h-[100cqh] w-[100cqw]">
                                  <div className="relative size-full" data-name="9853 1">
                                    <div aria-hidden className="absolute inset-0 pointer-events-none">
                                      <img alt="" className="absolute max-w-none object-bottom size-full" src={is05 ? img98534 : img98535} />
                                      <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(-89.9999991017915deg, rgba(0, 0, 0, 0.6) 0.73833%, rgba(0, 0, 0, 0) 101.99%)" }} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="content-stretch flex items-center justify-center pl-[32px] pr-[96px] relative shrink-0 w-full" data-name="line">
                              <p className="[word-break:break-word] flex-[1_0_0] font-['e-ukraine:medium',sans-serif] leading-[1.5] min-w-px not-italic relative text-[#060719] text-[16px] text-left">{is05 ? "На обладнання та нерухомість" : is03 ? "Для особистих планів" : ""}</p>
                            </div>
                            <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="loader">
                              <div className="bg-[#ee7018] h-[4px] relative shrink-0 w-px" />
                            </div>
                          </div>
                        </div>
                      </button>
                    )}
                    {is04Or05 && (
                      <div className="bg-white h-[176px] relative rounded-[16px] shrink-0 w-[276px]" data-name="slide-navigation">
                        <div className="overflow-clip rounded-[inherit] size-full">
                          <div className="content-stretch flex flex-col items-start justify-between pt-[32px] relative size-full">
                            <div className="absolute inset-0 overflow-clip" data-name="bg">
                              <div className="absolute flex inset-0 items-center justify-center" style={{ containerType: "size" }}>
                                <div className="-scale-x-100 flex-none h-[100cqh] w-[100cqw]">
                                  <div className="relative size-full" data-name="9853 1">
                                    <div aria-hidden className="absolute inset-0 pointer-events-none">
                                      <img alt="" className="absolute max-w-none object-bottom size-full" src={is05 ? img98535 : img98534} />
                                      <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(-89.9999991017915deg, rgba(0, 0, 0, 0.6) 0.73833%, rgba(0, 0, 0, 0) 101.99%)" }} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="content-stretch flex items-center justify-center pl-[32px] pr-[96px] relative shrink-0 w-full" data-name="cont">
                              <p className="[word-break:break-word] flex-[1_0_0] font-['e-ukraine:medium',sans-serif] leading-[1.5] min-w-px not-italic relative text-[16px] text-white">{is05 ? "Для особистих планів" : is04 ? "На обладнання та нерухомість" : ""}</p>
                            </div>
                            <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="loader">
                              <div className="bg-[#ee7018] h-[4px] relative shrink-0 w-[80px]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {slides === "01" && (
                      <button className="bg-white cursor-pointer h-[176px] relative rounded-[16px] shrink-0 w-[276px]" data-name="slide-navigation">
                        <div className="overflow-clip rounded-[inherit] size-full">
                          <div className="content-stretch flex flex-col items-start justify-between pt-[32px] relative size-full">
                            <div className="absolute inset-0 opacity-0 overflow-clip" data-name="bg">
                              <div className="absolute flex inset-0 items-center justify-center" style={{ containerType: "size" }}>
                                <div className="-scale-x-100 flex-none h-[100cqh] w-[100cqw]">
                                  <div className="relative size-full" data-name="9853 1">
                                    <div aria-hidden className="absolute inset-0 pointer-events-none">
                                      <img alt="" className="absolute max-w-none object-bottom size-full" src={img98532} />
                                      <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(-89.9999991017915deg, rgba(0, 0, 0, 0.6) 0.73833%, rgba(0, 0, 0, 0) 101.99%)" }} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="content-stretch flex items-center justify-center pl-[32px] pr-[96px] relative shrink-0 w-full" data-name="line">
                              <p className="[word-break:break-word] flex-[1_0_0] font-['e-ukraine:medium',sans-serif] leading-[1.5] min-w-px not-italic relative text-[#060719] text-[16px] text-left">На обігові кошти</p>
                            </div>
                            <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="loader">
                              <div className="bg-[#ee7018] h-[4px] relative shrink-0 w-px" />
                            </div>
                          </div>
                        </div>
                      </button>
                    )}
                    {is01Or02 && (
                      <>
                        <button className="bg-white cursor-pointer h-[176px] relative rounded-[16px] shrink-0 w-[276px]" data-name="slide-navigation">
                          <div className="overflow-clip rounded-[inherit] size-full">
                            <div className="content-stretch flex flex-col items-start justify-between pt-[32px] relative size-full">
                              <div className="absolute inset-0 opacity-0 overflow-clip" data-name="bg">
                                <div className="absolute flex inset-0 items-center justify-center" style={{ containerType: "size" }}>
                                  <div className="-scale-x-100 flex-none h-[100cqh] w-[100cqw]">
                                    <div className="relative size-full" data-name="9853 1">
                                      <div aria-hidden className="absolute inset-0 pointer-events-none">
                                        <div className="absolute inset-0 overflow-hidden">
                                          <img alt="" className="absolute h-[216.67%] left-[129.97%] max-w-none top-[-58.33%] w-[-207.25%]" src={img98533} />
                                        </div>
                                        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(-89.9999991017915deg, rgba(0, 0, 0, 0.6) 0.73833%, rgba(0, 0, 0, 0) 101.99%)" }} />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="content-stretch flex items-center justify-center pl-[32px] pr-[96px] relative shrink-0 w-full" data-name="line">
                                <p className="[word-break:break-word] flex-[1_0_0] font-['e-ukraine:medium',sans-serif] leading-[1.5] min-w-px not-italic relative text-[#060719] text-[16px] text-left">На авто та техніку</p>
                              </div>
                              <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="loader">
                                <div className="bg-[#ee7018] h-[4px] relative shrink-0 w-px" />
                              </div>
                            </div>
                          </div>
                        </button>
                        <button className="bg-white cursor-pointer h-[176px] relative rounded-[16px] shrink-0 w-[276px]" data-name="slide-navigation">
                          <div className="overflow-clip rounded-[inherit] size-full">
                            <div className="content-stretch flex flex-col items-start justify-between pt-[32px] relative size-full">
                              <div className="absolute inset-0 opacity-0 overflow-clip" data-name="bg">
                                <div className="absolute flex inset-0 items-center justify-center" style={{ containerType: "size" }}>
                                  <div className="-scale-x-100 flex-none h-[100cqh] w-[100cqw]">
                                    <div className="relative size-full" data-name="9853 1">
                                      <div aria-hidden className="absolute inset-0 pointer-events-none">
                                        <img alt="" className="absolute max-w-none object-bottom size-full" src={img98534} />
                                        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(-89.9999991017915deg, rgba(0, 0, 0, 0.6) 0.73833%, rgba(0, 0, 0, 0) 101.99%)" }} />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="content-stretch flex items-center justify-center pl-[32px] pr-[96px] relative shrink-0 w-full" data-name="line">
                                <p className="[word-break:break-word] flex-[1_0_0] font-['e-ukraine:medium',sans-serif] leading-[1.5] min-w-px not-italic relative text-[#060719] text-[16px] text-left">На обладнання та нерухомість</p>
                              </div>
                              <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="loader">
                                <div className="bg-[#ee7018] h-[4px] relative shrink-0 w-px" />
                              </div>
                            </div>
                          </div>
                        </button>
                      </>
                    )}
                    {["01", "02", "04"].includes(slides) && (
                      <button className="bg-white cursor-pointer h-[176px] relative rounded-[16px] shrink-0 w-[276px]" data-name="slide-navigation">
                        <div className="overflow-clip rounded-[inherit] size-full">
                          <div className="content-stretch flex flex-col items-start justify-between pt-[32px] relative size-full">
                            <div className="absolute inset-0 opacity-0 overflow-clip" data-name="bg">
                              <div className="absolute flex inset-0 items-center justify-center" style={{ containerType: "size" }}>
                                <div className="-scale-x-100 flex-none h-[100cqh] w-[100cqw]">
                                  <div className="relative size-full" data-name="9853 1">
                                    <div aria-hidden className="absolute inset-0 pointer-events-none">
                                      <img alt="" className="absolute max-w-none object-bottom size-full" src={img98535} />
                                      <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(-89.9999991017915deg, rgba(0, 0, 0, 0.6) 0.73833%, rgba(0, 0, 0, 0) 101.99%)" }} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="content-stretch flex items-center justify-center pl-[32px] pr-[96px] relative shrink-0 w-full" data-name="line">
                              <p className="[word-break:break-word] flex-[1_0_0] font-['e-ukraine:medium',sans-serif] leading-[1.5] min-w-px not-italic relative text-[#060719] text-[16px] text-left">Для особистих планів</p>
                            </div>
                            <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="loader">
                              <div className="bg-[#ee7018] h-[4px] relative shrink-0 w-px" />
                            </div>
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection1() {
  return <HeroSection className="bg-[#e7f3ff] relative size-full" />;
}