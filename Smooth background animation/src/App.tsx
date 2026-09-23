import HeroSection from "@/components/HeroSection";

export default function App() {
  return (
    <div className="animated-bg min-h-screen w-full overflow-hidden relative">
      {/* colour blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <div className="blob blob-4" />

      {/* blurred wave top */}
      <svg className="wave wave-top" viewBox="0 0 1440 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="blur-a"><feGaussianBlur stdDeviation="22" /></filter>
        </defs>
        <path className="wave-path-a" fill="#c4ccea" fillOpacity="0.5" filter="url(#blur-a)"
          d="M0,60 C200,160 500,0 720,80 C940,160 1200,20 1440,80 L1440,320 L0,320 Z" />
      </svg>

      {/* blurred wave bottom */}
      <svg className="wave wave-bottom" viewBox="0 0 1440 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="blur-b"><feGaussianBlur stdDeviation="20" /></filter>
        </defs>
        <path className="wave-path-b" fill="#bec8ee" fillOpacity="0.45" filter="url(#blur-b)"
          d="M0,60 C300,0 600,160 900,60 C1100,0 1300,120 1440,60 L1440,320 L0,320 Z" />
      </svg>

      {/* blurred wave mid */}
      <svg className="wave wave-mid" viewBox="0 0 1440 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="blur-c"><feGaussianBlur stdDeviation="28" /></filter>
        </defs>
        <path className="wave-path-c" fill="#d8ccf0" fillOpacity="0.35" filter="url(#blur-c)"
          d="M0,80 C250,20 550,160 780,60 C1000,0 1240,140 1440,80 L1440,320 L0,320 Z" />
      </svg>

      {/* hero content */}
      <div className="relative z-10">
        <HeroSection />
      </div>
    </div>
  );
}
