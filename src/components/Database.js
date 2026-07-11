import { useState, useMemo } from "react";
import { furniture, VIBES, CATEGORIES, SOURCE_TYPES, COLOUR_OPTIONS } from "../data/furniture";

const TIER_STYLE = { Budget:{background:"#D6F0E2",color:"#0F5C30"}, Mid:{background:"#FFF3CC",color:"#7A5A00"}, Premium:{background:"#FFD6D6",color:"#8B1A1A"} };
const AVAIL_STYLE = { "In stock":{background:"#D6F0E2",color:"#0F5C30"}, "Pre-order":{background:"#FFF3CC",color:"#7A5A00"}, "Coming soon":{background:"#FFE8CC",color:"#8B4A00"}, "Discontinued":{background:"#FFD6D6",color:"#8B1A1A"} };
const CAT_STYLE = { "Sofa":{background:"#FFD6E0",color:"#8B1A2E"}, "Chair":{background:"#FFE8CC",color:"#8B4A00"}, "Ottoman":{background:"#FFF3CC",color:"#7A5A00"}, "Table":{background:"#D6F0E2",color:"#1A5C38"}, "Storage":{background:"#D6E8F7",color:"#1A3F6E"}, "Bed":{background:"#E8D6F7",color:"#5A1A8B"}, "Lighting":{background:"#FFF8CC",color:"#7A6800"}, "Accent":{background:"#F7D6F0",color:"#6E1A5A"}, "Outdoor":{background:"#D6F7D6",color:"#1A6E1A"}, "Kitchen/Dining":{background:"#F7E8D6",color:"#6E4A1A"} };

// Map colour names to approximate hex for display swatches
const COLOUR_HEX = {
  White:"#FFFFFF", Black:"#2C2B28", Grey:"#9E9E9E", Beige:"#E8D8C0", Cream:"#F5EDD8",
  Brown:"#7A5C3E", Tan:"#C9A870", Walnut:"#7A5230", Natural:"#D4C4A0", Brass:"#C8A050",
  Gold:"#D4A830", Silver:"#C0C0C0", Terracotta:"#C07050", Orange:"#E87830", Red:"#C83030",
  Pink:"#E8A0A0", Green:"#5A9060", Sage:"#8B9E7A", Olive:"#6B7A40", Blue:"#4060A0",
  Navy:"#203060", Teal:"#307870", Purple:"#7050A0", Yellow:"#E8C830", Multicolour:"linear-gradient(135deg,#E53535,#3575E5,#35C870)"
};

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

export default function Database() {
  const [search, setSearch] = useState("");
  const [catFilter, setCat] = useState("All");
  const [vibeFilter, setVibe] = useState("All");
  const [srcFilter, setSrc] = useState("All");
  const [tierFilter, setTier] = useState("All");
  const [colourFilter, setColour] = useState("All");
  const [selected, setSelected] = useState(null);
  const [imgError, setImgError] = useState(false);

  const filtered = useMemo(() => furniture.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = !q || f.name.toLowerCase().includes(q) || f.shop.toLowerCase().includes(q) || f.vibes.join(" ").toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
    const matchCat = catFilter==="All" || f.category===catFilter;
    const matchVibe = vibeFilter==="All" || f.vibes.includes(vibeFilter);
    const matchSrc = srcFilter==="All" || f.sourceType===srcFilter;
    const matchTier = tierFilter==="All" || getTier(f.price)===tierFilter;
    const matchColour = colourFilter==="All" || (f.colourTags||[]).includes(colourFilter);
    return matchSearch && matchCat && matchVibe && matchSrc && matchTier && matchColour;
  }), [search, catFilter, vibeFilter, srcFilter, tierFilter, colourFilter]);

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
        </div>
        <div className="db-count">{filtered.length} items</div>
      </div>

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
                  <td className="td-name">{f.name}</td>
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
                            <div className="drawer-field"><span className="df-label">Rooms</span><span>{f.rooms.join(", ")}</span></div>
                          </div>
                          <div className="drawer-desc">{f.description}</div>
                          <div className="drawer-notes"><span className="df-label">Curator notes: </span>{f.notes}</div>
                          <div className="drawer-actions">
                            <a href={f.url} target="_blank" rel="noreferrer" className="drawer-link">View on {f.shop} ↗</a>
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
