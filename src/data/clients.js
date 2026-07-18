export const STATUS_OPTIONS = ["Lead", "Active", "Converted", "Not interested", "Urgent"];
export const PROPERTY_TYPES = ["HDB", "Condo", "Landed", "Other"];
export const HEARD_ABOUT_OPTIONS = ["Instagram", "Referral", "Google search", "Facebook", "Walk-in", "Other"];

export const STATUS_STYLE = {
  "Lead": { background: "#D6E8F7", color: "#1A3F6E" },
  "Active": { background: "#FFF3CC", color: "#7A5A00" },
  "Converted": { background: "#D6F0E2", color: "#0F5C30" },
  "Not interested": { background: "#EDEDED", color: "#777" },
  "Urgent": { background: "#FFD6D6", color: "#8B1A1A" },
};

const SQM_PER_SQFT = 0.092903;

export function sqftToSqm(sqft) {
  const n = Number(sqft);
  return n ? String(+(n * SQM_PER_SQFT).toFixed(1)) : "";
}

export function sqmToSqft(sqm) {
  const n = Number(sqm);
  return n ? String(+(n / SQM_PER_SQFT).toFixed(1)) : "";
}

export const EMPTY_INTAKE = { rooms: {}, budgetPerRoom: {}, budget: "", vibes: [], floorPlan: "", notes: "" };

export function hasIntakeData(intake) {
  if (!intake) return false;
  return Object.keys(intake.rooms || {}).length > 0 || !!intake.budget || (intake.vibes || []).length > 0 || !!intake.notes || !!intake.floorPlan;
}
