import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Building2,
  FileText,
  ExternalLink,
  LogOut,
  RefreshCw,
  AlertCircle,
  Eye,
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Image as ImageIcon,
} from "lucide-react";
import logoBest from "../assets/logoisthebest.png";
import api from "../services/api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [orphanages, setOrphanages] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'Pending', 'Approved', 'Rejected'
  const [selectedOrphanage, setSelectedOrphanage] = useState(null);
  const [actionInProgress, setActionInProgress] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  // Read current admin user from localStorage
  const currentAdmin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const showToast = (message, type = "success") => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchData = async () => {
    try {
      const [listRes, statsRes] = await Promise.all([
        api.get("/admin/orphanages"),
        api.get("/admin/stats"),
      ]);

      setOrphanages(listRes.data?.data || []);
      setStats(statsRes.data?.data || { total: 0, pending: 0, approved: 0, rejected: 0 });
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/admin/login");
      } else {
        showToast("Failed to fetch registered orphanages", "error");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setActionInProgress((prev) => ({ ...prev, [id]: newStatus }));
    try {
      const res = await api.patch(`/admin/orphanages/${id}/status`, { status: newStatus });
      const updated = res.data?.data;

      // Update in local list
      setOrphanages((prev) =>
        prev.map((item) => (item._id === id || item.id === id ? updated : item))
      );

      // Refresh stats
      const statsRes = await api.get("/admin/stats");
      setStats(statsRes.data?.data || stats);

      if (selectedOrphanage && (selectedOrphanage._id === id || selectedOrphanage.id === id)) {
        setSelectedOrphanage(updated);
      }

      const label = newStatus === "Approved" ? "approved" : "rejected / cancelled";
      showToast(`Orphanage ${updated?.name || ""} has been ${label}.`, "success");
    } catch (err) {
      showToast(err.response?.data?.message || `Failed to update status to ${newStatus}`, "error");
    } finally {
      setActionInProgress((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  // Filtered orphanages
  const filteredOrphanages = useMemo(() => {
    return orphanages.filter((o) => {
      // Tab filter
      if (activeTab !== "all" && o.verificationStatus !== activeTab) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = o.name?.toLowerCase().includes(q);
        const matchesEmail = o.email?.toLowerCase().includes(q);
        const matchesReg = o.registrationNumber?.toLowerCase().includes(q);
        const matchesCity = o.city?.toLowerCase().includes(q);
        const matchesPerson = o.authorizedPerson?.toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesReg || matchesCity || matchesPerson;
      }
      return true;
    });
  }, [orphanages, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-mist/40 text-ink pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 rounded-xl border border-line bg-white px-5 py-3.5 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          {toastMessage.type === "error" ? (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-leaf-deep shrink-0" />
          )}
          <span className="text-sm font-semibold text-navy">{toastMessage.message}</span>
        </div>
      )}

      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-line/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 md:px-8">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <img src={logoBest} alt="" className="h-9 w-9 object-contain" />
              <span className="font-display text-xl font-extrabold tracking-tight">
                <span className="text-navy">Hope</span>
                <span className="text-leaf">Haven</span>
              </span>
            </Link>
            <span className="hidden sm:inline-block rounded-md bg-navy px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 rounded-lg bg-navy/5 px-3 py-1.5 text-xs font-semibold text-navy">
              <Shield className="h-3.5 w-3.5 text-leaf-deep" />
              <span>Logged in as: <strong className="text-leaf-deep">{currentAdmin?.email || "Admin"}</strong></span>
            </div>

            <Link
              to="/"
              className="text-xs font-bold text-muted hover:text-navy transition-colors hidden sm:inline"
            >
              Public Site
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 hover:border-rose-200 cursor-pointer"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 pt-8 md:px-8">
        {/* Page Title & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-extrabold text-navy">
              Registered Orphanage Verifications
            </h1>
            <p className="mt-1 text-sm text-muted">
              Review and verify registered orphanages. When approved, institutions can log in. When rejected, access is blocked and shown as cancelled.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-navy shadow-xs transition-all hover:border-leaf hover:text-leaf disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin text-leaf" : ""} />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Stats Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div
            onClick={() => setActiveTab("all")}
            className={`rounded-2xl border p-5 transition-all cursor-pointer ${
              activeTab === "all"
                ? "border-navy bg-white shadow-md shadow-navy/5 scale-[1.02]"
                : "border-line bg-white/70 hover:bg-white hover:border-navy/40"
            }`}
          >
            <div className="flex items-center justify-between text-muted text-xs font-bold uppercase tracking-wider">
              <span>Total Registrations</span>
              <Building2 className="h-4 w-4 text-navy/60" />
            </div>
            <div className="mt-2 font-display text-3xl font-black text-navy">{stats.total}</div>
          </div>

          <div
            onClick={() => setActiveTab("Pending")}
            className={`rounded-2xl border p-5 transition-all cursor-pointer ${
              activeTab === "Pending"
                ? "border-amber-400 bg-amber-50/50 shadow-md shadow-amber-500/10 scale-[1.02]"
                : "border-line bg-white/70 hover:bg-white hover:border-amber-300"
            }`}
          >
            <div className="flex items-center justify-between text-amber-700 text-xs font-bold uppercase tracking-wider">
              <span>Pending Review</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-2 font-display text-3xl font-black text-amber-700">{stats.pending}</div>
          </div>

          <div
            onClick={() => setActiveTab("Approved")}
            className={`rounded-2xl border p-5 transition-all cursor-pointer ${
              activeTab === "Approved"
                ? "border-leaf-deep bg-leaf/5 shadow-md shadow-leaf/10 scale-[1.02]"
                : "border-line bg-white/70 hover:bg-white hover:border-leaf/40"
            }`}
          >
            <div className="flex items-center justify-between text-leaf-deep text-xs font-bold uppercase tracking-wider">
              <span>Approved</span>
              <CheckCircle2 className="h-4 w-4 text-leaf-deep" />
            </div>
            <div className="mt-2 font-display text-3xl font-black text-leaf-deep">{stats.approved}</div>
          </div>

          <div
            onClick={() => setActiveTab("Rejected")}
            className={`rounded-2xl border p-5 transition-all cursor-pointer ${
              activeTab === "Rejected"
                ? "border-rose-400 bg-rose-50/60 shadow-md shadow-rose-500/10 scale-[1.02]"
                : "border-line bg-white/70 hover:bg-white hover:border-rose-300"
            }`}
          >
            <div className="flex items-center justify-between text-rose-700 text-xs font-bold uppercase tracking-wider">
              <span>Rejected / Cancelled</span>
              <XCircle className="h-4 w-4 text-rose-600" />
            </div>
            <div className="mt-2 font-display text-3xl font-black text-rose-700">{stats.rejected}</div>
          </div>
        </div>

        {/* Filter Tabs & Search Controls */}
        <div className="rounded-2xl border border-line bg-white p-4 mb-6 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {[
              { id: "all", label: "All Registrations", count: stats.total },
              { id: "Pending", label: "Pending", count: stats.pending },
              { id: "Approved", label: "Approved", count: stats.approved },
              { id: "Rejected", label: "Rejected / Cancelled", count: stats.rejected },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-navy text-white shadow-sm"
                    : "bg-mist/50 text-navy/70 hover:bg-mist hover:text-navy"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    activeTab === tab.id ? "bg-white/25 text-white" : "bg-navy/10 text-navy"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, reg no..."
              className="w-full rounded-xl border border-line bg-mist/30 pl-10 pr-4 py-2 text-xs font-medium text-ink outline-none transition-all placeholder:text-muted/60 focus:border-navy focus:bg-white"
            />
          </div>
        </div>

        {/* Orphanage List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-leaf" />
            <p className="mt-4 font-display text-sm font-semibold text-muted">
              Loading registered orphanages...
            </p>
          </div>
        ) : filteredOrphanages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white/70 p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted/40" />
            <h3 className="mt-3 font-display text-lg font-bold text-navy">No orphanages found</h3>
            <p className="mt-1 text-sm text-muted">
              {searchQuery
                ? `No registrations matched "${searchQuery}".`
                : `There are currently no orphanages in the "${activeTab}" filter category.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredOrphanages.map((orphanage) => {
              const oid = orphanage._id || orphanage.id;
              const isApproved = orphanage.verificationStatus === "Approved";
              const isRejected = orphanage.verificationStatus === "Rejected";
              const isPending = orphanage.verificationStatus === "Pending";
              const isUpdating = !!actionInProgress[oid];

              return (
                <div
                  key={oid}
                  className="rounded-2xl border border-line bg-white p-5 shadow-xs transition-all hover:border-navy/30 hover:shadow-md"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Info */}
                    <div className="flex items-start gap-4">
                      {orphanage.photoPreview ? (
                        <img
                          src={orphanage.photoPreview}
                          alt={orphanage.name}
                          className="h-16 w-16 rounded-xl object-cover border border-line shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-navy border border-navy/10">
                          <Building2 size={28} />
                        </div>
                      )}

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-lg font-bold text-navy">
                            {orphanage.name}
                          </h3>
                          <span className="rounded-md bg-mist px-2 py-0.5 text-xs font-semibold text-navy/70">
                            {orphanage.type}
                          </span>

                          {/* Status Badge */}
                          {isApproved && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                              <CheckCircle2 size={12} />
                              Approved
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                              <Clock size={12} />
                              Pending Approval
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-xs font-bold text-rose-700">
                              <XCircle size={12} />
                              Rejected / Cancelled
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <Mail size={13} className="text-navy/50" />
                            <strong>Official Email:</strong> {orphanage.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone size={13} className="text-navy/50" />
                            <strong>Contact:</strong> {orphanage.contact}
                          </span>
                          {orphanage.city && (
                            <span className="flex items-center gap-1">
                              <MapPin size={13} className="text-navy/50" />
                              {orphanage.city}, {orphanage.state || ""}
                            </span>
                          )}
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                          <span>
                            <strong>Reg No:</strong> {orphanage.registrationNumber}
                          </span>
                          <span>
                            <strong>PAN:</strong> {orphanage.pan}
                          </span>
                          <span>
                            <strong>Authorized:</strong> {orphanage.authorizedPerson}
                          </span>
                          {orphanage.aadhaarNumberMasked && (
                            <span>
                              <strong>Aadhaar:</strong> {orphanage.aadhaarNumberMasked}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-line/60">
                      <button
                        type="button"
                        onClick={() => setSelectedOrphanage(orphanage)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-mist/40 px-3.5 py-2 text-xs font-bold text-navy transition-all hover:bg-mist cursor-pointer"
                      >
                        <Eye size={14} />
                        View Full Details
                      </button>

                      {/* Approve Button */}
                      <button
                        type="button"
                        disabled={isApproved || isUpdating}
                        onClick={() => handleUpdateStatus(oid, "Approved")}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer ${
                          isApproved
                            ? "bg-emerald-100 text-emerald-800 opacity-60 cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 hover:shadow-emerald-600/20"
                        }`}
                      >
                        <Check size={14} />
                        <span>{isApproved ? "Approved" : "Approve"}</span>
                      </button>

                      {/* Reject / Cancel Button */}
                      <button
                        type="button"
                        disabled={isRejected || isUpdating}
                        onClick={() => handleUpdateStatus(oid, "Rejected")}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer ${
                          isRejected
                            ? "bg-rose-100 text-rose-800 opacity-60 cursor-not-allowed"
                            : "bg-rose-600 hover:bg-rose-700 text-white active:scale-95 hover:shadow-rose-600/20"
                        }`}
                      >
                        <X size={14} />
                        <span>{isRejected ? "Rejected / Cancelled" : "Reject / Cancel"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedOrphanage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-white p-6 md:p-8 shadow-2xl">
            <button
              onClick={() => setSelectedOrphanage(null)}
              className="absolute top-5 right-5 rounded-lg p-1.5 text-muted hover:bg-mist hover:text-navy transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl bg-navy/10 p-3 text-navy">
                <Building2 size={24} />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-navy">
                  {selectedOrphanage.name}
                </h2>
                <p className="text-xs text-muted">{selectedOrphanage.type}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
              <div className="rounded-xl bg-mist/40 p-4 border border-line/60">
                <span className="text-xs font-bold uppercase tracking-wider text-muted block mb-1">
                  Official Contact
                </span>
                <p className="font-semibold text-navy">{selectedOrphanage.email}</p>
                <p className="text-navy/80 mt-1">{selectedOrphanage.contact}</p>
                <p className="text-muted text-xs mt-2">{selectedOrphanage.address}</p>
                <p className="text-muted text-xs">
                  {selectedOrphanage.city} {selectedOrphanage.state} {selectedOrphanage.pincode}
                </p>
              </div>

              <div className="rounded-xl bg-mist/40 p-4 border border-line/60">
                <span className="text-xs font-bold uppercase tracking-wider text-muted block mb-1">
                  Legal & Registration Details
                </span>
                <p className="text-xs text-navy">
                  <strong>Reg No:</strong> {selectedOrphanage.registrationNumber}
                </p>
                <p className="text-xs text-navy mt-1">
                  <strong>PAN:</strong> {selectedOrphanage.pan}
                </p>
                <p className="text-xs text-navy mt-1">
                  <strong>JJ / CCI Act ID:</strong> {selectedOrphanage.cciJj || "N/A"}
                </p>
                <p className="text-xs text-navy mt-1">
                  <strong>Authorized Person:</strong> {selectedOrphanage.authorizedPerson}
                </p>
                <p className="text-xs text-navy mt-1">
                  <strong>Masked Aadhaar:</strong> {selectedOrphanage.aadhaarNumberMasked}
                </p>
              </div>
            </div>

            {/* Building Photo & Uploaded Documents */}
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">
                Verification Documents & Building Photo
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedOrphanage.photoPreview && (
                  <div className="rounded-xl border border-line p-3 bg-mist/20">
                    <span className="text-xs font-semibold text-navy block mb-1.5 flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-leaf-deep" />
                      Building Front Photo
                    </span>
                    <a
                      href={selectedOrphanage.photoPreview}
                      target="_blank"
                      rel="noreferrer"
                      className="block overflow-hidden rounded-lg border border-line/80 hover:opacity-90"
                    >
                      <img
                        src={selectedOrphanage.photoPreview}
                        alt="Building Preview"
                        className="h-32 w-full object-cover"
                      />
                    </a>
                  </div>
                )}

                {selectedOrphanage.documents && selectedOrphanage.documents.length > 0 && (
                  <div className="rounded-xl border border-line p-3 bg-mist/20">
                    <span className="text-xs font-semibold text-navy block mb-1.5 flex items-center gap-1.5">
                      <FileText size={14} className="text-navy" />
                      Uploaded Documents ({selectedOrphanage.documents.length})
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {selectedOrphanage.documents.map((doc, idx) => (
                        <a
                          key={idx}
                          href={doc}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between rounded-lg border border-line bg-white px-3 py-2 text-xs font-medium text-navy hover:text-leaf hover:border-leaf transition-colors"
                        >
                          <span className="truncate">Document {idx + 1}</span>
                          <ExternalLink size={12} className="shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-line">
              <div className="text-xs">
                Current Status:{" "}
                <strong
                  className={
                    selectedOrphanage.verificationStatus === "Approved"
                      ? "text-emerald-700"
                      : selectedOrphanage.verificationStatus === "Rejected"
                      ? "text-rose-700"
                      : "text-amber-700"
                  }
                >
                  {selectedOrphanage.verificationStatus}
                </strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateStatus(selectedOrphanage._id || selectedOrphanage.id, "Rejected");
                  }}
                  className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  Reject / Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateStatus(selectedOrphanage._id || selectedOrphanage.id, "Approved");
                  }}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  Approve Registration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
