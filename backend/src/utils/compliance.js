// Indian Gaming & Payments Regulatory Compliance Module

const RESTRICTED_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Nagaland',
  'Odisha',
  'Sikkim',
  'Telangana'
];

function isRestrictedJurisdiction(stateName) {
  if (!stateName) return false;
  return RESTRICTED_STATES.some(s => s.toLowerCase() === stateName.trim().toLowerCase());
}

const COMPLIANCE_TERMS = {
  jurisdictionNotice: "Participation is permitted only for users residing in Indian states where community entertainment / skill board games are legally permissible. Users from Andhra Pradesh, Assam, Nagaland, Odisha, Sikkim, and Telangana are strictly prohibited from entering paid games.",
  ageDisclaimer: "You must be at least 18 years of age to register and participate.",
  financialRiskWarning: "Participation involves financial value in prize draws. Play responsibly and within your means.",
  rngFairnessStatement: "All 2,000 4x4 boards and the live 1-119 number spinner use cryptographically secure non-repeatable RNG algorithms with tamper-proof MongoDB audit trails.",
  paymentPolicy: "All UPI payments are manually reviewed against Banking UTR reference numbers by authorized administrators to prevent fraud and money laundering."
};

module.exports = {
  RESTRICTED_STATES,
  isRestrictedJurisdiction,
  COMPLIANCE_TERMS
};

