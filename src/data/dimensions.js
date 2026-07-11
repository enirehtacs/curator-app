// SG bed sizes (mm) — fallback for dimensions written as words rather than numbers, e.g. "Queen / King"
const BED_SIZE_MM = [
  ["super single", [1070, 1900]],
  ["single", [900, 1900]],
  ["queen", [1520, 1900]],
  ["king", [1820, 2000]],
];

// Parse a free-text dimensions string (e.g. "W224 D97 H72cm", "45×45cm", "L1500 W400 H900mm")
// into an array of measurements in millimetres.
export function parseDimensionsMm(str) {
  if (!str) return [];
  const nums = (str.match(/\d+(\.\d+)?/g) || []).map(Number).filter(n => n > 0);
  if (!nums.length) {
    const lower = str.toLowerCase();
    for (const [key, mm] of BED_SIZE_MM) {
      if (lower.includes(key)) return mm;
    }
    return [];
  }
  // Values are already mm if the string is explicitly tagged "mm" (new Add Item form);
  // legacy catalog entries are written in cm (e.g. "W224 D97 H72cm").
  const isMm = /mm/i.test(str);
  return nums.map(n => Math.round(isMm ? n : n * 10));
}

// A rough single "apparent size" figure (mm) used to compare how visually large different
// pieces should look next to each other on a moodboard — not a real floor-plan footprint,
// just enough to make "sofa clearly bigger than a table lamp" hold up across the catalog.
export function estimateApparentSize(item) {
  const mm = parseDimensionsMm(item.dimensions);
  if (mm.length >= 2) {
    const [a, b] = [...mm].sort((x, y) => y - x);
    return Math.sqrt(a * b);
  }
  if (mm.length === 1) return mm[0] * 0.6; // a lone measurement is usually height, not width
  return 350; // unknown — assume a modest accent-sized piece
}
