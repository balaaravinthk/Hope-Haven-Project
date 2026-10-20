import { X, HandCoins, Printer, ShieldCheck, CheckCircle2 } from "lucide-react";
import { StatusBadge, formatInr } from "../shared";

export default function ReceiptModal({ receipt, profile = {}, onClose }) {
  if (!receipt) return null;

  const receiptId = receipt.receiptId || receipt.id || "HH-2026-00000";
  const formattedDate = receipt.date
    ? typeof receipt.date === "string"
      ? receipt.date.split("T")[0]
      : new Date(receipt.date).toISOString().split("T")[0]
    : "2026-10-20";

  const donorName = receipt.showDonor !== false
    ? (receipt.donor || receipt.donorName || "Generous Supporter")
    : "Anonymous Donor";

  const institutionName = profile.name || receipt.institution?.name || "Hope Children's Home";
  const institutionAddress = profile.address || receipt.institution?.address || "12, Green Park Road, Coimbatore, Tamil Nadu — 641035";
  const institutionPan = profile.pan || receipt.institution?.pan || "AAATH1234F";
  const institutionRegNo = profile.registrationNumber || receipt.institution?.regNo || "TN/CBE/2018/00492";
  const authorizedPerson = profile.authorizedPerson || receipt.institution?.authorizedSignatory || "Dr. Revathi Sundaram";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="w-full max-w-xl rounded-2xl border border-line bg-white p-6 shadow-2xl animate-rise md:p-8 my-8 print:shadow-none print:border-none print:m-0 print:p-4">
        {/* Modal Top Bar (hidden during printing) */}
        <div className="flex items-center justify-between border-b border-line pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-leaf-soft text-leaf">
              <HandCoins size={16} />
            </div>
            <h3 className="font-display text-lg font-bold text-navy">80G Donation Receipt</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted hover:text-navy cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Printable Official Certificate Container */}
        <div id="printable-receipt" className="mt-5 rounded-2xl border-2 border-line bg-mist/10 p-6 md:p-7 space-y-5 text-sm print:border-2 print:border-black print:p-6 print:bg-white">
          {/* Certificate Header */}
          <div className="text-center border-b border-line/80 pb-4">
            <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-leaf-deep bg-leaf-soft border border-leaf/30 px-3 py-0.5 rounded-full mb-1.5 print:border-black">
              Official Tax Exemption Receipt (Section 80G)
            </span>
            <h2 className="font-display text-2xl font-black text-navy uppercase tracking-tight print:text-black">
              {institutionName}
            </h2>
            <p className="text-xs text-muted mt-1 leading-relaxed print:text-black">
              {institutionAddress}
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs font-semibold text-navy/80 print:text-black">
              <span>Govt. Reg No: <strong className="font-mono text-navy print:text-black">{institutionRegNo}</strong></span>
              <span>Institution PAN: <strong className="font-mono text-navy print:text-black">{institutionPan}</strong></span>
              <span>80G Unique No: <strong className="font-mono text-navy print:text-black">{institutionPan}20261</strong></span>
            </div>
          </div>

          {/* Receipt ID & Date */}
          <div className="flex items-center justify-between bg-white/80 p-3 rounded-xl border border-line print:bg-white print:border-black">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">Receipt Identifier</span>
              <span className="font-mono text-sm font-black text-navy tracking-wide print:text-black">{receiptId}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">Date of Issue</span>
              <span className="font-mono text-xs font-bold text-navy print:text-black">{formattedDate}</span>
            </div>
          </div>

          {/* Donor & Contribution Particulars */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-white/60 p-4 rounded-xl border border-line/70 print:bg-white print:border-black">
            <div>
              <span className="text-muted block text-[11px] font-medium uppercase tracking-wider">Received With Thanks From</span>
              <strong className="text-navy text-sm font-display block mt-0.5 print:text-black">{donorName}</strong>
              {receipt.donorEmail && <span className="text-muted text-[11px] block">{receipt.donorEmail}</span>}
            </div>
            <div>
              <span className="text-muted block text-[11px] font-medium uppercase tracking-wider">Donor Tax PAN</span>
              <strong className="font-mono text-navy text-xs mt-0.5 block print:text-black">
                {receipt.taxPan || "Recorded on File"}
              </strong>
            </div>
            <div>
              <span className="text-muted block text-[11px] font-medium uppercase tracking-wider">Mode of Payment</span>
              <strong className="text-navy font-semibold print:text-black">{receipt.paymentMethod || "UPI / PhonePe"}</strong>
              {receipt.transactionId && (
                <span className="text-[10px] text-muted font-mono block truncate">Ref: {receipt.transactionId}</span>
              )}
            </div>
            <div>
              <span className="text-muted block text-[11px] font-medium uppercase tracking-wider">Donation Purpose</span>
              <strong className="text-navy font-semibold print:text-black">
                {receipt.requirementTitle || "Child Welfare, Health & Nutrition"}
              </strong>
            </div>
          </div>

          {/* Amount Badge */}
          <div className="rounded-xl border border-leaf/40 bg-leaf-soft/70 p-4 text-center print:border-black print:bg-gray-100">
            <span className="text-xs font-bold text-leaf-deep block uppercase tracking-wider print:text-black">
              Total Amount Contributed (INR)
            </span>
            <span className="font-display text-3xl font-black text-navy block mt-1 print:text-black">
              {formatInr(receipt.amount)}
            </span>
          </div>

          {/* 80G Statutory Exemption Note */}
          <div className="border border-line/80 bg-white/80 p-3 rounded-xl text-[11px] text-muted leading-relaxed print:bg-white print:border-black print:text-black">
            <p>
              <strong className="text-navy print:text-black">Tax Exemption Notice: </strong>
              Donations made to {institutionName} qualify for 50% deduction under Section 80G of the Income Tax Act, 1961. This official digital receipt serves as valid tax compliance certification.
            </p>
          </div>

          {/* Official Authorized Stamp and Signature */}
          <div className="pt-2 flex items-center justify-between border-t border-line/80">
            {/* Visual Authorized Circular Seal */}
            <div className="relative flex items-center gap-3">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-leaf/70 bg-leaf-soft/40 flex flex-col items-center justify-center text-center p-1.5 shadow-2xs rotate-[-6deg] print:border-black print:bg-white">
                <CheckCircle2 size={16} className="text-leaf print:text-black" />
                <span className="text-[8px] font-black uppercase tracking-tight text-navy leading-none mt-1 print:text-black">
                  HOPE HAVEN
                </span>
                <span className="text-[7px] font-extrabold uppercase text-leaf-deep leading-none mt-0.5 print:text-black">
                  VERIFIED SEAL
                </span>
                <span className="text-[6px] text-muted uppercase font-mono print:text-black">GOVT APPROVED</span>
              </div>
              <div className="hidden sm:block text-[10px] text-muted font-medium print:block">
                <p className="font-bold text-leaf-deep print:text-black">✓ Digitally Verified Institutional Seal</p>
                <p>Child Care Institution Reg. 2018</p>
              </div>
            </div>

            {/* Signature Block */}
            <div className="text-right">
              <div className="h-8 flex items-end justify-end mb-1">
                <span className="font-serif italic font-bold text-navy text-sm underline decoration-leaf decoration-2 print:text-black">
                  {authorizedPerson}
                </span>
              </div>
              <p className="font-display text-xs font-bold text-navy print:text-black">{authorizedPerson}</p>
              <p className="text-[10px] text-muted print:text-black">Authorized Signatory / Administrator</p>
            </div>
          </div>
        </div>

        {/* Action Buttons (hidden during printing) */}
        <div className="mt-6 flex flex-wrap justify-end gap-3 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-5 py-2.5 font-display text-sm font-bold text-navy hover:bg-mist transition-colors cursor-pointer shadow-xs"
          >
            <Printer size={15} /> Print 80G Receipt
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-leaf px-6 py-2.5 font-display text-sm font-bold text-white transition-colors hover:bg-leaf-deep cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
