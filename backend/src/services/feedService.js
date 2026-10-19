/**
 * Feed Service - Hope Haven Urgency & Need Discovery Engine
 * 
 * Implements the Double-Sort Algorithm:
 * 1. Urgency Level Weight: Critical (4) > High (3) > Medium (2) > Low (1)
 * 2. Secondary Weight: Lowest funding completion ratio (amountRaised / amountNeeded)
 */

const URGENCY_WEIGHTS = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

export function prioritizeNeeds(needs) {
  return [...needs].sort((a, b) => {
    const weightA = URGENCY_WEIGHTS[a.urgency] || 0;
    const weightB = URGENCY_WEIGHTS[b.urgency] || 0;

    // Primary: Higher urgency comes first
    if (weightB !== weightA) {
      return weightB - weightA;
    }

    // Secondary: Needs furthest from completion come first
    const ratioA = a.amountNeeded > 0 ? (a.amountRaised || 0) / a.amountNeeded : 1;
    const ratioB = b.amountNeeded > 0 ? (b.amountRaised || 0) / b.amountNeeded : 1;
    return ratioA - ratioB;
  });
}
