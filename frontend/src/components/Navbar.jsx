import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import logoBest from "../assets/logoisthebest.png";

function Navbar() {
  const [open, setOpen] = useState(false);

  const scrollTo = (id) => {
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
    setOpen(false);
  };

  const links = [
    { label: "Home", id: "home" },
    { label: "About", id: "about" },
    { label: "Services", id: "services" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b border-emerald-100/80 bg-white/90 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8">
        <button
          type="button"
          onClick={() => scrollTo("home")}
          className="group flex items-center gap-2.5 transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Hope Haven home"
        >
          <img
            src={logoBest}
            alt=""
            className="h-11 w-11 object-contain transition-transform duration-300 group-hover:rotate-3 md:h-12 md:w-12"
          />
          <span className="font-display text-2xl font-extrabold tracking-tight md:text-[1.7rem]">
            <span className="text-[#0e2e23]">Hope</span>
            <span className="text-[#10b981]">Haven</span>
          </span>
        </button>

        <div className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollTo(link.id)}
              className="rounded-lg px-3 py-1.5 font-display text-[0.95rem] font-semibold text-[#0e2e23]/80 transition-all duration-200 cursor-pointer hover:bg-emerald-50 hover:text-[#059669] hover:-translate-y-0.5 active:scale-95"
            >
              {link.label}
            </button>
          ))}

          <Link
            to="/admin/login"
            className="rounded-lg px-3 py-1.5 font-display text-[0.95rem] font-semibold text-[#059669] transition-all duration-200 hover:bg-emerald-50 hover:text-[#0e2e23] hover:-translate-y-0.5 active:scale-95"
          >
            Admin Portal
          </Link>

          <Link
            to="/login"
            className="rounded-lg px-3 py-1.5 font-display text-[0.95rem] font-semibold text-[#0e2e23]/80 transition-all duration-200 hover:bg-emerald-50 hover:text-[#059669] hover:-translate-y-0.5 active:scale-95"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 font-display text-[0.95rem] font-bold text-white shadow-md shadow-emerald-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/40 active:translate-y-0 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <span>Join Us</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-[#0e2e23] transition-all duration-200 hover:bg-emerald-50 active:scale-90 lg:hidden cursor-pointer"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-emerald-100 bg-white/95 px-5 py-4 shadow-xl backdrop-blur-md lg:hidden animate-rise">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollTo(link.id)}
                className={`text-left font-display text-base font-semibold py-1.5 transition-colors ${
                  link.id === "home" ? "text-[#10b981] font-bold" : "text-[#0e2e23] hover:text-[#10b981]"
                }`}
              >
                {link.label}
              </button>
            ))}

            <Link
              to="/admin/login"
              className="py-1.5 font-display text-base font-semibold text-[#059669] hover:text-[#0e2e23]"
              onClick={() => setOpen(false)}
            >
              Admin Portal
            </Link>

            <Link
              to="/login"
              className="py-1.5 font-display text-base font-semibold text-[#0e2e23] hover:text-[#10b981]"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>

            <Link
              to="/register"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3 font-display text-base font-bold text-white shadow-md shadow-emerald-500/20 active:scale-95"
              onClick={() => setOpen(false)}
            >
              <span>Join Us</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
