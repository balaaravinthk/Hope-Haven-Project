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
    <div className="relative min-h-screen overflow-hidden bg-haven">
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(26,54,84,0.08) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <img
              src={logoBest}
              alt=""
              className="h-11 w-11 object-contain"
            />
            <span className="font-display text-2xl font-extrabold tracking-tight">
              <span className="text-navy">Hope</span>
              <span className="text-leaf">Haven</span>
            </span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 font-display text-sm font-semibold text-navy/70 transition-colors hover:text-leaf"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>

        <div className="animate-rise mx-auto max-w-2xl text-center">
          <p className="font-display text-sm font-bold uppercase tracking-[0.28em] text-leaf">
            Welcome back
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-navy text-balance md:text-5xl">
            Log in to Hope Haven
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted">
            Select your role below to access the correct dashboard.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="animate-rise-delay mx-auto mt-10 max-w-xl"
        >
          <div className="rounded-2xl border border-line bg-white/90 p-6 backdrop-blur-sm md:p-8">
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
                      ? "bg-navy text-white shadow-md shadow-navy/25 scale-[1.02]"
                      : "bg-mist/60 text-navy/80 border border-line hover:bg-mist hover:text-navy"
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
                <span className="mb-2 block font-display text-sm font-semibold text-navy">
                  Email
                </span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="you@email.com"
                  className="w-full rounded-xl border border-line bg-mist/40 px-4 py-3 text-ink outline-none transition-all placeholder:text-muted/60 focus:border-leaf focus:bg-white focus:ring-2 focus:ring-leaf/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block font-display text-sm font-semibold text-navy">
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
                    className="w-full rounded-xl border border-line bg-mist/40 px-4 py-3 pr-12 text-ink outline-none transition-all placeholder:text-muted/60 focus:border-leaf focus:bg-white focus:ring-2 focus:ring-leaf/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted transition-colors hover:text-navy cursor-pointer active:scale-90"
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
                  className="h-4 w-4 rounded border-line accent-leaf cursor-pointer"
                />
                <span className="text-sm text-muted">Remember me</span>
              </label>
              <span className="text-sm font-medium text-muted/70">
                Forgot password? Coming soon
              </span>
            </div>

            <button
              type="submit"
              disabled={!form.email || !form.password || loading}
              className="group relative overflow-hidden mt-7 w-full rounded-xl bg-gradient-to-r from-leaf to-leaf-deep px-6 py-3.5 font-display text-base font-bold text-white shadow-md shadow-leaf/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-leaf/35 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-leaf/40 disabled:hover:translate-y-0 disabled:shadow-none cursor-pointer"
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

            <p className="mt-5 text-center text-sm text-muted">
              New here?{" "}
              <Link
                to="/register"
                className="font-display font-bold text-leaf transition-colors hover:text-leaf-deep"
              >
                Create an account
              </Link>
            </p>

            <div className="mt-5 border-t border-line/70 pt-4 text-center">
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy/70 hover:text-leaf transition-colors"
              >
                <Shield size={14} className="text-leaf-deep" />
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
