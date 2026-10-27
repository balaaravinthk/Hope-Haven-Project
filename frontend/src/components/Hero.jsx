import { Link } from "react-router-dom";
import heroBg from "../assets/hero-bg.png";

function Hero() {
  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#0a090e] pt-[64px] md:pt-[70px]">
      {/* Background Photo Container - Original image untouched */}
      <div className="relative mx-auto w-full max-w-[1920px] min-h-[500px] sm:min-h-[560px] md:min-h-[620px] lg:min-h-[660px] flex items-center">
        {/* Background Image: Clean photo without any baked-in text */}
        <img
          src={heroBg}
          alt="Children smiling at Hope Haven"
          className="absolute inset-0 h-full w-full object-cover object-right md:object-center select-none pointer-events-none"
        />

        {/* Ambient Dark Gradient on Left for Perfect Text Legibility */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0a090e] via-[#0a090e]/85 to-transparent sm:via-[#0a090e]/75"
          aria-hidden="true"
        />

        {/* Real HTML / CSS Content Layer (100% Code, Zero Image Text) */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14 py-16 md:py-20">
          <div className="max-w-xl">
            {/* Eyebrow / Tag in Mint Green style */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-950/60 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.24em] text-emerald-300 backdrop-blur-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Hope Haven
            </div>

            {/* Main Headline */}
            <h1 className="animate-rise-delay mt-4 font-display text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.08] text-white">
              Every child<br />
              deserves<br />
              <span className="text-[#34d399]">a brighter</span><br />
              tomorrow.
            </h1>

            {/* Description Subtitle */}
            <p className="animate-rise-delay-2 mt-4 sm:mt-5 max-w-md text-sm sm:text-base leading-relaxed text-white/85">
              Connect donors, volunteers, and verified orphanages in one trusted place — simple support that reaches children who need it most.
            </p>

            {/* Action Buttons styled with Mint Green accents */}
            <div className="animate-rise-delay-2 mt-7 sm:mt-9 flex flex-wrap items-center gap-3.5">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3.5 font-display text-sm sm:text-base font-bold text-white shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95 cursor-pointer"
              >
                Become a Volunteer
              </Link>

              <button
                type="button"
                onClick={scrollToAbout}
                className="inline-flex items-center justify-center rounded-xl border border-emerald-400/70 bg-black/45 px-6 py-3.5 font-display text-sm sm:text-base font-semibold text-white backdrop-blur-xs transition-all duration-200 hover:bg-emerald-950/40 hover:border-emerald-300 active:scale-95 cursor-pointer"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
