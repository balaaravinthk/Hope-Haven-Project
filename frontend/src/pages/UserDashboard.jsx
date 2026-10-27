import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Search, MapPin, Phone, AlertCircle, HeartHandshake, CreditCard,
  X, CheckCircle2, LayoutDashboard, User, LogOut, Award, Menu, Users,
  RefreshCw, Inbox, Loader2, Calendar, Bell
} from "lucide-react";
import { formatInr, percent } from "./dashboard/shared";
import logoBest from "../assets/logoisthebest.png";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const urgencyColors = {
  "Critical": "bg-red-100 text-red-700 border-red-200",
  "High": "bg-orange-100 text-orange-700 border-orange-200",
  "Medium": "bg-emerald-100 text-emerald-800 border-emerald-200",
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
  const [volunteerSkills, setVolunteerSkills] = useState("");
  const [volunteerSchedule, setVolunteerSchedule] = useState("");
  const [volunteerPhone, setVolunteerPhone] = useState("");
  const [volunteerName, setVolunteerName] = useState("");
  const [isVolunteering, setIsVolunteering] = useState(false);
  const [volunteerError, setVolunteerError] = useState("");
  const [volunteerSuccess, setVolunteerSuccess] = useState(false);

  const [donationAmount, setDonationAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI / PhonePe");
  const [taxPan, setTaxPan] = useState("");
  const [showDonor, setShowDonor] = useState(true);
  const [isDonating, setIsDonating] = useState(false);
  const [donateError, setDonateError] = useState("");
  const [donationReceiptId, setDonationReceiptId] = useState(null);

  const [success, setSuccess] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [hideImpact, setHideImpact] = useState(false);

  const [userImpact, setUserImpact] = useState({
    totalDonated: 0,
    hoursVolunteered: 0,
    livesTouched: 0,
    goldenTrophies: 0,
    silverTrophies: 0,
    bronzeTrophies: 0,
    rank: "Supporter Member",
    trophies: [],
  });

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [myApplications, setMyApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  // Fetch requirements & volunteer roles from backend API
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

  // Fetch live supporter impact stats from MongoDB via GET /api/users/impact
  const fetchUserImpact = async () => {
    try {
      const res = await api.get("/users/impact");
      if (res.data?.data) {
        setUserImpact(res.data.data);
      }
    } catch (err) {
      console.warn("Could not load user impact stats:", err.message);
    }
  };

  // Fetch live notifications for supporter via GET /api/notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      if (res.data?.data) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (err) {
      console.warn("Could not load notifications:", err.message);
    }
  };

  // Fetch live volunteer applications submitted by user via GET /api/volunteers/my-applications
  const fetchMyApplications = async () => {
    try {
      setLoadingApplications(true);
      const res = await api.get("/volunteers/my-applications");
      if (res.data?.data) {
        setMyApplications(res.data.data);
      }
    } catch (err) {
      console.warn("Could not load my volunteer applications:", err.message);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id || n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn("Could not mark notification as read:", err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn("Could not mark all as read:", err.message);
    }
  };

  useEffect(() => {
    fetchRequirements();
    fetchUserImpact();
    fetchNotifications();
    fetchMyApplications();
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
    const donatedAmt = Number(donationAmount);
    if (!donatedAmt || donatedAmt <= 0) return;

    setIsDonating(true);
    setDonateError("");

    try {
      const targetReqId = donateModal.id || donateModal._id;
      const targetOrphId = donateModal.orphanage?.id || donateModal.orphanageId || donateModal.orphanage?._id;

      const res = await api.post("/donations", {
        orphanageId: targetOrphId,
        requirementId: targetReqId,
        amount: donatedAmt,
        donorName: user?.name || "Generous Supporter",
        donorEmail: user?.email || null,
        showDonor,
        paymentMethod,
        taxPan: taxPan.trim() || null,
      });

      const receiptId = res.data?.data?.receiptId || `HH-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      setDonationReceiptId(receiptId);

      // Dynamically update card progress bar in local state immediately
      setNeeds((prevNeeds) =>
        prevNeeds.map((item) => {
          if (item.id === targetReqId || item._id === targetReqId) {
            const updatedRaised = (item.amountRaised || 0) + donatedAmt;
            const updatedPct = item.amountNeeded > 0
              ? Math.min(100, Math.round((updatedRaised / item.amountNeeded) * 100))
              : 0;
            return {
              ...item,
              amountRaised: updatedRaised,
              percentRaised: updatedPct,
              percentageRaised: updatedPct,
              status: updatedRaised >= item.amountNeeded ? "fulfilled" : item.status,
            };
          }
          return item;
        })
      );

      setSuccess(true);
      fetchUserImpact();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to process donation.";
      setDonateError(msg);
    } finally {
      setIsDonating(false);
    }
  };

  const handleOpenVolunteerModal = (need) => {
    setVolunteerModal(need);
    setVolunteerSkills("");
    setVolunteerSchedule("");
    setVolunteerPhone(user?.phone || "");
    setVolunteerName(user?.name || "");
    setVolunteerError("");
    setVolunteerSuccess(false);
  };

  const handleVolunteerSubmit = async (e) => {
    e.preventDefault();
    setVolunteerError("");

    if (!volunteerSkills.trim()) {
      setVolunteerError("Please specify your skills or expertise.");
      return;
    }
    if (!volunteerSchedule.trim()) {
      setVolunteerError("Please specify your available schedule.");
      return;
    }

    try {
      setIsVolunteering(true);
      const targetOrphanageId =
        volunteerModal.orphanage?._id ||
        volunteerModal.orphanageId ||
        volunteerModal.orphanage?.id ||
        null;

      const payload = {
        orphanageId: targetOrphanageId,
        roleId: volunteerModal.roleId || (volunteerModal.type === 'volunteer' ? (volunteerModal._id || volunteerModal.id) : null),
        requirementId: volunteerModal.type === 'fund' ? (volunteerModal._id || volunteerModal.id) : null,
        roleTitle: volunteerModal.title || "Community Volunteer",
        name: volunteerName.trim() || user?.name || "Volunteer Supporter",
        email: user?.email || "supporter@hopehaven.org",
        phone: volunteerPhone.trim(),
        skills: volunteerSkills.trim(),
        schedule: volunteerSchedule.trim(),
      };

      await api.post("/volunteers/apply", payload);

      // Refresh applications and needs
      fetchMyApplications();
      fetchRequirements();

      // Dynamically increment volunteers applied on this need card locally
      if (volunteerModal._id || volunteerModal.id) {
        setNeeds((prevNeeds) =>
          prevNeeds.map((item) =>
            item._id === volunteerModal._id || item.id === volunteerModal.id
              ? { ...item, volunteersApplied: (item.volunteersApplied || 0) + 1 }
              : item
          )
        );
      }

      setVolunteerSuccess(true);
      setTimeout(() => {
        setVolunteerSuccess(false);
        setVolunteerModal(null);
      }, 3000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to submit volunteer application.";
      setVolunteerError(msg);
    } finally {
      setIsVolunteering(false);
    }
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

            const orphanageName = need.orphanage?.name || "Orphanage Partner";
            const orphanageAddress = need.orphanage?.address || (need.orphanage?.city ? `${need.orphanage.city}, India` : "Location specified on file");
            const orphanageContact = need.orphanage?.contact || "Verified on portal";
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
                        onClick={() => handleOpenVolunteerModal(need)} 
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
    const profileName = user?.name || "Supporter Member";
    const profileEmail = user?.email || "";

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
                  {hideImpact ? "***" : formatInr(userImpact.totalDonated || 0)}
                </p>
                <p className="text-xs font-bold text-leaf-deep mt-1">Donated</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <Users size={24} className="mx-auto text-blue-500 mb-2" />
                <p className="text-2xl font-display font-extrabold text-navy">
                  {hideImpact ? "***" : `${userImpact.hoursVolunteered || 0}h`}
                </p>
                <p className="text-xs font-bold text-blue-700 mt-1">Volunteered</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                <AlertCircle size={24} className="mx-auto text-orange-500 mb-2" />
                <p className="text-2xl font-display font-extrabold text-navy">
                  {hideImpact ? "***" : (userImpact.livesTouched || 0)}
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
                  {userImpact.goldenTrophies || 0}
                </div>
              </div>
              <h4 className="font-display font-bold text-navy mt-4">Golden Trophy</h4>
              <p className="text-xs text-muted mt-1">Awarded for fulfilling Critical emergency needs.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="relative">
                <Award size={64} className="text-gray-300 drop-shadow-md" />
                <div className="absolute -bottom-2 -right-2 bg-navy text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                  {userImpact.silverTrophies || 0}
                </div>
              </div>
              <h4 className="font-display font-bold text-navy mt-4">Silver Trophy</h4>
              <p className="text-xs text-muted mt-1">Awarded for supporting High & Medium priority tasks.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative">
                <Award size={64} className="text-amber-600 drop-shadow-md" />
                <div className="absolute -bottom-2 -right-2 bg-navy text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                  {userImpact.bronzeTrophies || 0}
                </div>
              </div>
              <h4 className="font-display font-bold text-navy mt-4">Bronze Trophy</h4>
              <p className="text-xs text-muted mt-1">Awarded for ongoing standard contributions and support.</p>
            </div>
          </div>
        </div>

        {/* My Volunteer Registrations */}
        <div className="bg-white rounded-2xl border border-line p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-xl font-bold text-navy flex items-center gap-2">
                <Users size={20} className="text-leaf" /> My Volunteer Registrations
              </h3>
              <p className="text-xs text-muted mt-0.5">Live status of your volunteer applications with partner orphanages.</p>
            </div>
            <button
              onClick={fetchMyApplications}
              className="p-2 text-muted hover:text-navy hover:bg-mist rounded-lg transition-colors cursor-pointer"
              title="Refresh applications"
            >
              <RefreshCw size={16} className={loadingApplications ? "animate-spin" : ""} />
            </button>
          </div>

          {loadingApplications ? (
            <div className="py-8 text-center text-muted">
              <Loader2 size={24} className="mx-auto animate-spin mb-2 text-leaf" />
              <p className="text-xs">Loading volunteer applications...</p>
            </div>
          ) : myApplications.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-line rounded-xl bg-haven/30">
              <Users size={32} className="mx-auto text-muted/50 mb-2" />
              <p className="text-sm font-semibold text-navy">No volunteer applications yet</p>
              <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                Explore the community feed to discover volunteer opportunities and apply to help local orphanages.
              </p>
              <button
                onClick={() => setSection("feed")}
                className="mt-4 px-4 py-2 bg-leaf text-white font-semibold text-xs rounded-xl hover:bg-leaf-deep transition-colors cursor-pointer"
              >
                Browse Volunteer Roles
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myApplications.map((app) => {
                const appId = app._id || app.id;
                const status = app.status?.toLowerCase() || "pending";
                const roleTitle = app.roleTitle || app.roleId?.title || "Community Volunteer";
                const orphanageName = app.orphanageId?.name || "Partner Orphanage";
                const orphanageCity = app.orphanageId?.city || "";
                const appDate = app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "";

                return (
                  <div
                    key={appId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-line bg-haven/20 hover:bg-haven/40 transition-colors gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-navy text-sm">
                          {roleTitle}
                        </span>
                        {app.roleId?.urgency && (
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${urgencyColors[app.roleId.urgency] || "bg-gray-100 text-gray-700"}`}>
                            {app.roleId.urgency}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted flex items-center gap-1.5">
                        <MapPin size={12} className="text-muted" /> {orphanageName} {orphanageCity && `• ${orphanageCity}`}
                        {appDate && ` • Applied on ${appDate}`}
                      </p>
                      {app.skills && (
                        <p className="text-xs text-navy/70">
                          <span className="font-semibold text-muted">Skills:</span> {app.skills}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {status === "approved" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                          <CheckCircle2 size={14} className="text-green-600" /> Approved
                        </span>
                      )}
                      {status === "rejected" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                          <X size={14} className="text-red-600" /> Not Selected
                        </span>
                      )}
                      {status !== "approved" && status !== "rejected" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                          <Loader2 size={14} className="text-amber-600 animate-spin" /> Under Review
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
          <button 
            onClick={() => setShowNotifications(true)} 
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left font-display text-sm font-semibold text-navy/75 hover:bg-mist hover:text-navy transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-3">
              <Bell size={18} /> Notifications
            </span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
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
        {/* Top Header Bar for Desktop & Mobile */}
        <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur-md px-4 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 border border-line rounded-lg text-navy cursor-pointer hover:bg-mist" onClick={() => setMobileNav(true)}>
              <Menu size={18} />
            </button>
            <div className="hidden lg:block">
              <h2 className="font-display font-bold text-navy text-lg">
                {section === "feed" ? "Community Support Feed" : "Supporter Profile & Activities"}
              </h2>
            </div>
            <span className="lg:hidden font-display font-bold text-navy">Hope Haven</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell Button */}
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 rounded-xl border border-line bg-white text-navy hover:bg-mist hover:border-navy/30 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => setSection("profile")} 
              className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-mist hover:bg-line border border-line transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center font-bold text-xs uppercase">
                {user?.name ? user.name.slice(0, 2) : "JD"}
              </div>
              <span className="hidden sm:inline text-xs font-bold text-navy max-w-[120px] truncate">{user?.name || "Supporter"}</span>
            </button>
          </div>
        </header>

        <main className="relative flex-1 overflow-hidden px-4 py-6 md:px-8 md:py-8">
          <div className="pointer-events-none absolute inset-0 select-none overflow-hidden" aria-hidden="true">
            <div className="absolute -top-10 -right-10 h-72 w-72 rounded-full bg-emerald-200/25 blur-3xl" />
            <div className="absolute bottom-10 -left-10 h-72 w-72 rounded-full bg-teal-200/20 blur-3xl" />
            <svg className="absolute top-12 right-[5%] h-12 w-12 rotate-12 text-[#2f8f5b] opacity-15" viewBox="0 0 60 60" fill="currentColor"><path d="M10 50 C12 25 32 12 50 10 C48 35 28 48 10 50 Z" /></svg>
            <svg className="absolute bottom-20 left-[4%] h-12 w-12 -rotate-45 text-[#2f8f5b] opacity-15" viewBox="0 0 60 60" fill="currentColor"><path d="M10 50 C12 25 32 12 50 10 C48 35 28 48 10 50 Z" /></svg>
          </div>
          <div className="relative z-10">
          {section === "feed" ? renderFeed() : renderProfile()}
          </div>
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
                onClick={() => { setShowNotifications(true); setMobileNav(false); }} 
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left font-display text-sm font-semibold text-navy/75 hover:bg-mist cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <Bell size={18} /> Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
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
            <button
              onClick={() => {
                setDonateModal(null);
                setSuccess(false);
                setDonateError("");
              }}
              className="absolute top-4 right-4 text-muted hover:text-navy cursor-pointer"
            >
              <X size={20} />
            </button>
            {success ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-leaf-soft text-leaf rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="font-display text-2xl font-bold text-navy">Donation Successful!</h3>
                <p className="text-sm text-muted mt-1.5 leading-relaxed">
                  Thank you for your generous contribution of <strong className="text-leaf-deep">{formatInr(donationAmount)}</strong> to{" "}
                  <span className="font-semibold text-navy">{donateModal.orphanage?.name || "Hope Children's Home"}</span>.
                </p>

                {/* 80G Receipt Identifier Card */}
                <div className="mt-5 p-4 rounded-xl border border-leaf/30 bg-leaf-soft/40 text-left">
                  <div className="flex justify-between items-center text-xs text-muted mb-1.5">
                    <span>Receipt Identifier:</span>
                    <span className="font-mono font-extrabold text-navy text-sm">{donationReceiptId}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted">
                    <span>Tax Exemption:</span>
                    <span className="text-leaf-deep font-semibold">Eligible for 50% 80G Tax Exemption</span>
                  </div>
                </div>

                {donateModal.urgency === "Critical" && (
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-4 font-bold flex items-center justify-center gap-1.5">
                    🏆 You earned progress toward a Golden Trophy for supporting an emergency need!
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setDonateModal(null);
                    setDonationAmount("");
                    setDonationReceiptId(null);
                    setTaxPan("");
                    fetchRequirements();
                  }}
                  className="mt-6 w-full rounded-xl bg-leaf px-5 py-3 font-display font-bold text-white transition-colors hover:bg-leaf-deep cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-display text-xl font-bold text-navy mb-1">Make a Donation</h3>
                <p className="text-sm text-muted mb-5">
                  Supporting: <strong className="text-navy">{donateModal.orphanage?.name || "Hope Children's Home"}</strong>
                </p>

                {donateError && (
                  <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                    <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                    <span>{donateError}</span>
                  </div>
                )}

                <form onSubmit={handleDonateSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1.5">Amount (₹)</label>
                    <div className="grid grid-cols-3 gap-2 mb-2.5">
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
                      className="w-full border border-line bg-mist/30 rounded-xl px-4 py-2.5 text-sm focus:border-leaf outline-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy mb-1.5">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full border border-line bg-mist/30 rounded-xl px-3.5 py-2.5 text-sm focus:border-leaf outline-none"
                    >
                      <option value="UPI / PhonePe">UPI / PhonePe</option>
                      <option value="UPI / GPay">UPI / GPay</option>
                      <option value="Net Banking">Net Banking</option>
                      <option value="Credit Card">Credit Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy mb-1">
                      PAN Number <span className="text-muted font-normal">(Optional for 80G Tax Exemption Receipt)</span>
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={taxPan}
                      onChange={(e) => setTaxPan(e.target.value.toUpperCase())}
                      placeholder="e.g. ABCDE1234F"
                      className="w-full border border-line bg-mist/30 rounded-xl px-3.5 py-2 text-sm uppercase focus:border-leaf outline-none"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                    <input
                      type="checkbox"
                      checked={showDonor}
                      onChange={(e) => setShowDonor(e.target.checked)}
                      className="w-4 h-4 rounded border-line accent-leaf"
                    />
                    <span className="text-xs text-muted">Show my name in public donor recognition feed</span>
                  </label>

                  <button 
                    type="submit" 
                    disabled={isDonating || !donationAmount || Number(donationAmount) <= 0}
                    className="w-full mt-2 flex items-center justify-center gap-2 bg-leaf hover:bg-leaf-deep text-white font-display font-bold py-3 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <CreditCard size={18} />
                    <span>{isDonating ? "Processing..." : `Proceed to Pay ₹${donationAmount || "0"}`}</span>
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
            <button
              onClick={() => {
                setVolunteerModal(null);
                setVolunteerSuccess(false);
                setVolunteerError("");
              }}
              className="absolute top-4 right-4 text-muted hover:text-navy cursor-pointer"
            >
              <X size={20} />
            </button>
            {volunteerSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-leaf-soft text-leaf rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="font-display text-2xl font-bold text-navy">Application Sent!</h3>
                <p className="text-muted mt-2 text-sm">
                  The orphanage has received your application with your skills and schedule.
                </p>
                <div className="mt-4 p-3 rounded-xl bg-mist/60 border border-line text-xs text-navy font-semibold">
                  Thank you for stepping up to make a meaningful difference!
                </div>
              </div>
            ) : (
              <>
                <h3 className="font-display text-xl font-bold text-navy mb-1">Apply to Volunteer</h3>
                <p className="text-sm text-muted mb-4">
                  Role: <strong className="text-navy">{volunteerModal.title}</strong> at {volunteerModal.orphanage?.name || "Hope Children's Home"}
                </p>

                {volunteerError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{volunteerError}</span>
                  </div>
                )}

                <form onSubmit={handleVolunteerSubmit} className="space-y-4">
                  {volunteerModal.description && (
                    <p className="text-xs text-ink/80 bg-mist/40 p-2.5 rounded-lg border border-line">
                      {volunteerModal.description}
                    </p>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-navy mb-1.5">
                      Skills & Experience <span className="text-heart">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={volunteerSkills}
                      onChange={(e) => setVolunteerSkills(e.target.value)}
                      placeholder="e.g. Teaching Math, Art & Crafts, Sports Coaching"
                      className="w-full border border-line bg-mist/30 rounded-xl px-4 py-2.5 text-sm focus:border-leaf outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy mb-1.5">
                      Available Schedule <span className="text-heart">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={volunteerSchedule}
                      onChange={(e) => setVolunteerSchedule(e.target.value)}
                      placeholder="e.g. Weekends only, Saturday afternoons, 4 hrs/week"
                      className="w-full border border-line bg-mist/30 rounded-xl px-4 py-2.5 text-sm focus:border-leaf outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-navy mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={volunteerName}
                        onChange={(e) => setVolunteerName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full border border-line bg-mist/30 rounded-xl px-3 py-2 text-sm focus:border-leaf outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-navy mb-1.5">Contact Number</label>
                      <input
                        type="text"
                        value={volunteerPhone}
                        onChange={(e) => setVolunteerPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full border border-line bg-mist/30 rounded-xl px-3 py-2 text-sm focus:border-leaf outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isVolunteering}
                    className="w-full mt-2 flex items-center justify-center gap-2 bg-navy hover:bg-navy-deep text-white font-display font-bold py-3 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isVolunteering ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <Users size={18} /> Submit Volunteer Application
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Notifications Drawer / Modal */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-rise">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-line">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-leaf-soft text-leaf flex items-center justify-center">
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-navy text-lg leading-tight">Notifications</h3>
                  <p className="text-xs text-muted">
                    {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All notifications caught up"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-semibold text-leaf hover:text-leaf-deep transition-colors px-2.5 py-1 rounded-lg hover:bg-leaf-soft cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1.5 text-muted hover:text-navy hover:bg-mist rounded-lg transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-14 h-14 bg-mist rounded-full flex items-center justify-center mx-auto mb-3 text-muted">
                    <Bell size={26} />
                  </div>
                  <h4 className="font-display font-bold text-navy text-sm">No notifications yet</h4>
                  <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
                    When an orphanage reviews your volunteer applications or responds to your donations, you will receive updates here.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const notifId = notif._id || notif.id;
                  const isRead = notif.read;
                  const isApproved = notif.status === "approved" || notif.title?.toLowerCase().includes("approved");
                  const isRejected = notif.status === "rejected" || notif.title?.toLowerCase().includes("rejected");
                  const notifTime = notif.createdAt
                    ? new Date(notif.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : "";

                  return (
                    <div
                      key={notifId}
                      onClick={() => !isRead && handleMarkAsRead(notifId)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        !isRead
                          ? isApproved
                            ? "bg-green-50/70 border-green-200 shadow-xs"
                            : isRejected
                            ? "bg-red-50/70 border-red-200 shadow-xs"
                            : "bg-leaf-soft/50 border-leaf/30 shadow-xs"
                          : "bg-white border-line/70 hover:bg-haven/30"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 mt-0.5">
                          {isApproved ? (
                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                              <CheckCircle2 size={16} />
                            </div>
                          ) : isRejected ? (
                            <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
                              <X size={16} />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                              <Bell size={16} />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="font-display font-bold text-navy text-sm truncate">
                              {notif.title}
                            </h5>
                            {!isRead && (
                              <span className="w-2 h-2 rounded-full bg-leaf shrink-0" title="Unread" />
                            )}
                          </div>
                          <p className="text-xs text-navy/80 mt-1 leading-relaxed">
                            {notif.message}
                          </p>
                          <div className="flex items-center justify-between mt-2 pt-1">
                            <span className="text-[11px] text-muted">{notifTime}</span>
                            {!isRead && (
                              <span className="text-[11px] font-semibold text-leaf hover:underline">
                                Mark as read
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-line bg-haven/30 flex justify-end">
              <button
                onClick={() => setShowNotifications(false)}
                className="px-4 py-2 bg-navy text-white text-xs font-bold rounded-xl hover:bg-navy-deep transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
