import { useState, useMemo } from "react";
import { furniture, VIBES, CATEGORIES, SOURCE_TYPES, COLOUR_OPTIONS } from "../data/furniture";
import { ROOM_TYPES } from "../data/projects";
import { COLOUR_HEX } from "../data/colours";
import { getCustomFurniture, addFurnitureItem, saveFurnitureItem, deleteFurnitureItem } from "../data/customFurniture";
import { parseDimensionsMm } from "../data/dimensions";

const TIER_STYLE = { Budget:{background:"#D6F0E2",color:"#0F5C30"}, Mid:{background:"#FFF3CC",color:"#7A5A00"}, Premium:{background:"#FFD6D6",color:"#8B1A1A"} };
const AVAIL_STYLE = { "In stock":{background:"#D6F0E2",color:"#0F5C30"}, "Pre-order":{background:"#FFF3CC",color:"#7A5A00"}, "Coming soon":{background:"#FFE8CC",color:"#8B4A00"}, "Discontinued":{background:"#FFD6D6",color:"#8B1A1A"} };
const CAT_STYLE = { "Sofa":{background:"#FFD6E0",color:"#8B1A2E"}, "Chair":{background:"#FFE8CC",color:"#8B4A00"}, "Ottoman":{background:"#FFF3CC",color:"#7A5A00"}, "Table":{background:"#D6F0E2",color:"#1A5C38"}, "Storage":{background:"#D6E8F7",color:"#1A3F6E"}, "Bed":{background:"#E8D6F7",color:"#5A1A8B"}, "Lighting":{background:"#FFF8CC",color:"#7A6800"}, "Accent":{background:"#F7D6F0",color:"#6E1A5A"}, "Outdoor":{background:"#D6F7D6",color:"#1A6E1A"}, "Kitchen/Dining":{background:"#F7E8D6",color:"#6E4A1A"} };
const ID_GUIDE = "SF=Sofa, CH=Chair, OT=Ottoman, TB=Table, ST=Storage, BD=Bed, LT=Lighting, AC=Accent, OD=Outdoor, KT=Kitchen";
const LEAD_TIME_OPTIONS = ["In stock", "2–3 weeks", "3–4 weeks", "8–10 weeks", "Made to order"];

const AUTOFILL_SYSTEM_PROMPT = "You are a furniture product data extractor. Given a product URL, extract product information and return ONLY a valid JSON object with these exact fields: name, price (number in SGD, convert if needed), description (one sentence max), materials, colours, dimensions, shop (store name), sku (product code if visible). If a field is not found return null. Return nothing except the JSON.";
const API_KEY_STORAGE = "curator-anthropic-api-key";

function getStoredApiKey() {
  return localStorage.getItem(API_KEY_STORAGE) || "";
}

function promptForApiKey() {
  const key = window.prompt(
    "Paste your Anthropic API key to enable Autofill.\n\nThis is stored only in your browser (localStorage) — it's never sent anywhere but Anthropic's API, and never committed to this app's code."
  );
  if (key && key.trim()) {
    localStorage.setItem(API_KEY_STORAGE, key.trim());
    return key.trim();
  }
  return "";
}

async function callAutofill(url) {
  const apiKey = getStoredApiKey() || promptForApiKey();
  if (!apiKey) return { ok: false };
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: AUTOFILL_SYSTEM_PROMPT,
        messages: [{ role: "user", content: `Extract product data from this URL: ${url}` }],
      }),
    });
    if (!res.ok) return { ok: false };
    const data = await res.json();
    const text = data?.content?.[0]?.text ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { ok: false };
    return { ok: true, data: JSON.parse(match[0]) };
  } catch {
    return { ok: false };
  }
}

function getTier(p){ return p<=500?"Budget":p<=2000?"Mid":"Premium"; }

function Pill({ label, style }) {
  return <span style={{display:"inline-block",fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,whiteSpace:"nowrap",...style}}>{label}</span>;
}

function ColourDot({ colour, size=14 }) {
  const bg = COLOUR_HEX[colour] || "#CCC";
  const isGradient = bg.startsWith("linear");
  return (
    <span title={colour} style={{
      display:"inline-block", width:size, height:size, borderRadius:"50%",
      background:bg, border:"1px solid rgba(0,0,0,0.12)", flexShrink:0,
      backgroundImage: isGradient ? bg : undefined,
    }}/>
  );
}

const EMPTY_FORM = {
  url: "", id: "", name: "", category: CATEGORIES[0], subtype: "",
  rooms: [], vibes: [], shop: "", sourceType: SOURCE_TYPES[0], sku: "",
  price: "", supplierPrice: "", colourTags: [], description: "", materials: "",
  colours: "", dimensions: "", quality: "", rating: 0,
  leadTime: "In stock", availability: "In stock", notes: "", photo: "",
};

function MultiPick({ options, selected, onToggle }) {
  return (
    <div className="vibe-picker">
      {options.map(o => (
        <button key={o} type="button" className={`vibe-pick-btn ${selected.includes(o)?"selected":""}`} onClick={()=>onToggle(o)}>{o}</button>
      ))}
    </div>
  );
}

function ColourPick({ options, selected, onToggle }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {options.map(c => {
        const isSelected = selected.includes(c);
        return (
          <button key={c} type="button" onClick={() => onToggle(c)} style={{
            display: "flex", alignItems: "center", gap: 6, border: `1px solid ${isSelected ? "#2C2B28" : "#D8D0C4"}`,
            background: isSelected ? "#2C2B28" : "#fff", color: isSelected ? "#fff" : "#2C2B28",
            borderRadius: 20, padding: "4px 10px 4px 6px", cursor: "pointer", fontSize: 12,
          }}>
            <ColourDot colour={c} size={14} />{c}
          </button>
        );
      })}
    </div>
  );
}

function StarPicker({ value, onChange }) {
  return (
    <div className="star-picker">
      {[1, 2, 3, 4, 5].map(n => (
        <button type="button" key={n} className={n <= value ? "filled" : ""} onClick={() => onChange(n === value ? 0 : n)}>★</button>
      ))}
    </div>
  );
}

function AutofillButton({ url, onResult }) {
  const [loading, setLoading] = useState(false);
  const enabled = url.trim().length > 5 && !loading;

  async function run() {
    if (!enabled) return;
    setLoading(true);
    const result = await callAutofill(url.trim());
    setLoading(false);
    onResult(result);
  }

  return (
    <button type="button" className={`autofill-btn ${enabled ? "enabled" : ""}`} onClick={run} disabled={!enabled}>
      {loading ? <span className="autofill-spinner" /> : "✨"} Autofill
    </button>
  );
}

function PhotoPreview({ src }) {
  const [ok, setOk] = useState(false);
  if (!src) return null;
  return (
    <img key={src} src={src} alt="Preview" onLoad={() => setOk(true)} onError={() => setOk(false)}
      style={{ display: ok ? "block" : "none", width: 110, height: 82, objectFit: "cover", borderRadius: 7, border: "1px solid #E0DAD0", marginTop: 6 }} />
  );
}

function ItemFormModal({ item, onClose, onSave, onToast }) {
  const isEdit = !!item;
  const [form, setForm] = useState(item ? { ...EMPTY_FORM, ...item } : EMPTY_FORM);
  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  const setVal = (field) => (value) => setForm(f => ({ ...f, [field]: value }));
  const toggleIn = (field) => (value) => setForm(f => ({
    ...f, [field]: f[field].includes(value) ? f[field].filter(v=>v!==value) : [...f[field], value]
  }));

  function handleAutofillResult(result) {
    if (!result.ok) {
      onToast({ type: "warn", message: "Could not autofill — please fill in manually" });
      return;
    }
    const d = result.data;
    setForm(f => ({
      ...f,
      name: d.name ?? f.name,
      price: d.price != null ? String(d.price) : f.price,
      description: d.description ?? f.description,
      materials: d.materials ?? f.materials,
      colours: d.colours ?? f.colours,
      dimensions: d.dimensions ?? f.dimensions,
      shop: d.shop ?? f.shop,
      sku: d.sku ?? f.sku,
    }));
    onToast({ type: "success", message: "Fields filled — please review before saving" });
  }

  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, photo: reader.result }));
    reader.readAsDataURL(file);
  }

  function submit() {
    if (!form.id.trim() || !form.name.trim() || !form.shop.trim() || !form.price) {
      alert("Item ID, name, shop and price are required");
      return;
    }
    if (!isEdit && getCustomFurniture().some(i => i.id === form.id.trim())) {
      alert("An item with this ID already exists — please use a unique ID");
      return;
    }
    const item = {
      ...form,
      id: form.id.trim(),
      price: Number(form.price) || 0,
      supplierPrice: form.supplierPrice ? Number(form.supplierPrice) : null,
      rating: Number(form.rating) || 0,
    };
    onSave(item, isEdit);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:640}}>
        <div className="modal-header">
          <div className="modal-title">{isEdit ? "Edit item" : "Add a new item"}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-field">
            <label>Product URL</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ flex: 1 }} value={form.url} onChange={set("url")} placeholder="https://... (link to the individual product page)" />
              <AutofillButton url={form.url} onResult={handleAutofillResult} />
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div className="form-field">
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                Item ID
                <span className="id-guide-icon" title={ID_GUIDE}>ⓘ</span>
              </label>
              <input value={form.id} onChange={set("id")} placeholder="e.g. SF-3S-002" disabled={isEdit} />
            </div>
            <div className="form-field">
              <label>Item name</label>
              <input value={form.name} onChange={set("name")} placeholder="e.g. Dawson 3-Seater Sofa" />
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div className="form-field">
              <label>Category</label>
              <select value={form.category} onChange={set("category")}>
                {CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Sub-type</label>
              <input value={form.subtype} onChange={set("subtype")} placeholder="e.g. 3-Seater, Floor Lamp, Coffee Table" />
            </div>
          </div>

          <div className="form-field">
            <label>Room types</label>
            <MultiPick options={ROOM_TYPES} selected={form.rooms} onToggle={toggleIn("rooms")} />
          </div>
          <div className="form-field">
            <label>Vibes</label>
            <MultiPick options={VIBES} selected={form.vibes} onToggle={toggleIn("vibes")} />
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div className="form-field">
              <label>Shop / Supplier name</label>
              <input value={form.shop} onChange={set("shop")} placeholder="e.g. HipVan" />
            </div>
            <div className="form-field">
              <label>Source type</label>
              <select value={form.sourceType} onChange={set("sourceType")}>
                {SOURCE_TYPES.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div className="form-field">
              <label>SKU / Product code</label>
              <input value={form.sku} onChange={set("sku")} />
            </div>
            <div className="form-field">
              <label>Listed price (SGD)</label>
              <input type="number" value={form.price} onChange={set("price")} placeholder="0" />
            </div>
          </div>

          <div className="form-field">
            <label>Supplier price (SGD) — your negotiated rate</label>
            <input type="number" value={form.supplierPrice} onChange={set("supplierPrice")} placeholder="Optional" />
          </div>

          <div className="form-field">
            <label>Colour tags</label>
            <ColourPick options={COLOUR_OPTIONS} selected={form.colourTags} onToggle={toggleIn("colourTags")} />
          </div>

          <div className="form-field">
            <label>Description</label>
            <textarea rows={2} value={form.description} onChange={set("description")} placeholder="1–2 sentences" />
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div className="form-field">
              <label>Materials</label>
              <input value={form.materials} onChange={set("materials")} placeholder="e.g. Fabric, Wood" />
            </div>
            <div className="form-field">
              <label>Colours (description)</label>
              <input value={form.colours} onChange={set("colours")} placeholder="e.g. Warm grey, Oatmeal" />
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div className="form-field">
              <label>Dimensions</label>
              <input value={form.dimensions} onChange={set("dimensions")} placeholder="e.g. W220 D90 H78cm" />
            </div>
            <div className="form-field">
              <label>Quality notes</label>
              <input value={form.quality} onChange={set("quality")} placeholder="e.g. 4.8★ 2,300 reviews" />
            </div>
          </div>

          <div className="form-field">
            <label>Your rating</label>
            <StarPicker value={form.rating} onChange={setVal("rating")} />
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div className="form-field">
              <label>Lead time</label>
              <select value={form.leadTime} onChange={set("leadTime")}>
                {LEAD_TIME_OPTIONS.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Availability</label>
              <select value={form.availability} onChange={set("availability")}>
                {Object.keys(AVAIL_STYLE).map(a=><option key={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div className="form-field">
            <label>Curator notes</label>
            <textarea rows={2} value={form.notes} onChange={set("notes")} placeholder="Personal notes, pairs well with, HDB fit etc." />
          </div>

          <div className="form-field">
            <label>Photo URL</label>
            <input value={form.photo.startsWith("data:") ? "" : form.photo} onChange={set("photo")}
              placeholder={form.photo.startsWith("data:") ? "Using uploaded photo — clear to enter a URL instead" : "https://..."} />
            <PhotoPreview src={form.photo} />
          </div>
          <div className="form-field">
            <label>Or upload a photo (JPG/PNG)</label>
            <input type="file" accept="image/jpeg,image/png" onChange={handlePhotoUpload} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit}>{isEdit ? "Save changes" : "Add item"}</button>
        </div>
      </div>
    </div>
  );
}

export default function Database() {
  const [search, setSearch] = useState("");
  const [catFilter, setCat] = useState("All");
  const [vibeFilter, setVibe] = useState("All");
  const [srcFilter, setSrc] = useState("All");
  const [tierFilter, setTier] = useState("All");
  const [colourFilter, setColour] = useState("All");
  const [minSizeMm, setMinSizeMm] = useState("");
  const [selected, setSelected] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [allFurniture, setAllFurniture] = useState(() => getCustomFurniture());
  const [toast, setToast] = useState(null);

  function showToast(t) {
    setToast(t);
    setTimeout(() => setToast(null), 3500);
  }

  const filtered = useMemo(() => allFurniture.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = !q || f.name.toLowerCase().includes(q) || f.shop.toLowerCase().includes(q) || f.vibes.join(" ").toLowerCase().includes(q) || (f.description||"").toLowerCase().includes(q);
    const matchCat = catFilter==="All" || f.category===catFilter;
    const matchVibe = vibeFilter==="All" || f.vibes.includes(vibeFilter);
    const matchSrc = srcFilter==="All" || f.sourceType===srcFilter;
    const matchTier = tierFilter==="All" || getTier(f.price)===tierFilter;
    const matchColour = colourFilter==="All" || (f.colourTags||[]).includes(colourFilter);
    const matchSize = !minSizeMm || parseDimensionsMm(f.dimensions).some(mm => mm >= Number(minSizeMm));
    return matchSearch && matchCat && matchVibe && matchSrc && matchTier && matchColour && matchSize;
  }), [allFurniture, search, catFilter, vibeFilter, srcFilter, tierFilter, colourFilter, minSizeMm]);

  function handleSave(item, isEdit) {
    if (isEdit) saveFurnitureItem(item);
    else addFurnitureItem(item);
    setAllFurniture(getCustomFurniture());
    setShowAddModal(false);
    setEditingItem(null);
  }

  function handleDelete(id) {
    if (!window.confirm("Remove this item from your database?")) return;
    deleteFurnitureItem(id);
    setAllFurniture(getCustomFurniture());
    setSelected(null);
  }

  return (
    <div className="db-wrap">
      <div className="db-toolbar">
        <div className="db-search-wrap">
          <span className="db-search-icon">⌕</span>
          <input className="db-search" placeholder="Search by name, shop, vibe…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div className="db-filters">
          <select value={catFilter} onChange={e=>setCat(e.target.value)}>
            <option value="All">All categories</option>
            {CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </select>
          <select value={vibeFilter} onChange={e=>setVibe(e.target.value)}>
            <option value="All">All vibes</option>
            {VIBES.map(v=><option key={v}>{v}</option>)}
          </select>
          <select value={colourFilter} onChange={e=>setColour(e.target.value)}>
            <option value="All">All colours</option>
            {COLOUR_OPTIONS.map(c=><option key={c}>{c}</option>)}
          </select>
          <select value={srcFilter} onChange={e=>setSrc(e.target.value)}>
            <option value="All">All sources</option>
            {SOURCE_TYPES.map(s=><option key={s}>{s}</option>)}
          </select>
          <select value={tierFilter} onChange={e=>setTier(e.target.value)}>
            <option value="All">All price tiers</option>
            {["Budget","Mid","Premium"].map(t=><option key={t}>{t}</option>)}
          </select>
          <div className="db-size-filter" title="Show items with at least one side ≥ this length">
            <input type="number" min="0" placeholder="Min size" value={minSizeMm} onChange={e=>setMinSizeMm(e.target.value)} />
            <span>mm, ≥1 side</span>
          </div>
        </div>
        <button className="btn-primary" onClick={()=>setShowAddModal(true)}>+ Add item</button>
        <div className="db-count">{filtered.length} items</div>
      </div>

      {(showAddModal || editingItem) && (
        <ItemFormModal
          item={editingItem}
          onClose={()=>{setShowAddModal(false);setEditingItem(null);}}
          onSave={handleSave}
          onToast={showToast}
        />
      )}

      {toast && <div className={`app-toast ${toast.type === "success" ? "success" : "warn"}`}>{toast.message}</div>}

      <div className="db-table-wrap">
        <table className="db-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Colours</th>
              <th>Vibes</th>
              <th>Shop</th>
              <th>Price</th>
              <th>Tier</th>
              <th>Lead Time</th>
              <th>Avail</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <>
                <tr key={f.id} className={selected?.id===f.id?"row-selected":""}>
                  <td className="td-id">{f.id}</td>
                  <td className="td-name">{f.name}{f._isAddition && <span className="custom-badge">Your addition</span>}</td>
                  <td><Pill label={f.category} style={CAT_STYLE[f.category]||{}} /></td>
                  <td>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
                      {(f.colourTags||[]).map(c=><ColourDot key={c} colour={c} />)}
                    </div>
                  </td>
                  <td className="td-vibes">{f.vibes.map(v=><span key={v} className="vibe-chip">{v}</span>)}</td>
                  <td className="td-shop">{f.shop}</td>
                  <td className="td-price">${f.price.toLocaleString()}</td>
                  <td><Pill label={getTier(f.price)} style={TIER_STYLE[getTier(f.price)]} /></td>
                  <td><Pill label={f.leadTime} style={f.leadTime==="In stock"?{background:"#D6F0E2",color:"#0F5C30"}:{background:"#FFF3CC",color:"#7A5A00"}} /></td>
                  <td><Pill label={f.availability} style={AVAIL_STYLE[f.availability]||{}} /></td>
                  <td>
                    <button className="row-detail-btn" onClick={()=>{setSelected(selected?.id===f.id?null:f);setImgError(false);}}>
                      {selected?.id===f.id?"▲":"▼"}
                    </button>
                  </td>
                </tr>
                {selected?.id===f.id && (
                  <tr key={f.id+"-drawer"} className="drawer-row">
                    <td colSpan={11} style={{padding:0}}>
                      <div className="inline-drawer">
                        <div className="inline-drawer-photo">
                          {f.photo && !imgError ? (
                            <img src={f.photo} alt={f.name} onError={()=>setImgError(true)} />
                          ) : (
                            <div className="drawer-photo-fallback" style={{background:`hsl(${Math.abs((f.id.charCodeAt(0)||0)*47)%360},15%,88%)`}}>
                              <span>{f.category}</span>
                            </div>
                          )}
                        </div>
                        <div className="inline-drawer-body">
                          <div className="drawer-grid">
                            <div className="drawer-field"><span className="df-label">Shop</span><span>{f.shop}</span></div>
                            <div className="drawer-field"><span className="df-label">SKU</span><span className="mono">{f.sku}</span></div>
                            <div className="drawer-field"><span className="df-label">Listed price</span><span className="df-price">${f.price.toLocaleString()} SGD</span></div>
                            <div className="drawer-field"><span className="df-label">Supplier price</span>{f.supplierPrice ? <span className="df-price">${Number(f.supplierPrice).toLocaleString()} SGD</span> : <span className="df-empty">— not set</span>}</div>
                            <div className="drawer-field"><span className="df-label">Materials</span><span>{f.materials}</span></div>
                            <div className="drawer-field"><span className="df-label">Dimensions</span><span>{f.dimensions}</span></div>
                            <div className="drawer-field"><span className="df-label">Colours</span>
                              <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
                                {(f.colourTags||[]).map(c=>(
                                  <span key={c} style={{display:"flex",alignItems:"center",gap:4,fontSize:11}}>
                                    <ColourDot colour={c} size={12}/>{c}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="drawer-field"><span className="df-label">Rooms</span><span>{(f.rooms||[]).join(", ")}</span></div>
                            <div className="drawer-field"><span className="df-label">Quality</span><span>{f.quality}</span></div>
                            <div className="drawer-field"><span className="df-label">Your rating</span><span>{f.rating ? "★".repeat(f.rating) + "☆".repeat(5-f.rating) : "— not set"}</span></div>
                          </div>
                          <div className="drawer-desc">{f.description}</div>
                          <div className="drawer-notes"><span className="df-label">Curator notes: </span>{f.notes}</div>
                          <div className="drawer-actions">
                            {f.url && <a href={f.url} target="_blank" rel="noreferrer" className="drawer-link">View on {f.shop} ↗</a>}
                            <button className="btn-ghost" style={{padding:"4px 12px",fontSize:12}} onClick={()=>setEditingItem(f)}>Edit</button>
                            {f._isAddition && <button className="drawer-delete-btn" onClick={()=>handleDelete(f.id)}>Delete</button>}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
