import { Eye, HandHeart, FileCheck } from "lucide-react";
import { StatusBadge, formatInr } from "../shared";

export default function DonationsSection({ donations = [], totalDonations = 0, setActiveReceipt }) {
  const completed = donations.filter((d) => d.status === "Completed");
  const calculatedTotal = totalDonations > 0
    ? totalDonations
    : completed.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const avgGift = formatInr(calculatedTotal / (completed.length || 1));

  return (
    <div className="space-y-6 animate-rise">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-navy">Donations Ledger</h1>
          <p className="mt-1 text-sm text-muted">Track received contributions, donor details, and generate printable 80G tax exemption receipts.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total donations received", value: formatInr(calculatedTotal), sub: "100% directly allocated to your home", subCls: "text-leaf font-semibold" },
          { label: "Completed contributions", value: completed.length, sub: "Verified transactions" },
          { label: "Average gift amount", value: avgGift, sub: "Per donor contribution" },
        ].map(({ label, value, sub, subCls }) => (
          <div key={label} className="rounded-2xl border border-line bg-white p-5 shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">{label}</p>
            <p className="mt-2 font-display text-3xl font-extrabold text-navy">{value}</p>
            <p className={`mt-1 text-xs ${subCls || "text-muted"}`}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Donations Table */}
      <div className="rounded-2xl border border-line bg-white shadow-xs overflow-hidden">
        <div className="border-b border-line px-6 py-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-navy">Official Ledger Records</h2>
          <span className="text-xs text-muted font-medium">80G Compliance Ready</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-mist/60 font-display text-xs font-bold uppercase tracking-wider text-navy">
              <tr>
                <th className="px-6 py-3.5">Donor Name</th>
                <th className="px-6 py-3.5">Receipt ID</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Payment Method</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">80G Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {donations.map((d) => {
                const receiptId = d.receiptId || d.id;
                const donorDisplayName = d.showDonor !== false
                  ? (d.donor || d.donorName || "Generous Supporter")
                  : "Anonymous Donor";

                return (
                  <tr key={receiptId} className="transition-colors hover:bg-mist/30">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-navy">{donorDisplayName}</div>
                      {d.showDonor === false && <span className="text-[11px] text-muted">Donor requested privacy</span>}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-navy">{receiptId}</td>
                    <td className="px-6 py-4 font-display font-extrabold text-navy">{formatInr(d.amount)}</td>
                    <td className="px-6 py-4 text-muted">{typeof d.date === 'string' ? d.date.split('T')[0] : 'Recent'}</td>
                    <td className="px-6 py-4 text-ink font-medium">{d.paymentMethod || "UPI"}</td>
                    <td className="px-6 py-4"><StatusBadge status={d.status || "Completed"} /></td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveReceipt(d)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-leaf/30 bg-leaf-soft px-3 py-1.5 text-xs font-bold text-leaf-deep transition-colors hover:bg-leaf/20 cursor-pointer"
                      >
                        <Eye size={13} /> View 80G Receipt
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {donations.length === 0 && (
            <div className="py-16 text-center text-muted">
              <HandHeart size={36} className="mx-auto text-muted/50 mb-2" />
              <p className="font-display font-bold text-navy text-base">No donations recorded yet</p>
              <p className="text-xs text-muted mt-1">Donations processed through the portal will appear automatically in this ledger.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
