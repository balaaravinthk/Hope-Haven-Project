import { HeartHandshake, ShieldCheck, Users } from "lucide-react";

function About() {
  const values = [
    {
      icon: ShieldCheck,
      title: "Trusted platform",
      text: "Transparent connections between donors, volunteers, and orphanages — so every act of kindness is clear and accountable.",
    },
    {
      icon: HeartHandshake,
      title: "Verified orphanages",
      text: "Homes are verified before they appear on Hope Haven, helping support reach children safely and meaningfully.",
    },
    {
      icon: Users,
      title: "Community driven",
      text: "People and partners work together — mentoring, donating, and showing up — to build brighter futures side by side.",
    },
  ];

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-gradient-to-br from-[#f2faf5] via-[#e5f6ed] to-[#d6f2e2] py-20 md:py-28"
    >
      {/* Background Graphic Elements - Mint Green Waves & Botanical Foliage */}
      <div
        className="pointer-events-none absolute inset-0 select-none overflow-hidden"
        aria-hidden="true"
      >
        {/* Soft Ambient Radial Mint Glows */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-200/35 blur-3xl" />
        <div className="absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-emerald-300/25 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-80 w-80 rounded-full bg-teal-200/25 blur-3xl" />

        {/* Large Flowing Organic Mint Waves (Right & Bottom) matching Mint Green style */}
        <svg
          className="absolute -top-10 -right-20 h-full w-[650px] max-w-none text-[#a7dfc2]/45 lg:w-[850px]"
          viewBox="0 0 800 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Broad outer wave */}
          <path
            d="M800 0 C640 120 540 260 560 440 C580 620 480 720 380 800 L800 800 Z"
            fill="currentColor"
            opacity="0.55"
          />
          {/* Inner deeper wave curve */}
          <path
            d="M800 140 C680 240 620 360 640 500 C660 640 580 720 520 800 L800 800 Z"
            fill="#8fd3b0"
            opacity="0.38"
          />
          {/* Light crest wave */}
          <path
            d="M800 320 C720 400 690 500 710 620 C730 720 690 760 660 800 L800 800 Z"
            fill="#c0ebd4"
            opacity="0.5"
          />
        </svg>

        {/* Gentle Bottom-Left Organic Wave */}
        <svg
          className="absolute -bottom-10 -left-10 h-72 w-[480px] max-w-none text-[#bde8d2]/45"
          viewBox="0 0 500 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 300 L0 120 C100 130 180 80 260 110 C340 140 400 240 500 260 L500 300 Z"
            fill="currentColor"
          />
        </svg>

        {/* Botanical Foliage / Leaf Stem in Bottom Left (as seen in variant 5) */}
        <svg
          className="absolute bottom-0 left-0 h-64 w-64 text-[#2f8f5b] opacity-25 md:h-84 md:w-84"
          viewBox="0 0 300 300"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main stem */}
          <path
            d="M-20 320 Q60 220 120 140 Q170 70 230 20"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          {/* Leaves along stem */}
          <path d="M50 240 C35 210 20 205 0 210 C10 230 25 245 50 240 Z" />
          <path d="M60 230 C85 220 100 205 105 185 C90 195 75 210 60 230 Z" />
          <path d="M90 180 C70 155 55 152 35 160 C45 178 62 188 90 180 Z" />
          <path d="M102 170 C125 155 138 140 142 120 C125 132 112 150 102 170 Z" />
          <path d="M130 125 C112 102 98 100 80 110 C90 126 105 134 130 125 Z" />
          <path d="M142 115 C162 100 172 85 175 66 C160 78 148 95 142 115 Z" />
          <path d="M230 20 C210 32 195 48 185 68 C202 62 218 48 230 20 Z" />
        </svg>

        {/* Scattered Floating Botanical Leaves lightly in background */}
        {/* Leaf 1: Middle-Left */}
        <svg
          className="absolute top-[38%] left-[4%] h-10 w-10 -rotate-12 text-[#2f8f5b] opacity-20"
          viewBox="0 0 60 60"
          fill="currentColor"
        >
          <path d="M10 50 C12 25 32 12 50 10 C48 35 28 48 10 50 Z" />
          <path d="M14 46 Q30 30 46 14" stroke="#247048" strokeWidth="1.5" fill="none" opacity="0.6" />
        </svg>

        {/* Leaf 2: Center-Top floating */}
        <svg
          className="absolute top-[12%] left-[46%] h-8 w-8 rotate-45 text-[#2f8f5b] opacity-15"
          viewBox="0 0 60 60"
          fill="currentColor"
        >
          <path d="M10 50 C12 25 32 12 50 10 C48 35 28 48 10 50 Z" />
        </svg>

        {/* Leaf 3: Upper-Right */}
        <svg
          className="absolute top-[16%] right-[10%] h-12 w-12 rotate-[25deg] text-[#2f8f5b] opacity-22"
          viewBox="0 0 60 60"
          fill="currentColor"
        >
          <path d="M10 50 C12 25 32 12 50 10 C48 35 28 48 10 50 Z" />
          <path d="M14 46 Q30 30 46 14" stroke="#247048" strokeWidth="1.5" fill="none" opacity="0.6" />
        </svg>

        {/* Leaf 4: Lower-Right */}
        <svg
          className="absolute bottom-[26%] right-[6%] h-9 w-9 -rotate-[35deg] text-[#2f8f5b] opacity-20"
          viewBox="0 0 60 60"
          fill="currentColor"
        >
          <path d="M10 50 C12 25 32 12 50 10 C48 35 28 48 10 50 Z" />
        </svg>

        {/* Gentle Floating Dewdrops */}
        <div className="absolute top-[52%] right-[22%] h-3.5 w-3.5 rounded-full bg-emerald-400/25 blur-[0.5px]" />
        <div className="absolute top-[28%] left-[24%] h-2.5 w-2.5 rounded-full bg-emerald-500/20 blur-[0.5px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/70 bg-[#d8f3e5]/90 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.24em] text-[#0f6f46] shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
            About us
          </div>

          <h2 className="mt-4 font-display text-4xl font-extrabold leading-[1.12] text-[#0d2820] text-balance sm:text-5xl lg:text-[3.25rem]">
            Together, we create brighter futures.
          </h2>

          <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#35584b]">
            Hope Haven brings orphanages, donors, and volunteers onto one calm,
            trusted platform — making support simple, transparent, and human.
          </p>
        </div>

        {/* 3 Values Grid */}
        <div className="mt-14 grid gap-7 md:grid-cols-3 md:gap-8">
          {values.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group relative rounded-2xl border border-emerald-200/50 bg-white/55 p-7 backdrop-blur-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-300 hover:bg-white/90 hover:shadow-xl hover:shadow-emerald-950/5"
            >
              {/* Mint Icon Badge */}
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-emerald-300/80 bg-[#cff1e0] text-[#0d784a] shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:bg-[#0d784a] group-hover:text-white group-hover:shadow-md group-hover:shadow-emerald-800/20">
                <Icon size={24} strokeWidth={2.2} />
              </div>

              <h3 className="mt-6 font-display text-xl sm:text-2xl font-bold text-[#0d2820] transition-colors group-hover:text-[#0b663e]">
                {title}
              </h3>

              <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#3d5e52]">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;
