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
    <nav className="fixed top-0 left-0 z-50 w-full border-b border-line/70 bg-white/95 backdrop-blur-md shadow-xs">
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
            <span className="text-navy">Hope</span>
            <span className="text-leaf">Haven</span>
          </span>
        </button>

        <div className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollTo(link.id)}
              className="font-display text-[0.95rem] font-semibold text-navy/80 transition-all duration-200 cursor-pointer hover:text-leaf hover:-translate-y-0.5 active:scale-95"
            >
              {link.label}
            </button>
          ))}

          <Link
            to="/admin/login"
            className="font-display text-[0.95rem] font-semibold text-leaf-deep transition-all duration-200 hover:text-navy hover:-translate-y-0.5 active:scale-95"
          >
            Admin Portal
          </Link>

          <Link
            to="/login"
            className="font-display text-[0.95rem] font-semibold text-navy/80 transition-all duration-200 hover:text-leaf hover:-translate-y-0.5 active:scale-95"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-leaf to-leaf-deep px-5 py-2.5 font-display text-[0.95rem] font-bold text-white shadow-md shadow-leaf/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-leaf/40 active:translate-y-0 active:scale-95"
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
          className="rounded-lg p-2 text-navy transition-all duration-200 hover:bg-mist active:scale-90 lg:hidden cursor-pointer"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-white px-5 py-4 shadow-xl lg:hidden animate-rise">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollTo(link.id)}
                className={`text-left font-display text-base font-semibold py-1.5 transition-colors ${
                  link.id === "home" ? "text-leaf font-bold" : "text-navy hover:text-leaf"
                }`}
              >
                {link.label}
              </button>
            ))}

            <Link
              to="/admin/login"
              className="py-1.5 font-display text-base font-semibold text-leaf-deep hover:text-navy"
              onClick={() => setOpen(false)}
            >
              Admin Portal
            </Link>

            <Link
              to="/login"
              className="py-1.5 font-display text-base font-semibold text-navy hover:text-leaf"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>

            <Link
              to="/register"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-leaf to-leaf-deep px-5 py-3 font-display text-base font-bold text-white shadow-md shadow-leaf/20 active:scale-95"
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
