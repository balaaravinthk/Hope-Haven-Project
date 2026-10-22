import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import logoBest from "../assets/logoisthebest.png";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const AUTHORIZED_ADMINS = [
  "bala@gmail.com",
  "guru@gmail.com",
  "abi@gmail.com",
  "dhandapani@gmail.com",
];

function AdminLogin() {
  const navigate = useNavigate();
  const { setError: setAuthError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSelectAdmin = (adminEmail) => {
    setEmail(adminEmail);
    if (!password) {
      setPassword("12345");
    }
    setErrorMessage("");
  };

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
        {/* Header navigation */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <img src={logoBest} alt="Hope Haven" className="h-11 w-11 object-contain" />
            <span className="font-display text-2xl font-extrabold tracking-tight">
              <span className="text-navy">Hope</span>
              <span className="text-leaf">Haven</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="font-display text-sm font-semibold text-navy/70 transition-colors hover:text-leaf"
            >
              User Login
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-display text-sm font-semibold text-navy/70 transition-colors hover:text-leaf"
            >
              <ArrowLeft size={16} />
              Home
            </Link>
          </div>
        </div>

        {/* Hero title */}
        <div className="animate-rise mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-navy/20 bg-navy/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-navy">
            <Shield className="h-3.5 w-3.5 text-navy" />
            Restricted Access
          </div>
          <h1 className="font-display text-4xl font-extrabold text-navy text-balance md:text-5xl">
            Admin Portal Login
          </h1>
          <p className="mt-3 text-base leading-7 text-muted">
            Administrative portal to verify registered orphanages, approve institutional accounts, and review submitted verification documents.
          </p>
        </div>

        {/* Login form card */}
        <form onSubmit={handleSubmit} className="animate-rise-delay mx-auto mt-8 max-w-xl">
          <div className="rounded-2xl border border-line bg-white/95 p-6 shadow-xl shadow-navy/5 backdrop-blur-sm md:p-8">
            {/* Authorized Admin Quick Select */}
            <div className="mb-6 rounded-xl border border-leaf/30 bg-leaf/5 p-4">
              <p className="font-display text-xs font-bold uppercase tracking-wider text-leaf-deep">
                Authorized Admin Accounts (Click to Fill):
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {AUTHORIZED_ADMINS.map((adminEmail) => (
                  <button
                    key={adminEmail}
                    type="button"
                    onClick={() => handleSelectAdmin(adminEmail)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                      email.toLowerCase() === adminEmail
                        ? "border-navy bg-navy text-white shadow-sm"
                        : "border-line bg-white text-navy/80 hover:border-leaf hover:text-navy"
                    }`}
                  >
                    {adminEmail}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Notification Alert */}
            {errorMessage && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/95 p-4 text-sm font-medium text-rose-700 animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
                <div className="flex-1">{errorMessage}</div>
              </div>
            )}

            <div className="grid gap-5">
              <label className="block">
                <span className="mb-2 block font-display text-sm font-semibold text-navy">
                  Admin Email
                </span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  placeholder="admin@gmail.com"
                  className="w-full rounded-xl border border-line bg-mist/40 px-4 py-3 text-ink outline-none transition-all placeholder:text-muted/60 focus:border-navy focus:bg-white focus:ring-2 focus:ring-navy/20 font-medium"
                />
              </label>

              <label className="block">
                <span className="mb-2 block font-display text-sm font-semibold text-navy">
                  Password
                </span>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    placeholder="Enter admin password"
                    className="w-full rounded-xl border border-line bg-mist/40 px-4 py-3 pr-12 text-ink outline-none transition-all placeholder:text-muted/60 focus:border-navy focus:bg-white focus:ring-2 focus:ring-navy/20 font-medium"
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

            <button
              type="submit"
              disabled={!email || !password || loading}
              className="group relative overflow-hidden mt-7 w-full rounded-xl bg-gradient-to-r from-navy to-navy-deep px-6 py-3.5 font-display text-base font-bold text-white shadow-md shadow-navy/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-navy/35 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Verifying Admin Access...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    <span>Login to Admin Portal</span>
                  </>
                )}
              </span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
            </button>

            <div className="mt-6 border-t border-line/70 pt-5 text-center text-xs text-muted">
              Note: Administrative access is strictly limited to pre-approved credentials. All actions are logged and audited.
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
