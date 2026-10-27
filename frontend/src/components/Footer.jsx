import { Link } from "react-router-dom";
import logoBest from "../assets/logoisthebest.png";

function Footer() {
  return (
    <footer className="border-t border-emerald-900/40 bg-[#071c14] text-white">
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-3">
            <img
              src={logoBest}
              alt=""
              className="h-11 w-11 rounded-full bg-white/95 object-contain p-0.5 shadow-sm"
            />
            <p className="font-display text-2xl font-extrabold tracking-tight">
              Hope<span className="text-emerald-400">Haven</span>
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 font-display text-sm font-semibold text-white/75">
            <a href="#about" className="transition-colors hover:text-emerald-300">
              About
            </a>
            <a href="#services" className="transition-colors hover:text-emerald-300">
              Services
            </a>
            <a href="#contact" className="transition-colors hover:text-emerald-300">
              Contact
            </a>
            <Link to="/admin/login" className="transition-colors text-emerald-400 hover:text-emerald-300">
              Admin Portal
            </Link>
          </div>
        </div>

        <div className="my-8 border-t border-emerald-900/30" />

        <div className="flex flex-col items-center justify-between gap-3 text-sm text-emerald-100/50 md:flex-row">
          <p>© 2026 Hope Haven. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
            Care. Love. Support. Together.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
