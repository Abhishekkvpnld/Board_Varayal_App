import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

export default function LegalComplianceBanner() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-dark-850 border-b border-dark-700/60 text-xs text-slate-300">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">
            <strong className="text-white font-medium">Fair Play & Indian Gaming Compliance:</strong> 18+ Only. Validated RNG backend with tamper-proof MongoDB audit trails.
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-brand-400 hover:text-brand-300 flex items-center gap-1 shrink-0 font-medium transition"
        >
          {expanded ? 'Less Info' : 'Legal Terms'}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="max-w-7xl mx-auto px-4 pb-3 pt-1 text-slate-400 border-t border-dark-800 text-[11px] leading-relaxed space-y-1.5 animate-fadeIn">
          <div className="flex items-start gap-2 text-amber-300/90 bg-amber-950/20 p-2 rounded border border-amber-900/30">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p>
              <strong>Restricted Jurisdictions:</strong> Residents of Andhra Pradesh, Assam, Nagaland, Odisha, Sikkim, and Telangana are legally prohibited from participating in prize-based gameplay under local state gaming legislation.
            </p>
          </div>
          <p>
            • <strong>Age & Skill Disclaimer:</strong> Participation is strictly limited to individuals 18 years or older. Board Varayal is a skill & community pattern verification game. Play responsibly.
          </p>
          <p>
            • <strong>Secure Payment Verification:</strong> All UPI deposits are authenticated against bank UTR references by verified admins prior to credit to maintain anti-fraud and PMLA standards.
          </p>
        </div>
      )}
    </div>
  );
}

