import { Plus, Pencil, CheckCircle2, Trash2, ClipboardList } from "lucide-react";
import { StatusBadge, formatInr, percent } from "../shared";

const urgencyBadges = {
  Critical: "bg-red-100 text-red-700 border-red-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Medium: "bg-blue-100 text-blue-700 border-blue-200",
  Low: "bg-green-100 text-green-700 border-green-200",
};

export default function RequirementsSection({
  requirements = [],
  reqFilter,
  setReqFilter,
  setEditingReqId,
  setReqForm,
  setShowReqModal,
  startEditRequirement,
  markFulfilled,
  deleteRequirement,
  isApproved = true,
}) {
  const filtered = requirements.filter((item) => {
    if (reqFilter === "active") return item.status === "active";
    if (reqFilter === "fulfilled") return item.status === "fulfilled";
    return true;
  });

  return (
    <div className="space-y-6 animate-rise">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-navy">My Requirements</h1>
          <p className="mt-1 text-sm text-muted">Post urgent needs, food supplies, and materials for donors to support.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!isApproved) {
              alert("Only approved orphanages can post requirements. Your account is pending admin approval.");
              return;
            }
            setEditingReqId(null);
            setReqForm({ title: "", category: "Food & Nutrition", amountNeeded: "" });
            setShowReqModal(true);
          }}
          disabled={!isApproved}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-display text-sm font-bold shadow-xs transition-colors ${
            !isApproved
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-leaf text-white hover:bg-leaf-deep cursor-pointer"
          }`}
          title={!isApproved ? "Pending admin approval" : "Add Requirement"}
        >
          <Plus size={16} /> Add Requirement
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line pb-3">
        {[
          { id: "all", label: `All (${requirements.length})` },
          { id: "active", label: `Active (${requirements.filter((r) => r.status === "active").length})` },
          { id: "fulfilled", label: `Fulfilled (${requirements.filter((r) => r.status === "fulfilled").length})` },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setReqFilter(id)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-display font-bold transition-colors cursor-pointer ${
              reqFilter === id ? "bg-navy text-white" : "bg-white text-muted hover:bg-mist hover:text-navy border border-line"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const itemId = item.id || item._id;
          const pct = percent(item.amountRaised, item.amountNeeded);
          const isFulfilled = item.status === "fulfilled" || item.amountRaised >= item.amountNeeded;

          return (
            <article key={itemId} className="rounded-2xl border border-line bg-white p-6 shadow-xs transition-shadow hover:shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl font-bold text-navy">{item.title}</h2>
                    <span className="rounded-md bg-mist px-2 py-0.5 text-xs font-semibold text-muted">{item.category || "General"}</span>
                    {item.urgency && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${urgencyBadges[item.urgency] || urgencyBadges.Medium}`}>
                        {item.urgency} Priority
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-ink">
                    <strong className="text-navy">{formatInr(item.amountNeeded)}</strong> needed ·{" "}
                    <span className="text-leaf">{formatInr(item.amountRaised)}</span> raised ·{" "}
                    <strong className="text-leaf-deep">{pct}% fulfilled</strong>
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-mist-deep">
                <div className="h-full rounded-full bg-leaf transition-all duration-500" style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line/70 pt-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => startEditRequirement(item)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-navy/30 hover:bg-mist/50 cursor-pointer"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  {!isFulfilled && (
                    <button
                      type="button"
                      onClick={() => markFulfilled(itemId)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-leaf/30 bg-leaf-soft px-3 py-1.5 text-xs font-semibold text-leaf-deep transition-colors hover:bg-leaf/20 cursor-pointer"
                    >
                      <CheckCircle2 size={13} /> Mark fulfilled
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteRequirement(itemId)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-heart/20 px-3 py-1.5 text-xs font-semibold text-heart transition-colors hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
                <span className="text-xs text-muted">ID: #{String(itemId).slice(-6)}</span>
              </div>
            </article>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center text-muted">
            <ClipboardList className="mx-auto h-10 w-10 text-muted/50" />
            <p className="mt-3 font-display text-base font-bold text-navy">No requirements found</p>
            <p className="text-sm">Post a new requirement to connect with donors and supporters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
