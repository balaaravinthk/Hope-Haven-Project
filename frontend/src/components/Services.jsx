import { Link } from "react-router-dom";
import { Gift, HandHeart, Building2, ArrowRight } from "lucide-react";

function Services() {
  const services = [
    {
      icon: Gift,
      title: "Donate",
      text: "Support education, healthcare, meals, and daily essentials for children in verified homes.",
      action: "Start giving",
      to: "/register",
    },
    {
      icon: HandHeart,
      title: "Volunteer",
      text: "Share your time and skills — mentor, teach, and bring encouragement where it matters.",
      action: "Join as volunteer",
      to: "/register",
    },
    {
      icon: Building2,
      title: "Partner with us",
      text: "Register your orphanage or organization and connect with donors and volunteers nearby.",
      action: "Register home",
      to: "/register",
    },
  ];

  return (
    <section
      id="services"
      className="relative overflow-hidden bg-gradient-to-b from-[#d6f2e2]/35 via-[#f2faf5] to-[#f8fcf9] py-20 md:py-24"
    >
      {/* Light Background Botanical Accents */}
      <div
        className="pointer-events-none absolute inset-0 select-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-10 -left-10 h-72 w-72 rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="absolute bottom-10 -right-10 h-72 w-72 rounded-full bg-teal-200/20 blur-3xl" />

        {/* Soft Translucent Leaves */}
        <svg
          className="absolute top-12 right-[8%] h-10 w-10 rotate-12 text-[#2f8f5b] opacity-15"
          viewBox="0 0 60 60"
          fill="currentColor"
        >
          <path d="M10 50 C12 25 32 12 50 10 C48 35 28 48 10 50 Z" />
        </svg>
        <svg
          className="absolute bottom-16 left-[6%] h-10 w-10 -rotate-45 text-[#2f8f5b] opacity-15"
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
            Our services
          </div>

          <h2 className="mt-4 font-display text-4xl font-extrabold text-[#0d2820] text-balance md:text-5xl">
            How you can make a difference.
          </h2>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#35584b]">
            Whether you give, volunteer, or partner — every step helps a child
            feel safer, supported, and hopeful.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {services.map(({ icon: Icon, title, text, action, to }) => (
            <article
              key={title}
              className="group flex flex-col rounded-2xl border border-emerald-200/60 bg-white/85 p-7 backdrop-blur-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-400 hover:bg-white hover:shadow-xl hover:shadow-emerald-950/5"
            >
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-emerald-300/80 bg-[#cff1e0] text-[#0d784a] shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:bg-[#0d784a] group-hover:text-white group-hover:shadow-md group-hover:shadow-emerald-800/20">
                <Icon size={24} strokeWidth={2.2} />
              </div>
              <h3 className="mt-5 font-display text-2xl font-bold text-[#0d2820] transition-colors group-hover:text-[#0b663e]">
                {title}
              </h3>
              <p className="mt-3 flex-1 text-sm sm:text-base leading-relaxed text-[#3d5e52]">
                {text}
              </p>
              <Link
                to={to}
                className="mt-7 inline-flex items-center gap-1.5 font-display font-bold text-[#0d784a] transition-all duration-200 group-hover:gap-2.5 group-hover:text-[#095735] active:scale-95"
              >
                <span>{action}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
