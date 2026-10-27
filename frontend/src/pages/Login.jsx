import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, AlertCircle, Loader2, Shield } from "lucide-react";
import logoBest from "../assets/logoisthebest.png";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login, loading, error: authError, setError } = useAuth();

  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("donor"); // 'donor', 'orphanage'
  const [errorMessage, setErrorMessage] = useState("");

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage("");
    if (authError) setError(null);
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (errorMessage) setErrorMessage("");
    if (authError) setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    try {
      // Map frontend tab role to backend enum ('supporter' or 'orphanage')
      const targetRole = role === "orphanage" ? "orphanage" : "supporter";

      const authData = await login({
        email: form.email,
        password: form.password,
        role: targetRole,
      });

      // Navigate to appropriate dashboard based on authenticated user role
      const assignedRole = authData?.user?.role || targetRole;
      if (assignedRole === "orphanage") {
        navigate("/orphanage/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to log in. Please check your credentials.");
    }
  };

  const activeError = errorMessage || authError;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f2faf5] via-[#e5f6ed] to-[#d6f2e2]">
      {/* Background Graphic Elements - Mint Green Waves & Botanical Leaves */}
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
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <img
              src={logoBest}
              alt=""
              className="h-11 w-11 object-contain"
            />
            <span className="font-display text-2xl font-extrabold tracking-tight">
              <span className="text-[#0e2e23]">Hope</span>
              <span className="text-[#10b981]">Haven</span>
            </span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 font-display text-sm font-semibold text-[#0e2e23]/70 transition-colors hover:text-[#059669]"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>

        <div className="animate-rise mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/70 bg-[#d8f3e5]/90 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.24em] text-[#0f6f46] shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
            Welcome back
          </div>
          <h1 className="mt-4 font-display text-4xl font-extrabold text-[#0d2820] text-balance md:text-5xl">
            Log in to Hope Haven
          </h1>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#35584b]">
            Select your role below to access the correct dashboard.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="animate-rise-delay mx-auto mt-10 max-w-xl"
        >
          <div className="rounded-2xl border border-emerald-200/60 bg-white/90 p-6 backdrop-blur-sm shadow-sm md:p-8">
            <div className="flex gap-2 mb-6">
              {[
                { id: "donor", label: "Donor / Volunteer" },
                { id: "orphanage", label: "Orphanage" }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleChange(r.id)}
                  className={`flex-1 py-2.5 rounded-xl font-display text-sm font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
                    role === r.id
                      ? "bg-[#0e2e23] text-white shadow-md shadow-emerald-950/20 scale-[1.02]"
                      : "bg-[#eaf7f0] text-[#0e2e23]/80 border border-emerald-200 hover:bg-[#ddf2e5] hover:text-[#0e2e23]"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Error Notification Alert */}
            {activeError && (
              <div
                className={`mb-5 flex items-start gap-3 rounded-xl border p-4 text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-200 ${
                  activeError.toLowerCase().includes("rejected") || activeError.toLowerCase().includes("cancelled")
                    ? "border-rose-300 bg-rose-50 text-rose-800"
                    : activeError.toLowerCase().includes("pending")
                    ? "border-amber-300 bg-amber-50 text-amber-800"
                    : "border-rose-200 bg-rose-50/90 text-rose-700"
                }`}
              >
                <AlertCircle
                  className={`h-5 w-5 shrink-0 mt-0.5 ${
                    activeError.toLowerCase().includes("rejected") || activeError.toLowerCase().includes("cancelled")
                      ? "text-rose-600"
                      : activeError.toLowerCase().includes("pending")
                      ? "text-amber-600"
                      : "text-rose-600"
                  }`}
                />
                <div className="flex-1">
                  <div className="font-bold">
                    {activeError.toLowerCase().includes("rejected") || activeError.toLowerCase().includes("cancelled")
                      ? "Registration Rejected / Cancelled"
                      : activeError.toLowerCase().includes("pending")
                      ? "Registration Pending Approval"
                      : "Login Error"}
                  </div>
                  <div className="mt-0.5 text-xs md:text-sm">{activeError}</div>
                </div>
              </div>
            )}

            <div className="grid gap-5">
              <label className="block">
                <span className="mb-2 block font-display text-sm font-semibold text-[#0d2820]">
                  Email
                </span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="you@email.com"
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
                    minLength={6}
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    placeholder="Your password"
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

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) => updateField("remember", e.target.checked)}
                  className="h-4 w-4 rounded border-emerald-300 accent-emerald-600 cursor-pointer"
                />
                <span className="text-sm text-[#3d5e52]">Remember me</span>
              </label>
              <span className="text-sm font-medium text-[#3d5e52]/70">
                Forgot password? Coming soon
              </span>
            </div>

            <button
              type="submit"
              disabled={!form.email || !form.password || loading}
              className="group relative overflow-hidden mt-7 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3.5 font-display text-base font-bold text-white shadow-md shadow-emerald-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/35 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none cursor-pointer"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <span>Log in</span>
                )}
              </span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
            </button>

            <p className="mt-5 text-center text-sm text-[#3d5e52]">
              New here?{" "}
              <Link
                to="/register"
                className="font-display font-bold text-[#059669] transition-colors hover:text-[#047857]"
              >
                Create an account
              </Link>
            </p>

            <div className="mt-5 border-t border-emerald-100 pt-4 text-center">
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0d2820]/70 hover:text-[#059669] transition-colors"
              >
                <Shield size={14} className="text-[#059669]" />
                <span>Administrator? Access Admin Portal →</span>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
