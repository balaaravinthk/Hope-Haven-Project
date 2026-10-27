import { Mail, Phone, MapPin } from "lucide-react";

function ContactSection() {
  const contacts = [
    {
      icon: Mail,
      title: "Email",
      detail: "hopehaven.org@gmail.com",
      href: "mailto:hopehaven.org@gmail.com",
    },
    {
      icon: Phone,
      title: "Phone",
      detail: "+91 98765 43210",
      href: "tel:+919876543210",
    },
    {
      icon: MapPin,
      title: "Address",
      detail: "Coimbatore, Tamil Nadu",
      href: null,
    },
  ];

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-gradient-to-br from-[#f2faf5] via-[#e5f6ed] to-[#d6f2e2] py-20 md:py-24"
    >
      {/* Background Graphic Elements - Mint Green Waves & Botanical Accents */}
      <div
        className="pointer-events-none absolute inset-0 select-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-16 -right-16 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-80 w-80 rounded-full bg-teal-200/30 blur-3xl" />

        {/* Soft Wave */}
        <svg
          className="absolute -bottom-8 right-0 h-48 w-96 text-[#a7dfc2]/35"
          viewBox="0 0 400 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 200 C150 140 280 180 400 100 L400 200 Z"
            fill="currentColor"
          />
        </svg>

        {/* Floating Leaves lightly in background */}
        <svg
          className="absolute top-16 left-[10%] h-9 w-9 -rotate-12 text-[#2f8f5b] opacity-20"
          viewBox="0 0 60 60"
          fill="currentColor"
        >
          <path d="M10 50 C12 25 32 12 50 10 C48 35 28 48 10 50 Z" />
        </svg>
        <svg
          className="absolute bottom-12 right-[12%] h-10 w-10 rotate-45 text-[#2f8f5b] opacity-20"
          viewBox="0 0 60 60"
          fill="currentColor"
        >
          <path d="M10 50 C12 25 32 12 50 10 C48 35 28 48 10 50 Z" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-5 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/70 bg-[#d8f3e5]/90 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.24em] text-[#0f6f46] shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
            Contact
          </div>

          <h2 className="mt-4 font-display text-4xl font-extrabold text-[#0d2820] md:text-5xl">
            Get in touch
          </h2>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#35584b]">
            Questions, ideas, or ways to help? We would love to hear from you.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {contacts.map(({ icon: Icon, title, detail, href }) => {
            const content = (
              <>
                <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl border border-emerald-300/80 bg-[#cff1e0] text-[#0d784a] shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:bg-[#0d784a] group-hover:text-white group-hover:shadow-md group-hover:shadow-emerald-800/20">
                  <Icon size={22} strokeWidth={2.2} />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-[#0d2820] transition-colors group-hover:text-[#0b663e]">
                  {title}
                </h3>
                <p className="mt-2 text-sm sm:text-base text-[#3d5e52] transition-colors group-hover:text-[#0d2820]">
                  {detail}
                </p>
              </>
            );

            const className =
              "group block rounded-2xl border border-emerald-200/60 bg-white/65 p-7 text-center backdrop-blur-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-300 hover:bg-white hover:shadow-xl hover:shadow-emerald-950/5 active:scale-[0.98]";

            return href ? (
              <a key={title} href={href} className={className}>
                {content}
              </a>
            ) : (
              <div key={title} className={className}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
