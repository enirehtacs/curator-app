import { useState, useMemo } from "react";
import { furniture, VIBES, CATEGORIES, SOURCE_TYPES } from "../data/furniture";

const TIER_STYLE = {
  Budget:  { background:"#D6F0E2", color:"#0F5C30" },
  Mid:     { background:"#FFF3CC", color:"#7A5A00" },
  Premium: { background:"#FFD6D6", color:"#8B1A1A" },
};
const AVAIL_STYLE = {
  "In stock":    { background:"#D6F0E2", color:"#0F5C30" },
  "Pre-order":   { background:"#FFF3CC", color:"#7A5A00" },
  "Coming soon": { background:"#FFE8CC", color:"#8B4A00" },
  "Discontinued":{ background:"#FFD6D6", color:"#8B1A1A" },
};
const LEAD_STYLE = {
  "In stock":   { background:"#D6F0E2", color:"#0F5C30" },
  "2-3 weeks":  { background:"#FFF3CC", color:"#7A5A00" },
  "8–10 weeks": { background:"#FFD6D6", color:"#8B1A1A" },
};
const CAT_STYLE = {
  "Sofa":          { background:"#FFD6E0", color:"#8B1A2E" },
  "Chair":         { background:"#FFE8CC", color:"#8B4A00" },
  "Ottoman":       { background:"#FFF3CC", color:"#7A5A00" },
  "Table":         { background:"#D6F0E2", color:"#1A5C38" },
  "Storage":       { background:"#D6E8F7", color:"#1A3F6E" },
  "Bed":           { background:"#E8D6F7", color:"#5A1A8B" },
  "Lighting":      { background:"#FFF8CC", color:"#7A6800" },
  "Accent":        { background:"#F7D6F0", color:"#6E1A5A" },
  "Outdoor":       { background:"#D6F7D6", color:"#1A6E1A" },
  "Kitchen/Dining":{ background:"#F7E8D6", color:"#6E4A1A" },
};

function getTier(price) {
  if (price <= 500) return "Budget";
  if (price <= 2000) return "Mid";
  return "Premium";
}
function getLeadStyle(lt) {
  if (!lt) return {};
  const k = Object.keys(LEAD_STYLE).find(k => lt.toLowerCase().includes(k.split(" ")[0].toLowerCase()));
  return k ? LEAD_STYLE[k] : {};
}

function Pill({ label, style }) {
  return (
    <span style={{
      display:"inline-block", fontSize:11, fontWeight:600,
      padding:"2px 8px", borderRadius:20, whiteSpace:"nowrap",
      ...style
    }}>{label}</span>
  );
}

export default function Database() {
  const [search, setSearch]       = useState("");
  const [catFilter, setCat]       = useState("All");
  const [vibeFilter, setVibe]     = useState("All");
  const [srcFilter, setSrc]       = useState("All");
  const [tierFilter, setTier]     = useState("All");
  const [selected, setSelected]   = useState(null);

  const filtered = useMemo(() => {
    return furniture.filter(f => {
      const q = search.toLowerCase();
      const matchSearch = !q || f.name.toLowerCase().includes(q)
        || f.shop.toLowerCase().includes(q)
        || f.vibes.join(" ").toLowerCase().includes(q)
        || f.description.toLowerCase().includes(q);
      const matchCat  = catFilter === "All"  || f.category === catFilter;
      const matchVibe = vibeFilter === "All" || f.vibes.includes(vibeFilter);
      const matchSrc  = srcFilter === "All"  || f.sourceType === srcFilter;
      const matchTier = tierFilter === "All" || getTier(f.price) === tierFilter;
      return matchSearch && matchCat && matchVibe && matchSrc && matchTier;
    });
  }, [search, catFilter, vibeFilter, srcFilter, tierFilter]);

  return (
    <div className="db-wrap">
      {/* Toolbar */}
      <div className="db-toolbar">
        <div className="db-search-wrap">
          <span className="db-search-icon">⌕</span>
          <input
            className="db-search"
            placeholder="Search by name, shop, vibe, description…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="db-filters">
          <select value={catFilter} onChange={e => setCat(e.target.value)}>
            <option value="All">All categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={vibeFilter} onChange={e => setVibe(e.target.value)}>
            <option value="All">All vibes</option>
            {VIBES.map(v => <option key={v}>{v}</option>)}
          </select>
          <select value={srcFilter} onChange={e => setSrc(e.target.value)}>
            <option value="All">All sources</option>
            {SOURCE_TYPES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={tierFilter} onChange={e => setTier(e.target.value)}>
            <option value="All">All price tiers</option>
            {["Budget","Mid","Premium"].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="db-count">{filtered.length} items</div>
      </div>

      {/* Table */}
      <div className="db-table-wrap">
        <table className="db-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Vibes</th>
              <th>Shop</th>
              <th>Source</th>
              <th>Price</th>
              <th>Tier</th>
              <th>Lead Time</th>
              <th>Avail</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.id} className={selected?.id === f.id ? "row-selected" : ""}>
                <td className="td-id">{f.id}</td>
                <td className="td-name">{f.name}</td>
                <td><Pill label={f.category} style={CAT_STYLE[f.category] || {}} /></td>
                <td className="td-vibes">
                  {f.vibes.map(v => (
                    <span key={v} className="vibe-chip">{v}</span>
                  ))}
                </td>
                <td className="td-shop">{f.shop}</td>
                <td>{f.sourceType}</td>
                <td className="td-price">${f.price.toLocaleString()}</td>
                <td><Pill label={getTier(f.price)} style={TIER_STYLE[getTier(f.price)]} /></td>
                <td><Pill label={f.leadTime} style={getLeadStyle(f.leadTime)} /></td>
                <td><Pill label={f.availability} style={AVAIL_STYLE[f.availability] || {}} /></td>
                <td>
                  <button className="row-detail-btn" onClick={() => setSelected(selected?.id === f.id ? null : f)}>
                    {selected?.id === f.id ? "▲" : "▼"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="db-drawer">
          <div className="drawer-header">
            <div>
              <div className="drawer-id">{selected.id}</div>
              <div className="drawer-name">{selected.name}</div>
            </div>
            <button className="drawer-close" onClick={() => setSelected(null)}>✕</button>
          </div>
          <div className="drawer-body">
            <div className="drawer-grid">
              <div className="drawer-field"><span className="df-label">Shop</span><span>{selected.shop}</span></div>
              <div className="drawer-field"><span className="df-label">SKU</span><span className="mono">{selected.sku}</span></div>
              <div className="drawer-field"><span className="df-label">Listed price</span><span className="df-price">${selected.price.toLocaleString()} SGD</span></div>
              <div className="drawer-field"><span className="df-label">Supplier price</span><span className="df-empty">— not set</span></div>
              <div className="drawer-field"><span className="df-label">Materials</span><span>{selected.materials}</span></div>
              <div className="drawer-field"><span className="df-label">Colours</span><span>{selected.colours}</span></div>
              <div className="drawer-field"><span className="df-label">Dimensions</span><span>{selected.dimensions}</span></div>
              <div className="drawer-field"><span className="df-label">Rooms</span><span>{selected.rooms.join(", ")}</span></div>
            </div>
            <div className="drawer-desc">{selected.description}</div>
            <div className="drawer-notes"><span className="df-label">Curator notes: </span>{selected.notes}</div>
            <div className="drawer-quality">{selected.quality}</div>
            <a href={selected.url} target="_blank" rel="noreferrer" className="drawer-link">
              View on {selected.shop} ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
