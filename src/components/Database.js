import { useState, useMemo } from "react";
import { furniture, VIBES, CATEGORIES, SOURCE_TYPES, COLOUR_OPTIONS } from "../data/furniture";
import { ROOM_TYPES } from "../data/projects";
import { COLOUR_HEX } from "../data/colours";
import { getCustomFurniture, addCustomFurniture, deleteCustomFurniture } from "../data/customFurniture";
import { parseDimensionsMm } from "../data/dimensions";

const TIER_STYLE = { Budget:{background:"#D6F0E2",color:"#0F5C30"}, Mid:{background:"#FFF3CC",color:"#7A5A00"}, Premium:{background:"#FFD6D6",color:"#8B1A1A"} };
const AVAIL_STYLE = { "In stock":{background:"#D6F0E2",color:"#0F5C30"}, "Pre-order":{background:"#FFF3CC",color:"#7A5A00"}, "Coming soon":{background:"#FFE8CC",color:"#8B4A00"}, "Discontinued":{background:"#FFD6D6",color:"#8B1A1A"} };
const CAT_STYLE = { "Sofa":{background:"#FFD6E0",color:"#8B1A2E"}, "Chair":{background:"#FFE8CC",color:"#8B4A00"}, "Ottoman":{background:"#FFF3CC",color:"#7A5A00"}, "Table":{background:"#D6F0E2",color:"#1A5C38"}, "Storage":{background:"#D6E8F7",color:"#1A3F6E"}, "Bed":{background:"#E8D6F7",color:"#5A1A8B"}, "Lighting":{background:"#FFF8CC",color:"#7A6800"}, "Accent":{background:"#F7D6F0",color:"#6E1A5A"}, "Outdoor":{background:"#D6F7D6",color:"#1A6E1A"}, "Kitchen/Dining":{background:"#F7E8D6",color:"#6E4A1A"} };
const ID_PREFIX = { Sofa:"SF", Chair:"CH", Ottoman:"OT", Table:"TB", Storage:"ST", Bed:"BD", Lighting:"LT", Accent:"AC", Outdoor:"OD", "Kitchen/Dining":"KT" };

// Common materials, curated from what real SG furniture shops list
const MATERIALS_OPTIONS = [
  "Fabric","Leather","Faux Leather","Velvet","Linen","Cotton","Bouclé",
  "Wood","Engineered Wood","Solid Wood","Rattan","Wicker",
  "Metal","Brass","Marble","Glass","Ceramic","Stoneware","Concrete","Stone",
  "Polyester","Polyethylene","Polycarbonate","ABS Plastic","Foam","Corduroy","Giclée Print",
];

// Subtypes per category, modelled on how HipVan/Castlery/Space Furniture structure their nav
const SUBTYPES_BY_CATEGORY = {
  Sofa: ["1-Seater","2-Seater","3-Seater","4-Seater","L-Shape","Sectional","Sofa Bed","Modular","Loveseat","Recliner"],
  Chair: ["Dining","Accent","Armchair","Office","Recliner","Rocking","Stool","Bench"],
  Ottoman: ["Bean Bag","Pouffe","Footstool","Storage Ottoman"],
  Table: ["Coffee","Side","Console","Dining","Bar Table","Desk","Nesting","Extendable"],
  Storage: ["Shelf","TV Console","Cabinet","Wardrobe","Bookcase","Sideboard","Drawer Chest","Shoe Cabinet"],
  Bed: ["Bed Frame","Storage Bed","Sofa Bed","Bunk Bed","Daybed","Headboard"],
  Lighting: ["Table Lamp","Floor Lamp","Pendant","Ceiling Light","Wall Light","Desk Lamp","String Lights"],
  Accent: ["Vase","Cushion","Rug","Tray","Clock","Art Print","Mirror","Throw Blanket","Candle Holder","Plant Pot","Sculpture / Decor"],
  Outdoor: ["Lounger","Outdoor Sofa","Outdoor Chair","Outdoor Table","Umbrella","Planter"],
  "Kitchen/Dining": ["Bar Stool","Dining Set","Kitchen Cart","Tableware","Cutlery","Kitchen Storage"],
};

function buildDimensionsString(l, w, h) {
  const parts = [];
  if (l) parts.push(`L${l}`);
  if (w) parts.push(`W${w}`);
  if (h) parts.push(`H${h}`);
  return parts.length ? parts.join(" ") + "mm" : "";
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
  name:"", category:CATEGORIES[0], subtype:"", rooms:[], vibes:[], shop:"", sourceType:SOURCE_TYPES[0],
  url:"", sku:"", price:"", colourTags:[], description:"", materials:[], colours:"",
  dimL:"", dimW:"", dimH:"",
  quality:"", leadTime:"In stock", availability:"In stock", notes:"", photo:"",
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

// Dropdown backed by a curated option list, with a "+ Add new…" escape hatch that swaps in a free-text input
function DropdownWithCustom({ options, value, onChange, addLabel, placeholder }) {
  const [customMode, setCustomMode] = useState(value !== "" && !options.includes(value));
  if (customMode) {
    return (
      <div style={{display:"flex",gap:6}}>
        <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} autoFocus />
        <button type="button" className="btn-ghost" style={{padding:"6px 10px",whiteSpace:"nowrap"}} onClick={()=>{setCustomMode(false);onChange("");}}>Use list</button>
      </div>
    );
  }
  return (
    <select value={options.includes(value)?value:""} onChange={e=>{
      if (e.target.value === "__custom__") { setCustomMode(true); onChange(""); }
      else onChange(e.target.value);
    }}>
      <option value="" disabled>Select…</option>
      {options.map(o=><option key={o}>{o}</option>)}
      <option value="__custom__">{addLabel || "+ Add new…"}</option>
    </select>
  );
}

function AddItemModal({ onClose, onSave, shopOptions }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  const setVal = (field) => (value) => setForm(f => ({ ...f, [field]: value }));
  const toggleIn = (field) => (value) => setForm(f => ({
    ...f, [field]: f[field].includes(value) ? f[field].filter(v=>v!==value) : [...f[field], value]
  }));

  function submit() {
    if (!form.name.trim() || !form.shop.trim() || !form.price) {
      alert("Name, shop and price are required");
      return;
    }
    const prefix = ID_PREFIX[form.category] || "XX";
    const id = `${prefix}-CUSTOM-${Date.now().toString(36).toUpperCase()}`;
    const { dimL, dimW, dimH, ...rest } = form;
    const item = {
      ...rest,
      id,
      price: Number(form.price) || 0,
      materials: form.materials.join(", "),
      dimensions: buildDimensionsString(dimL, dimW, dimH),
      rating: 0,
      custom: true,
    };
    onSave(item);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:640}}>
        <div className="modal-header">
          <div className="modal-title">Add a new item</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-field">
            <label>Name</label>
            <input value={form.name} onChange={set("name")} placeholder="e.g. Dawson 3-Seater Sofa" />
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div className="form-field">
              <label>Category</label>
              <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value,subtype:""}))}>
                {CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Subtype</label>
              <DropdownWithCustom key={form.category} options={SUBTYPES_BY_CATEGORY[form.category]||[]} value={form.subtype} onChange={setVal("subtype")} addLabel="+ Add new subtype…" placeholder="e.g. 3-Seater" />
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
          <div className="form-field">
            <label>Colour tags</label>
            <MultiPick options={COLOUR_OPTIONS} selected={form.colourTags} onToggle={toggleIn("colourTags")} />
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div className="form-field">
              <label>Shop</label>
              <DropdownWithCustom options={shopOptions} value={form.shop} onChange={setVal("shop")} addLabel="+ Add new shop…" placeholder="e.g. HipVan" />
            </div>
            <div className="form-field">
              <label>Source type</label>
              <select value={form.sourceType} onChange={set("sourceType")}>
                {SOURCE_TYPES.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-field">
            <label>Product URL</label>
            <input value={form.url} onChange={set("url")} placeholder="https://... (link to the individual product page)" />
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div className="form-field">
              <label>SKU</label>
              <input value={form.sku} onChange={set("sku")} />
            </div>
            <div className="form-field">
              <label>Price (SGD)</label>
              <input type="number" value={form.price} onChange={set("price")} placeholder="0" />
            </div>
          </div>
          <div className="form-field">
            <label>Description</label>
            <textarea rows={2} value={form.description} onChange={set("description")} />
          </div>
          <div className="form-field">
            <label>Materials</label>
            <MultiPick options={MATERIALS_OPTIONS} selected={form.materials} onToggle={toggleIn("materials")} />
          </div>
          <div className="form-field">
            <label>Colours</label>
            <input value={form.colours} onChange={set("colours")} placeholder="e.g. Warm grey, Oatmeal" />
          </div>
          <div className="form-field">
            <label>Dimensions (mm)</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              <input type="number" min="0" value={form.dimL} onChange={set("dimL")} placeholder="L" />
              <input type="number" min="0" value={form.dimW} onChange={set("dimW")} placeholder="W" />
              <input type="number" min="0" value={form.dimH} onChange={set("dimH")} placeholder="H" />
            </div>
          </div>
          <div className="form-field">
            <label>Quality notes</label>
            <input value={form.quality} onChange={set("quality")} placeholder="e.g. Top seller ★★★★★" />
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div className="form-field">
              <label>Lead time</label>
              <input value={form.leadTime} onChange={set("leadTime")} />
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
            <textarea rows={2} value={form.notes} onChange={set("notes")} />
          </div>
          <div className="form-field">
            <label>Photo URL</label>
            <input value={form.photo} onChange={set("photo")} placeholder="https://..." />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit}>Add item</button>
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
  const [customItems, setCustomItems] = useState(() => getCustomFurniture());

  const allFurniture = useMemo(() => [...furniture, ...customItems], [customItems]);
  const shopOptions = useMemo(() => [...new Set(allFurniture.map(f=>f.shop))].sort(), [allFurniture]);

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

  function handleSave(item) {
    const updated = addCustomFurniture(item);
    setCustomItems(updated);
    setShowAddModal(false);
  }

  function handleDelete(id) {
    if (!window.confirm("Remove this item from your database?")) return;
    const updated = deleteCustomFurniture(id);
    setCustomItems(updated);
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

      {showAddModal && <AddItemModal onClose={()=>setShowAddModal(false)} onSave={handleSave} shopOptions={shopOptions} />}

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
                  <td className="td-name">{f.name}{f.custom && <span className="custom-badge">Your addition</span>}</td>
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
                            <div className="drawer-field"><span className="df-label">Supplier price</span><span className="df-empty">— not set</span></div>
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
                          </div>
                          <div className="drawer-desc">{f.description}</div>
                          <div className="drawer-notes"><span className="df-label">Curator notes: </span>{f.notes}</div>
                          <div className="drawer-actions">
                            {f.url && <a href={f.url} target="_blank" rel="noreferrer" className="drawer-link">View on {f.shop} ↗</a>}
                            {f.custom && <button className="drawer-delete-btn" onClick={()=>handleDelete(f.id)}>Remove from database</button>}
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
