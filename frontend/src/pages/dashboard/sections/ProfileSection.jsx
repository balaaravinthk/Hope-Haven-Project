import { Pencil, Building2, FileText, Download, ExternalLink } from "lucide-react";
import { StatusBadge } from "../shared";

export default function ProfileSection({ profile = {}, verificationStatus, setEditProfileForm, setShowProfileModal }) {
  const details = [
    { label: "Organization Type", val: profile.type },
    { label: "Authorized Person", val: profile.authorizedPerson },
    { label: "Contact Phone", val: profile.contact },
    { label: "Email Address", val: profile.email },
    { label: "Registration Number", val: profile.registrationNumber },
    { label: "PAN Number", val: profile.pan },
    { label: "CCI / JJ Act Reg. No.", val: profile.cciJj },
  ];

  const photoSrc = profile.photoPreview
    ? profile.photoPreview.startsWith('/')
      ? `http://localhost:5000${profile.photoPreview}`
      : profile.photoPreview
    : null;

  const docs = Array.isArray(profile.documents) ? profile.documents : [];

  return (
    <div className="space-y-6 animate-rise">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-navy">Organization Profile</h1>
          <p className="mt-1 text-sm text-muted">Official institutional details, state registration records, and verified compliance documents.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditProfileForm({ ...profile });
            setShowProfileModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-leaf px-4 py-2.5 font-display text-sm font-bold text-white shadow-xs transition-colors hover:bg-leaf-deep cursor-pointer"
        >
          <Pencil size={15} /> Edit Profile
        </button>
      </div>

      <div className="rounded-2xl border border-line bg-white p-6 shadow-xs md:p-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-navy">{profile.name || "My Organization"}</h2>
            <p className="mt-1 text-sm text-muted">{profile.type || "Children's Home / CCI"}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted">Verification Status:</span>
            <StatusBadge status={verificationStatus || profile.verificationStatus || "Pending"} />
          </div>
        </div>

        {/* Details Grid */}
        <dl className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {details.map(({ label, val }) => (
            <div key={label} className="rounded-xl border border-line/60 bg-mist/20 p-4">
              <dt className="text-xs font-bold uppercase tracking-wider text-muted">{label}</dt>
              <dd className="mt-1.5 font-semibold text-navy">{val || "Not specified"}</dd>
            </div>
          ))}
          <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-line/60 bg-mist/20 p-4">
            <dt className="text-xs font-bold uppercase tracking-wider text-muted">Full Postal Address</dt>
            <dd className="mt-1.5 font-semibold text-navy">{profile.address || "Not specified"}</dd>
          </div>
        </dl>

        {/* Building Photo */}
        <div className="mt-8 border-t border-line pt-6">
          <h3 className="font-display text-lg font-bold text-navy">Orphanage Building Photo</h3>
          <p className="text-xs text-muted mt-1">Verified facade image submitted during onboarding.</p>
          <div className="mt-4 max-w-md overflow-hidden rounded-2xl border border-line">
            {photoSrc ? (
              <img src={photoSrc} alt="Orphanage Building Front" className="h-48 w-full object-cover" />
            ) : (
              <div className="flex h-44 flex-col items-center justify-center bg-mist/60 text-muted p-4 text-center">
                <Building2 className="h-10 w-10 text-muted/60" />
                <p className="mt-2 text-xs font-bold text-navy">No building photo uploaded yet</p>
                <p className="text-[11px] text-muted">Upload a photo via Edit Profile to showcase your facility.</p>
              </div>
            )}
          </div>
        </div>

        {/* Documents */}
        <div className="mt-8 border-t border-line pt-6">
          <h3 className="font-display text-lg font-bold text-navy">Uploaded Verification Documents</h3>
          <p className="text-xs text-muted mt-1">Official certificates and compliance documents submitted for review.</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {docs.map((doc, idx) => {
              const docName = typeof doc === 'string' ? doc.split('/').pop() : `Document_${idx + 1}.pdf`;
              const docUrl = typeof doc === 'string' && doc.startsWith('/') ? `http://localhost:5000${doc}` : null;
              return (
                <li key={idx} className="flex items-center justify-between rounded-xl border border-line bg-mist/40 px-4 py-3 text-sm">
                  <div className="flex items-center gap-2.5 truncate mr-2">
                    <FileText size={16} className="shrink-0 text-leaf" />
                    <span className="truncate font-medium text-navy">{docName}</span>
                  </div>
                  {docUrl ? (
                    <a
                      href={docUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-leaf hover:text-leaf-deep"
                    >
                      <ExternalLink size={13} /> View
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => alert(`Verified document on file: ${docName}`)}
                      className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-leaf hover:text-leaf-deep cursor-pointer"
                    >
                      <Download size={13} /> View
                    </button>
                  )}
                </li>
              );
            })}
            {docs.length === 0 && (
              <li className="col-span-2 text-xs text-muted italic">No compliance documents uploaded yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
