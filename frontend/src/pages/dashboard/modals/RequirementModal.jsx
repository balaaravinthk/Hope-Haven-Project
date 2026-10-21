import { X, AlertCircle } from "lucide-react";

const PRIORITIES = [
  {
    value: "Critical",
    label: "Critical Priority",
    desc: "Emergency medical, hospitalization, clean water failure",
    badge: "bg-red-100 text-red-700 border-red-200",
  },
  {
    value: "High",
    label: "High Priority",
    desc: "Essential grocery staples, winter blankets, urgently low stock",
    badge: "bg-orange-100 text-orange-700 border-orange-200",
  },
  {
    value: "Medium",
    label: "Medium Priority",
    desc: "School books, uniforms, routine maintenance",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    value: "Low",
    label: "Low Priority",
    desc: "Recreational kits, future term supplies, optional upgrades",
    badge: "bg-green-100 text-green-700 border-green-200",
  },
];

export default function RequirementModal({ show, editingReqId, reqForm, setReqForm, onClose, onSave }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-line bg-white p-6 shadow-2xl animate-rise max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h3 className="font-display text-lg font-bold text-navy">
              {editingReqId ? "Edit Requirement" : "Add New Requirement"}
            </h3>
            <p className="text-xs text-muted mt-0.5">Post an essential need for supporters to fund.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted hover:text-navy cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSave} className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-navy">Requirement Title *</span>
            <input
              required
              value={reqForm.title}
              onChange={(e) => setReqForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Emergency Dengue Medicine, Winter Blankets, Board Exam Books"
              className="w-full rounded-xl border border-line bg-mist/30 px-3.5 py-2.5 text-sm outline-none focus:border-leaf focus:bg-white"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-navy">Category</span>
              <select
                value={reqForm.category || "Food & Nutrition"}
                onChange={(e) => setReqForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full rounded-xl border border-line bg-mist/30 px-3.5 py-2.5 text-sm outline-none focus:border-leaf focus:bg-white cursor-pointer"
              >
                <option value="Food & Nutrition">Food & Nutrition</option>
                <option value="Healthcare">Healthcare & Medicines</option>
                <option value="Education">Education & Books</option>
                <option value="Clothing">Clothing & Bedding</option>
                <option value="Facility & Infrastructure">Facility Maintenance</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-navy">Amount Needed (₹) *</span>
              <input
                required
                type="number"
                min="1"
                value={reqForm.amountNeeded}
                onChange={(e) => setReqForm((p) => ({ ...p, amountNeeded: e.target.value }))}
                placeholder="15000"
                className="w-full rounded-xl border border-line bg-mist/30 px-3.5 py-2.5 text-sm outline-none focus:border-leaf focus:bg-white"
              />
            </label>
          </div>

          {/* Urgency / Priority Selection */}
          <div>
            <span className="mb-1.5 block text-xs font-bold text-navy flex items-center gap-1.5">
              <AlertCircle size={14} className="text-leaf" /> Urgency Priority Level *
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRIORITIES.map((p) => {
                const isSelected = (reqForm.urgency || "Medium") === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setReqForm((prev) => ({ ...prev, urgency: p.value }))}
                    className={`flex flex-col text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-navy bg-navy/5 shadow-xs"
                        : "border-line bg-mist/20 hover:border-navy/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${p.badge}`}>
                        {p.label}
                      </span>
                      {isSelected && <span className="text-xs font-bold text-navy">✓</span>}
                    </div>
                    <span className="text-[11px] text-muted mt-1 leading-snug">{p.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-navy">Brief Description (Optional)</span>
            <textarea
              rows={2}
              value={reqForm.description || ""}
              onChange={(e) => setReqForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Explain why this need is urgent and how it impacts resident children..."
              className="w-full rounded-xl border border-line bg-mist/30 px-3.5 py-2.5 text-sm outline-none focus:border-leaf focus:bg-white resize-none"
            />
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-line px-4 py-2.5 font-display text-sm font-bold text-muted hover:text-navy cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-leaf px-5 py-2.5 font-display text-sm font-bold text-white transition-colors hover:bg-leaf-deep cursor-pointer"
            >
              {editingReqId ? "Save Changes" : "Post Requirement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
