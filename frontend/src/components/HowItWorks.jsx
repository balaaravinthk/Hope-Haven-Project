function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Register",
      text: "Sign up as a donor, volunteer, or orphanage and join the Hope Haven community.",
    },
    {
      step: "02",
      title: "Connect",
      text: "Explore verified homes and find clear ways to donate, volunteer, or offer support.",
    },
    {
      step: "03",
      title: "Make an impact",
      text: "Your help goes toward education, healthcare, and everyday needs that change lives.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-24">
      {/* Light subtle leaf detail */}
      <div
        className="pointer-events-none absolute inset-0 select-none overflow-hidden"
        aria-hidden="true"
      >
        <svg
          className="absolute top-1/2 -left-8 h-20 w-20 rotate-45 text-[#2f8f5b] opacity-10"
          viewBox="0 0 60 60"
          fill="currentColor"
        >
          <path d="M10 50 C12 25 32 12 50 10 C48 35 28 48 10 50 Z" />
        </svg>
        <svg
          className="absolute top-1/3 -right-8 h-20 w-20 -rotate-12 text-[#2f8f5b] opacity-10"
          viewBox="0 0 60 60"
          fill="currentColor"
        >
          <path d="M10 50 C12 25 32 12 50 10 C48 35 28 48 10 50 Z" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/70 bg-[#d8f3e5]/90 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.24em] text-[#0f6f46] shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
            How it works
          </div>

          <h2 className="mt-4 font-display text-4xl font-extrabold text-[#0d2820] text-balance md:text-5xl">
            Making a difference is simple.
          </h2>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#35584b]">
            Three clear steps — from joining Hope Haven to supporting children
            with care you can trust.
          </p>
        </div>

        <ol className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          <div
            className="pointer-events-none absolute top-7 right-[16%] left-[16%] hidden h-0.5 bg-emerald-200/80 md:block"
            aria-hidden="true"
          />
          {steps.map((item) => (
            <li key={item.step} className="relative text-center md:px-4">
              <span className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-emerald-400 bg-[#d8f3e5] font-display text-lg font-black text-[#0d784a] shadow-sm shadow-emerald-700/10">
                {item.step}
              </span>
              <h3 className="mt-6 font-display text-2xl font-bold text-[#0d2820]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#3d5e52]">
                {item.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default HowItWorks;
