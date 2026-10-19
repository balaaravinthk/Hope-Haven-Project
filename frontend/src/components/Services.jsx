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
    <section id="services" className="bg-mist py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-sm font-bold uppercase tracking-[0.28em] text-leaf">
            Our services
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold text-navy text-balance md:text-5xl">
            How you can make a difference.
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted">
            Whether you give, volunteer, or partner — every step helps a child
            feel safer, supported, and hopeful.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {services.map(({ icon: Icon, title, text, action, to }) => (
            <article
              key={title}
              className="group flex flex-col rounded-2xl border border-line bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-leaf/50 hover:shadow-xl hover:shadow-leaf/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-leaf-soft text-leaf transition-all duration-300 group-hover:scale-110 group-hover:bg-leaf group-hover:text-white">
                <Icon size={24} />
              </div>
              <h3 className="mt-5 font-display text-2xl font-bold text-navy transition-colors group-hover:text-leaf-deep">
                {title}
              </h3>
              <p className="mt-3 flex-1 leading-7 text-muted">{text}</p>
              <Link
                to={to}
                className="mt-7 inline-flex items-center gap-1.5 font-display font-bold text-leaf transition-all duration-200 group-hover:gap-2.5 group-hover:text-leaf-deep active:scale-95"
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
