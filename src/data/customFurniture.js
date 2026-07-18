import { furniture } from "./furniture";

const ADDITIONS_KEY = "curator-furniture-additions";
const OVERRIDES_KEY = "curator-furniture-overrides";

export function getAdditions() {
  try { return JSON.parse(localStorage.getItem(ADDITIONS_KEY)) || []; }
  catch { return []; }
}
function saveAdditions(items) { localStorage.setItem(ADDITIONS_KEY, JSON.stringify(items)); }

export function getOverrides() {
  try { return JSON.parse(localStorage.getItem(OVERRIDES_KEY)) || {}; }
  catch { return {}; }
}
function saveOverrides(map) { localStorage.setItem(OVERRIDES_KEY, JSON.stringify(map)); }

export function isAddition(id) {
  return getAdditions().some(i => i.id === id);
}

export function addFurnitureItem(item) {
  saveAdditions([item, ...getAdditions()]);
}

// Updates an item in place — a user-added item is edited directly; a hardcoded catalogue
// item gets its edits stored as an override (keyed by id) that's merged on top at read time.
export function saveFurnitureItem(item) {
  if (isAddition(item.id)) {
    saveAdditions(getAdditions().map(i => i.id === item.id ? item : i));
  } else {
    saveOverrides({ ...getOverrides(), [item.id]: item });
  }
}

// Only user-added items can be deleted outright — hardcoded items live in source code.
export function deleteFurnitureItem(id) {
  saveAdditions(getAdditions().filter(i => i.id !== id));
}

// Full catalogue for display: user additions first, then hardcoded items with any saved
// edits applied on top.
export function getCustomFurniture() {
  const overrides = getOverrides();
  const additions = getAdditions().map(i => ({ ...i, _isAddition: true }));
  const hardcoded = furniture.map(item => ({
    ...(overrides[item.id] ? { ...item, ...overrides[item.id] } : item),
    _isAddition: false,
  }));
  return [...additions, ...hardcoded];
}
