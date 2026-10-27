import { X, AlertCircle } from "lucide-react";

const PRIORITIES = [
  { value: "Critical", label: "Critical", badge: "bg-red-100 text-red-700 border-red-200" },
  { value: "High", label: "High", badge: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "Medium", label: "Medium", badge: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { value: "Low", label: "Low", badge: "bg-green-100 text-green-700 border-green-200" },
];

export default function VolunteerRoleModal({ show, roleForm, setRoleForm, onClose, onSave }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-line bg-white p-6 shadow-2xl animate-rise max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h3 className="font-display text-lg font-bold text-navy">Post Volunteer Need</h3>
            <p className="text-xs text-muted mt-0.5">This role will be published to the community on the Supporter feed.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted hover:text-navy cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSave} className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-navy">Role Title *</span>
            <input
              required
              value={roleForm.roleTitle}
              onChange={(e) => setRoleForm((p) => ({ ...p, roleTitle: e.target.value }))}
              placeholder="e.g. Weekend Math Tutor, Sports Mentor, Art & Craft Lead"
              className="w-full rounded-xl border border-line bg-mist/30 px-3.5 py-2.5 text-sm outline-none focus:border-leaf focus:bg-white"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-navy">Category</span>
              <select
                value={roleForm.category || "Education"}
                onChange={(e) => setRoleForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full rounded-xl border border-line bg-mist/30 px-3.5 py-2.5 text-sm outline-none focus:border-leaf focus:bg-white cursor-pointer"
              >
                <option value="Education">Education & Tutoring</option>
                <option value="Healthcare">Healthcare & Wellness</option>
                <option value="Sports & Fitness">Sports & Mentorship</option>
                <option value="Food & Nutrition">Food & Kitchen Help</option>
                <option value="Facility & Infrastructure">Repairs & Gardening</option>
                <option value="Other">General Support</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-navy">Volunteers Needed *</span>
              <input
                required
                type="number"
                min="1"
                value={roleForm.needed}
                onChange={(e) => setRoleForm((p) => ({ ...p, needed: e.target.value }))}
                className="w-full rounded-xl border border-line bg-mist/30 px-3.5 py-2.5 text-sm outline-none focus:border-leaf focus:bg-white"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-navy">Expected Days & Schedule *</span>
            <input
              required
              value={roleForm.days}
              onChange={(e) => setRoleForm((p) => ({ ...p, days: e.target.value }))}
              placeholder="e.g. Saturdays & Sundays (10 AM - 12 PM)"
              className="w-full rounded-xl border border-line bg-mist/30 px-3.5 py-2.5 text-sm outline-none focus:border-leaf focus:bg-white"
            />
          </label>

          {/* Urgency / Priority Selection */}
          <div>
            <span className="mb-1.5 block text-xs font-bold text-navy flex items-center gap-1.5">
              <AlertCircle size={14} className="text-leaf" /> Urgency Level
            </span>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITIES.map((p) => {
                const isSelected = (roleForm.urgency || "Medium") === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setRoleForm((prev) => ({ ...prev, urgency: p.value }))}
                    className={`py-2 px-2 text-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "border-navy bg-navy text-white shadow-xs"
                        : "border-line bg-mist/30 text-navy hover:bg-mist"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-navy">Role Responsibilities / Details</span>
            <textarea
              rows={2}
              value={roleForm.description || ""}
              onChange={(e) => setRoleForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Describe tasks, skills required, or age group of students..."
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
              Post Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
