const KEY = "curator-custom-furniture";

export function getCustomFurniture() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}

export function saveCustomFurniture(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addCustomFurniture(item) {
  const items = [...getCustomFurniture(), item];
  saveCustomFurniture(items);
  return items;
}

export function deleteCustomFurniture(id) {
  const items = getCustomFurniture().filter(i => i.id !== id);
  saveCustomFurniture(items);
  return items;
}
