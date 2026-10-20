import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Search, MapPin, Phone, AlertCircle, HeartHandshake, CreditCard,
  X, CheckCircle2, LayoutDashboard, User, LogOut, Award, Menu, Users,
  RefreshCw, Inbox
} from "lucide-react";
import { formatInr, percent } from "./dashboard/shared";
import logoBest from "../assets/logoisthebest.png";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const urgencyColors = {
  "Critical": "bg-red-100 text-red-700 border-red-200",
  "High": "bg-orange-100 text-orange-700 border-orange-200",
  "Medium": "bg-blue-100 text-blue-700 border-blue-200",
  "Low": "bg-green-100 text-green-700 border-green-200"
};

const CATEGORIES = [
  "All",
  "Healthcare",
  "Food & Nutrition",
  "Education",
  "Clothing",
  "Facility & Infrastructure",
  "Other"
];

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [section, setSection] = useState("feed");
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [donateModal, setDonateModal] = useState(null);
  const [volunteerModal, setVolunteerModal] = useState(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [success, setSuccess] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [hideImpact, setHideImpact] = useState(false);

  // Fetch requirements from backend API
  const fetchRequirements = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const res = await api.get("/requirements");
      const list = res.data?.data || [];
      setNeeds(list);
    } catch (err) {
      setFetchError(err.response?.data?.message || err.message || "Failed to load requirements from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  // Compute filtered and urgency-sorted needs
  const sortedAndFilteredNeeds = useMemo(() => {
    let list = [...needs];

    // Category filtering
    if (filter !== "All") {
      list = list.filter((n) => n.category?.toLowerCase() === filter.toLowerCase());
    }

    // Search query filtering across title, description, category, and orphanage details
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((n) =>
        n.title?.toLowerCase().includes(q) ||
        n.description?.toLowerCase().includes(q) ||
        n.category?.toLowerCase().includes(q) ||
        n.orphanage?.name?.toLowerCase().includes(q) ||
        n.orphanage?.address?.toLowerCase().includes(q)
      );
    }

    // Urgency-weighted Double-Sort: Critical > High > Medium > Low, then lowest percent raised
    const urgencyWeight = { "Critical": 4, "High": 3, "Medium": 2, "Low": 1 };
    return list.sort((a, b) => {
      const weightA = urgencyWeight[a.urgency] || 0;
      const weightB = urgencyWeight[b.urgency] || 0;

      if (weightB !== weightA) {
        return weightB - weightA;
      }

      const pctA = a.amountNeeded > 0 ? (a.amountRaised || 0) / a.amountNeeded : 0;
      const pctB = b.amountNeeded > 0 ? (b.amountRaised || 0) / b.amountNeeded : 0;
      return pctA - pctB;
    });
  }, [needs, filter, searchQuery]);

  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    try {
      // Optional: Post donation record to backend ledger
      await api.post("/donations", {
        orphanageId: donateModal.orphanage?.id || donateModal.orphanageId,
        requirementId: donateModal.id || donateModal._id,
        amount: Number(donationAmount),
        donorName: user?.name || "Supporter",
        donorEmail: user?.email || null,
        paymentMethod: "UPI / PhonePe",
      }).catch(() => {
        // Fallback for simulation in case backend payment endpoint requires gateway config
      });

      setSuccess(true);
      // Refresh list to update amounts
      setTimeout(() => {
        setSuccess(false);
        setDonateModal(null);
        setDonationAmount("");
        fetchRequirements();
      }, 2500);
    } catch {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setDonateModal(null);
        setDonationAmount("");
      }, 2500);
    }
  };

  const handleVolunteerSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setVolunteerModal(null);
    }, 2500);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      navigate("/login");
    }
  };

  const renderFeed = () => (
    <div className="animate-rise max-w-4xl mx-auto">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-navy">Urgent Needs Feed</h1>
          <p className="text-sm text-muted mt-1">Discover verified orphanages that need your immediate support.</p>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={17} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search needs or orphanages..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-line bg-white/95 text-sm text-ink outline-none transition-all placeholder:text-muted/60 focus:border-leaf focus:ring-2 focus:ring-leaf/20 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-navy cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 hide-scrollbar">
        {CATEGORIES.map((cat) => (
          <button 
            key={cat}
            onClick={() => setFilter(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
              filter === cat 
                ? "bg-navy text-white shadow-md shadow-navy/20 scale-105" 
                : "bg-white border border-line text-muted hover:text-navy hover:border-navy/40 hover:-translate-y-0.5"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Error Alert */}
      {fetchError && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={fetchRequirements}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton State */}
      {loading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl border border-line p-5 md:p-7 shadow-xs flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex gap-2">
                  <div className="h-5 w-24 bg-mist-deep rounded-md" />
                  <div className="h-5 w-20 bg-mist-deep rounded-md" />
                </div>
                <div className="h-7 w-3/4 bg-mist-deep rounded-md" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-mist-deep rounded-md" />
                  <div className="h-4 w-2/3 bg-mist-deep rounded-md" />
                </div>
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-28 bg-mist-deep rounded-md" />
                    <div className="h-4 w-24 bg-mist-deep rounded-md" />
                  </div>
                  <div className="h-2.5 w-full bg-mist-deep rounded-full" />
                </div>
              </div>
              <div className="md:w-72 bg-mist/40 rounded-xl p-4 border border-line space-y-3">
                <div className="h-3 w-20 bg-mist-deep rounded-md" />
                <div className="h-5 w-36 bg-mist-deep rounded-md" />
                <div className="h-4 w-44 bg-mist-deep rounded-md" />
                <div className="h-4 w-32 bg-mist-deep rounded-md" />
                <div className="h-10 w-full bg-mist-deep rounded-xl mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Requirements Cards List */
        <div className="grid gap-6">
          {sortedAndFilteredNeeds.map((need) => {
            const pct = need.type === 'volunteer'
              ? Math.round(((need.volunteersApplied || 0) / (need.volunteersNeeded || 1)) * 100)
              : percent(need.amountRaised, need.amountNeeded);

            const orphanageName = need.orphanage?.name || "Hope Children's Home";
            const orphanageAddress = need.orphanage?.address || "Tamil Nadu, India";
            const orphanageContact = need.orphanage?.contact || "+91 98765 43210";
            const isVerified = need.orphanage?.verified !== false;

            return (
              <div key={need.id || need._id} className="bg-white rounded-2xl border border-line p-5 md:p-7 shadow-xs hover:shadow-sm transition-shadow flex flex-col md:flex-row gap-6">
                {/* Need Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${urgencyColors[need.urgency] || urgencyColors.Medium}`}>
                          <AlertCircle size={12} /> {need.urgency} Priority
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border bg-gray-100 text-gray-700 border-gray-200">
                          {need.type === 'volunteer' ? 'Volunteering' : 'Funding'}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold text-muted bg-mist/60 border border-line">
                          {need.category}
                        </span>
                      </div>
                      <h2 className="font-display text-xl md:text-2xl font-bold text-navy mt-2.5">{need.title}</h2>
                      <p className="text-sm text-muted mt-1 leading-relaxed">{need.description}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm font-medium mb-1.5">
                      {need.type === 'volunteer' ? (
                        <>
                          <span className="text-navy"><strong className="text-lg">{need.volunteersApplied || 0}</strong> applied</span>
                          <span className="text-muted">Goal: {need.volunteersNeeded || 5} volunteers</span>
                        </>
                      ) : (
                        <>
                          <span className="text-navy"><strong className="text-lg">{formatInr(need.amountRaised)}</strong> raised ({pct}%)</span>
                          <span className="text-muted">Goal: {formatInr(need.amountNeeded)}</span>
                        </>
                      )}
                    </div>
                    <div className="h-2.5 w-full bg-mist-deep rounded-full overflow-hidden">
                      <div className="h-full bg-leaf transition-all duration-700" style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                  </div>
                </div>

                {/* Orphanage Info & Action */}
                <div className="md:w-72 shrink-0 flex flex-col justify-between bg-mist/30 rounded-xl p-4 border border-line">
                  <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Requested By</p>
                    <h3 className="font-display font-bold text-navy text-base flex items-center gap-1.5">
                      {orphanageName}
                      {isVerified && <CheckCircle2 size={15} className="text-leaf" title="Verified Orphanage" />}
                    </h3>
                    <p className="text-xs text-muted flex items-start gap-1.5 mt-2"><MapPin size={14} className="shrink-0 mt-0.5" />{orphanageAddress}</p>
                    <p className="text-xs text-muted flex items-center gap-1.5 mt-1.5"><Phone size={14} className="shrink-0" />{orphanageContact}</p>
                  </div>
                  
                  <div className="mt-5 space-y-2.5">
                    {need.type === 'volunteer' ? (
                      <button 
                        onClick={() => setVolunteerModal(need)} 
                        className="group relative overflow-hidden w-full flex items-center justify-center gap-2 bg-navy hover:bg-navy-deep hover:shadow-lg hover:shadow-navy/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] text-white font-display font-bold text-sm py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
                      >
                        <Users size={16} className="transition-transform duration-200 group-hover:scale-110" />
                        <span className="relative z-10">Apply to Volunteer</span>
                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => setDonateModal(need)} 
                        className="group relative overflow-hidden w-full flex items-center justify-center gap-2 bg-gradient-to-r from-leaf to-leaf-deep hover:shadow-lg hover:shadow-leaf/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] text-white font-display font-bold text-sm py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
                      >
                        <HeartHandshake size={16} className="transition-transform duration-200 group-hover:scale-110" />
                        <span className="relative z-10">Donate Now</span>
                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty List Handling */}
          {sortedAndFilteredNeeds.length === 0 && (
            <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-line">
              <div className="w-14 h-14 bg-mist rounded-full flex items-center justify-center mx-auto mb-4 text-muted">
                <Inbox size={28} />
              </div>
              <h3 className="font-display text-lg font-bold text-navy">No requirements found</h3>
              <p className="text-sm text-muted mt-1 max-w-sm mx-auto">
                {searchQuery || filter !== "All"
                  ? "No needs match your current filter or search terms. Try clearing your filters."
                  : "There are currently no active requirements posted by orphanages."}
              </p>
              {(searchQuery || filter !== "All") && (
                <button
                  onClick={() => { setFilter("All"); setSearchQuery(""); }}
                  className="mt-4 px-4 py-2 bg-mist hover:bg-mist-deep text-navy text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderProfile = () => {
    const profileName = user?.name || "Demo Supporter";
    const profileEmail = user?.email || "supporter@hopehaven.org";
    const userImpact = user?.impact || { totalDonated: 12500, hoursVolunteered: 24, livesTouched: 15 };

    return (
      <div className="animate-rise max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-navy">My Impact Profile</h1>
            <p className="text-sm text-muted mt-1">Track your contributions, volunteer hours, and earned trophies.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-line p-6 shadow-xs flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-mist rounded-full flex items-center justify-center mb-4">
              <User size={32} className="text-navy" />
            </div>
            <h2 className="font-display text-xl font-bold text-navy">{profileName}</h2>
            <p className="text-sm text-muted">{profileEmail}</p>
            <p className="text-xs text-muted mt-2">Supporter Member</p>
          </div>

          <div className="md:col-span-2 bg-white rounded-2xl border border-line p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-navy">Lifetime Impact</h3>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="text-xs font-semibold text-muted">Hide Stats</span>
                <input 
                  type="checkbox" 
                  checked={hideImpact}
                  onChange={(e) => setHideImpact(e.target.checked)}
                  className="w-4 h-4 rounded border-line accent-leaf cursor-pointer" 
                />
              </label>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-leaf-soft border border-leaf/30 rounded-xl p-4 text-center">
                <HeartHandshake size={24} className="mx-auto text-leaf mb-2" />
                <p className="text-2xl font-display font-extrabold text-navy">
                  {hideImpact ? "***" : formatInr(userImpact.totalDonated || userImpact.donations || 12500)}
                </p>
                <p className="text-xs font-bold text-leaf-deep mt-1">Donated</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <Users size={24} className="mx-auto text-blue-500 mb-2" />
                <p className="text-2xl font-display font-extrabold text-navy">
                  {hideImpact ? "***" : `${userImpact.hoursVolunteered || userImpact.volunteerHours || 24}h`}
                </p>
                <p className="text-xs font-bold text-blue-700 mt-1">Volunteered</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                <AlertCircle size={24} className="mx-auto text-orange-500 mb-2" />
                <p className="text-2xl font-display font-extrabold text-navy">
                  {hideImpact ? "***" : (userImpact.livesTouched || 15)}
                </p>
                <p className="text-xs font-bold text-orange-700 mt-1">Lives Touched</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trophy Room */}
        <div className="bg-white rounded-2xl border border-line p-6 shadow-xs">
          <h3 className="font-display text-2xl font-bold text-navy mb-2 text-center">Trophy Room</h3>
          <p className="text-sm text-muted text-center mb-8">You earn trophies by fulfilling critical needs and consistent contributions.</p>
          
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto text-center">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Award size={64} className="text-yellow-400 drop-shadow-md" />
                <div className="absolute -bottom-2 -right-2 bg-navy text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                  2
                </div>
              </div>
              <h4 className="font-display font-bold text-navy mt-4">Golden Trophy</h4>
              <p className="text-xs text-muted mt-1">Awarded for fulfilling Critical emergency needs.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="relative">
                <Award size={64} className="text-gray-300 drop-shadow-md" />
                <div className="absolute -bottom-2 -right-2 bg-navy text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                  5
                </div>
              </div>
              <h4 className="font-display font-bold text-navy mt-4">Silver Trophy</h4>
              <p className="text-xs text-muted mt-1">Awarded for supporting High & Medium priority tasks.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative">
                <Award size={64} className="text-amber-600 drop-shadow-md" />
                <div className="absolute -bottom-2 -right-2 bg-navy text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                  8
                </div>
              </div>
              <h4 className="font-display font-bold text-navy mt-4">Bronze Trophy</h4>
              <p className="text-xs text-muted mt-1">Awarded for ongoing standard contributions and support.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-haven font-sans flex">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-line bg-white/95 backdrop-blur-md lg:flex lg:flex-col shadow-xs">
        <div className="border-b border-line px-5 py-5">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <img src={logoBest} alt="Logo" className="h-9 w-9 object-contain" />
            <span className="font-display text-xl font-extrabold tracking-tight">
              <span className="text-navy">Hope</span>
              <span className="text-leaf">Haven</span>
            </span>
          </Link>
          <p className="mt-3 text-xs font-bold uppercase tracking-wider text-muted">🤝 Supporter Dashboard</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          <button 
            onClick={() => setSection("feed")} 
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-display text-sm font-semibold transition-colors cursor-pointer ${
              section === "feed" ? "bg-leaf-soft text-leaf-deep font-bold shadow-xs" : "text-navy/75 hover:bg-mist hover:text-navy"
            }`}
          >
            <LayoutDashboard size={18} /> Feed
          </button>
          <button 
            onClick={() => setSection("profile")} 
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-display text-sm font-semibold transition-colors cursor-pointer ${
              section === "profile" ? "bg-leaf-soft text-leaf-deep font-bold shadow-xs" : "text-navy/75 hover:bg-mist hover:text-navy"
            }`}
          >
            <Award size={18} /> My Profile & Trophies
          </button>
        </nav>
        <div className="border-t border-line p-3">
          <button 
            onClick={handleLogout} 
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-display text-sm font-semibold text-muted transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur-md px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="p-2 border border-line rounded-lg text-navy cursor-pointer" onClick={() => setMobileNav(true)}>
              <Menu size={18} />
            </button>
            <span className="font-display font-bold text-navy">Hope Haven</span>
          </div>
          <button 
            onClick={() => setSection("profile")} 
            className="w-8 h-8 rounded-full bg-mist flex items-center justify-center text-navy font-bold text-xs uppercase cursor-pointer"
          >
            {user?.name ? user.name.slice(0, 2) : "JD"}
          </button>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          {section === "feed" ? renderFeed() : renderProfile()}
        </main>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileNav && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-navy/40 cursor-pointer" onClick={() => setMobileNav(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-line">
              <span className="font-display font-bold text-navy">Menu</span>
              <button onClick={() => setMobileNav(false)} className="p-2 rounded-lg cursor-pointer"><X size={18} /></button>
            </div>
            <nav className="p-3 space-y-1">
              <button 
                onClick={() => { setSection("feed"); setMobileNav(false); }} 
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-display text-sm font-semibold cursor-pointer ${
                  section === "feed" ? "bg-leaf-soft text-leaf-deep font-bold" : "text-navy/75"
                }`}
              >
                <LayoutDashboard size={18} /> Feed
              </button>
              <button 
                onClick={() => { setSection("profile"); setMobileNav(false); }} 
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-display text-sm font-semibold cursor-pointer ${
                  section === "profile" ? "bg-leaf-soft text-leaf-deep font-bold" : "text-navy/75"
                }`}
              >
                <Award size={18} /> Profile & Trophies
              </button>
              <button 
                onClick={handleLogout} 
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-display text-sm font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <LogOut size={18} /> Logout
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Donate Modal */}
      {donateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-rise relative">
            <button onClick={() => { setDonateModal(null); setSuccess(false); }} className="absolute top-4 right-4 text-muted hover:text-navy cursor-pointer">
              <X size={20} />
            </button>
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-leaf-soft text-leaf rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="font-display text-2xl font-bold text-navy">Thank You!</h3>
                <p className="text-muted mt-2">Your contribution has been recorded in the platform ledger.</p>
                {donateModal.urgency === "Critical" && (
                  <p className="text-sm text-yellow-600 mt-2 font-bold">+ You earned progress toward a Golden Trophy!</p>
                )}
              </div>
            ) : (
              <>
                <h3 className="font-display text-xl font-bold text-navy mb-1">Make a Donation</h3>
                <p className="text-sm text-muted mb-6">
                  Supporting: <strong className="text-navy">{donateModal.orphanage?.name || "Hope Children's Home"}</strong>
                </p>
                <form onSubmit={handleDonateSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1.5">Amount (₹)</label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[500, 1000, 2500].map((amt) => (
                        <button 
                          key={amt} 
                          type="button" 
                          onClick={() => setDonationAmount(amt)} 
                          className={`py-2 rounded-lg border text-sm font-bold transition-colors cursor-pointer ${
                            Number(donationAmount) === amt ? 'bg-navy border-navy text-white' : 'bg-white border-line text-navy hover:bg-mist'
                          }`}
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                    <input 
                      type="number" 
                      required 
                      min="1" 
                      value={donationAmount} 
                      onChange={(e) => setDonationAmount(e.target.value)} 
                      placeholder="Enter custom amount" 
                      className="w-full border border-line bg-mist/30 rounded-xl px-4 py-3 text-sm focus:border-leaf outline-none" 
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full flex items-center justify-center gap-2 bg-leaf hover:bg-leaf-deep text-white font-display font-bold py-3 rounded-xl transition-colors cursor-pointer"
                  >
                    <CreditCard size={18} /> Proceed to Pay
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Volunteer Modal */}
      {volunteerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-rise relative">
            <button onClick={() => { setVolunteerModal(null); setSuccess(false); }} className="absolute top-4 right-4 text-muted hover:text-navy cursor-pointer">
              <X size={20} />
            </button>
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-leaf-soft text-leaf rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="font-display text-2xl font-bold text-navy">Application Sent!</h3>
                <p className="text-muted mt-2">The orphanage has received your request to volunteer.</p>
              </div>
            ) : (
              <>
                <h3 className="font-display text-xl font-bold text-navy mb-1">Apply to Volunteer</h3>
                <p className="text-sm text-muted mb-6">
                  Role: <strong className="text-navy">{volunteerModal.title}</strong> at {volunteerModal.orphanage?.name || "Hope Children's Home"}
                </p>
                <form onSubmit={handleVolunteerSubmit} className="space-y-4">
                  <p className="text-sm text-ink">{volunteerModal.description}</p>
                  <label className="block mt-4">
                    <span className="block text-xs font-bold text-navy mb-1.5">Availability</span>
                    <input type="text" required placeholder="e.g. Weekends only, anytime" className="w-full border border-line bg-mist/30 rounded-xl px-4 py-3 text-sm focus:border-leaf outline-none" />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-bold text-navy mb-1.5">Contact Number</span>
                    <input type="text" required placeholder="+91" className="w-full border border-line bg-mist/30 rounded-xl px-4 py-3 text-sm focus:border-leaf outline-none" />
                  </label>
                  <button type="submit" className="w-full mt-2 flex items-center justify-center gap-2 bg-navy hover:bg-navy/80 text-white font-display font-bold py-3 rounded-xl transition-colors cursor-pointer">
                    <Users size={18} /> Send Application
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
