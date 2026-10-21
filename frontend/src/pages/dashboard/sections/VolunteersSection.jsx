import { Plus, Clock, Check, X, UserCheck, Calendar, Phone, Mail } from "lucide-react";
import { StatusBadge } from "../shared";

export default function VolunteersSection({ volunteers = [], volunteerRequests = 0, volunteerRoles = [], setVolunteerStatus, setShowRoleModal }) {
  // Derive real confirmed sessions from approved volunteer applications
  const dynamicUpcoming = volunteers
    .filter((v) => v.status === "approved" || v.status === "accepted")
    .map((v) => ({
      id: v._id || v.id,
      title: `${v.skills || v.skill || "Volunteer Support"} — ${v.name}`,
      when: v.schedule || v.availability || "Weekly schedule",
      people: 1,
    }));

  return (
    <div className="space-y-8 animate-rise">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-navy">Volunteers</h1>
          <p className="mt-1 text-sm text-muted">Review volunteer applications, manage upcoming activities, and define volunteer needs.</p>
        </div>
        <button type="button" onClick={() => setShowRoleModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-leaf px-4 py-2.5 font-display text-sm font-bold text-white shadow-xs transition-colors hover:bg-leaf-deep cursor-pointer"><Plus size={16} /> Post Volunteer Need</button>
      </div>

      {/* Volunteer Applications */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-navy">Volunteer Applications ({volunteers.length})</h2>
          <span className="text-xs font-semibold text-muted">{volunteerRequests} pending review</span>
        </div>

        {volunteers.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white p-8 text-center text-muted">
            <UserCheck size={36} className="mx-auto mb-2 text-muted/60" />
            <p className="font-semibold text-navy">No volunteer applications yet</p>
            <p className="text-xs mt-1">Applications submitted by supporters will appear here for your review.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {volunteers.map((v) => {
              const appId = v._id || v.id;
              const skillText = v.skills || v.skill || "General Support";
              const scheduleText = v.schedule || v.availability;
              const appliedDate = v.date || (v.createdAt ? new Date(v.createdAt).toLocaleDateString() : "Recent");

              return (
                <article key={appId} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <p className="font-display text-lg font-bold text-navy">{v.name}</p>
                      <StatusBadge status={v.status} />
                    </div>
                    <p className="mt-1 text-sm text-ink font-medium">
                      Skills: <span className="text-leaf-deep font-semibold">{skillText}</span>
                    </p>
                    {scheduleText && (
                      <p className="mt-0.5 text-xs text-navy/80 flex items-center gap-1.5 font-medium">
                        <Calendar size={13} className="text-muted shrink-0" />
                        <span>Schedule: <strong>{scheduleText}</strong></span>
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted flex flex-wrap items-center gap-3">
                      <span>Applied: {appliedDate}</span>
                      {v.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone size={12} className="text-muted/80" /> {v.phone}
                        </span>
                      )}
                      {v.email && (
                        <span className="inline-flex items-center gap-1">
                          <Mail size={12} className="text-muted/80" /> {v.email}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {v.status === "pending" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setVolunteerStatus(appId, "approved")}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-leaf px-4 py-2 text-xs font-bold text-white transition-all shadow-xs hover:bg-leaf-deep hover:shadow-md cursor-pointer"
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => setVolunteerStatus(appId, "declined")}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-heart/30 bg-red-50/50 px-4 py-2 text-xs font-bold text-heart transition-all hover:bg-red-100/60 cursor-pointer"
                        >
                          <X size={14} /> Decline
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setVolunteerStatus(appId, "pending")}
                        className="rounded-xl border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:text-navy hover:bg-mist/40 transition-colors cursor-pointer"
                      >
                        Reset status
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Activities & Volunteer Roles */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
          <h2 className="font-display text-lg font-bold text-navy">Upcoming Volunteer Activities</h2>
          {dynamicUpcoming.length === 0 ? (
            <div className="py-8 text-center text-muted">
              <Clock size={32} className="mx-auto mb-2 text-muted/60" />
              <p className="font-semibold text-navy text-sm">No upcoming activities scheduled</p>
              <p className="text-xs text-muted mt-1">Activities will appear here once volunteer applications are approved.</p>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {dynamicUpcoming.map((a) => (
                <li key={a.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-navy">{a.title}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted"><Clock size={12} /> {a.when}</p>
                    </div>
                    <span className="rounded-full bg-leaf-soft px-2.5 py-1 text-xs font-bold text-leaf-deep">{a.people} confirmed</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-navy">Manage Volunteer Roles</h2>
            <button type="button" onClick={() => setShowRoleModal(true)} className="inline-flex items-center gap-1 text-xs font-bold text-leaf hover:text-leaf-deep cursor-pointer"><Plus size={14} /> Add Role</button>
          </div>
          {volunteerRoles.length === 0 ? (
            <div className="py-8 text-center text-muted">
              <p className="font-semibold text-navy text-sm">No volunteer roles defined yet</p>
              <p className="text-xs text-muted mt-1">Click "Add Role" above to specify volunteer needs for your home.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {volunteerRoles.map((role) => (
                <div key={role.id || role._id} className="rounded-xl border border-line bg-mist/30 p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="font-display font-bold text-navy text-sm">{role.roleTitle}</p>
                    <StatusBadge status={role.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted">Schedule: {role.days} · {role.filled || 0} of {role.needed} filled</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
