import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import logoBest from "../assets/logoisthebest.png";
import api from "../services/api";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await api.post("/admin/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      const data = response.data?.data;
      if (!data || !data.accessToken) {
        throw new Error("Admin login succeeded but no token received.");
      }

      // Persist admin session
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/admin/dashboard");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Admin authentication failed. Please verify credentials.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f2faf5] via-[#e5f6ed] to-[#d6f2e2]">
      {/* Background Graphic Elements - Mint Green Waves & Botanical Foliage */}
      <div
        className="pointer-events-none absolute inset-0 select-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-200/35 blur-3xl" />
        <div className="absolute top-1/2 -right-20 h-96 w-96 rounded-full bg-emerald-300/25 blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 h-80 w-80 rounded-full bg-teal-200/25 blur-3xl" />

        {/* Soft Flowing Wave */}
        <svg
          className="absolute -top-10 -right-20 h-full w-[600px] text-[#a7dfc2]/40"
          viewBox="0 0 800 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M800 0 C640 120 540 260 560 440 C580 620 480 720 380 800 L800 800 Z"
            fill="currentColor"
            opacity="0.5"
          />
          <path
            d="M800 160 C680 260 620 380 640 520 C660 660 580 740 520 800 L800 800 Z"
            fill="#8fd3b0"
            opacity="0.3"
          />
        </svg>

        {/* Botanical Foliage in Bottom Left */}
        <svg
          className="absolute bottom-0 left-0 h-64 w-64 text-[#2f8f5b] opacity-20 md:h-80 md:w-80"
          viewBox="0 0 300 300"
          fill="currentColor"
        >
          <path
            d="M-20 320 Q60 220 120 140 Q170 70 230 20"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path d="M50 240 C35 210 20 205 0 210 C10 230 25 245 50 240 Z" />
          <path d="M60 230 C85 220 100 205 105 185 C90 195 75 210 60 230 Z" />
          <path d="M90 180 C70 155 55 152 35 160 C45 178 62 188 90 180 Z" />
          <path d="M102 170 C125 155 138 140 142 120 C125 132 112 150 102 170 Z" />
        </svg>

        {/* Floating Leaves lightly in background */}
        <svg
          className="absolute top-[20%] left-[8%] h-10 w-10 -rotate-12 text-[#2f8f5b] opacity-20"
          viewBox="0 0 60 60"
          fill="currentColor"
        >
          <path d="M10 50 C12 25 32 12 50 10 C48 35 28 48 10 50 Z" />
        </svg>
        <svg
          className="absolute bottom-[25%] right-[10%] h-11 w-11 rotate-45 text-[#2f8f5b] opacity-20"
          viewBox="0 0 60 60"
          fill="currentColor"
        >
          <path d="M10 50 C12 25 32 12 50 10 C48 35 28 48 10 50 Z" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-12">
        {/* Header navigation */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <img src={logoBest} alt="Hope Haven" className="h-11 w-11 object-contain" />
            <span className="font-display text-2xl font-extrabold tracking-tight">
              <span className="text-[#0e2e23]">Hope</span>
              <span className="text-[#10b981]">Haven</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="font-display text-sm font-semibold text-[#0e2e23]/70 transition-colors hover:text-[#059669]"
            >
              User Login
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-display text-sm font-semibold text-[#0e2e23]/70 transition-colors hover:text-[#059669]"
            >
              <ArrowLeft size={16} />
              Home
            </Link>
          </div>
        </div>

        {/* Hero title */}
        <div className="animate-rise mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/70 bg-[#d8f3e5]/90 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.24em] text-[#0f6f46] shadow-xs">
            <Shield className="h-3.5 w-3.5 text-[#0f6f46]" />
            Restricted Access
          </div>
          <h1 className="mt-4 font-display text-4xl font-extrabold text-[#0d2820] text-balance md:text-5xl">
            Admin Portal Login
          </h1>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#35584b]">
            Administrative portal to verify registered orphanages, approve institutional accounts, and review submitted verification documents.
          </p>
        </div>

        {/* Login form card */}
        <form onSubmit={handleSubmit} className="animate-rise-delay mx-auto mt-8 max-w-xl">
          <div className="rounded-2xl border border-emerald-200/60 bg-white/95 p-6 shadow-xl shadow-emerald-950/5 backdrop-blur-sm md:p-8">
            {/* Error Notification Alert */}
            {errorMessage && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/95 p-4 text-sm font-medium text-rose-700 animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
                <div className="flex-1">{errorMessage}</div>
              </div>
            )}

            <div className="grid gap-5">
              <label className="block">
                <span className="mb-2 block font-display text-sm font-semibold text-[#0d2820]">
                  Admin Email
                </span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hopehaven.org"
                  className="w-full rounded-xl border border-emerald-200/80 bg-[#f7fcf9] px-4 py-3 text-[#0d2820] outline-none transition-all placeholder:text-[#3d5e52]/50 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block font-display text-sm font-semibold text-[#0d2820]">
                  Password
                </span>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full rounded-xl border border-emerald-200/80 bg-[#f7fcf9] px-4 py-3 pr-12 text-[#0d2820] outline-none transition-all placeholder:text-[#3d5e52]/50 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-[#3d5e52] transition-colors hover:text-[#0d2820] cursor-pointer active:scale-90"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={!email || !password || loading}
              className="group relative overflow-hidden mt-7 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3.5 font-display text-base font-bold text-white shadow-md shadow-emerald-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/35 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none cursor-pointer"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Log in as Administrator</span>
                )}
              </span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
            </button>

            <div className="mt-6 border-t border-emerald-100 pt-4 text-center">
              <Link
                to="/login"
                className="text-xs font-semibold text-[#0d2820]/70 hover:text-[#059669] transition-colors"
              >
                ← Return to standard User Login
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
