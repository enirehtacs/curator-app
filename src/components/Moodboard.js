import { useState } from "react";

const PALETTE = [
  { name:"Bouclé caramel", hex:"#C9B8A0", sections:["seating","storage"] },
  { name:"Walnut",         hex:"#7A5C3E", sections:["seating","storage"] },
  { name:"Sage cord",      hex:"#A8B89C", sections:["seating"] },
  { name:"Brass",          hex:"#C8A96E", sections:["storage","lighting"] },
  { name:"Rattan natural", hex:"#D4C4A0", sections:["storage"] },
  { name:"Terracotta",     hex:"#C07050", sections:["lighting","accents"] },
  { name:"Sage green",     hex:"#8B9E7A", sections:["accents"] },
  { name:"Pampas cream",   hex:"#E8E0D0", sections:["accents"] },
];

const SECTION_INFO = {
  seating: {
    label:"Seating", sub:"Sofa + bean bags — anchor pieces",
    items:[
      { num:"①", name:"Modena 3-seater sofa", shop:"Castlery", sku:"CST-MOD-3S-CAR", desc:"Burnt caramel bouclé, FSC walnut legs. Curved retro arms. W220 D90 H78cm", price:"$2,800" },
      { num:"②③", name:"Pebble bean bag ×2", shop:"Taobao — YMY Home Store", sku:"ymy-pebble-cord-sage", desc:"Sage corduroy, high-density foam, washable cover. 4.8★ 2,300+ reviews", price:"$380 × 2" },
    ],
    total:"$3,560", remaining:"$6,440 remaining",
    bg:"#F5F1EC",
  },
  storage: {
    label:"Storage", sub:"TV console + display shelf",
    items:[
      { num:"①", name:"Oslo TV console 180cm", shop:"HipVan Singapore", sku:"HV-OSLO-180-WN", desc:"Walnut veneer, fluted doors, brass pulls. W180 D40 H55cm. Pre-order 3 wks.", price:"$1,200" },
      { num:"②", name:"Arco modular shelf", shop:"IKEA + Superfront fronts", sku:"KALLAX 2×2 + SF-RTN-4PK", desc:"Rattan door fronts on KALLAX. Retro display + hidden storage combo.", price:"$680" },
    ],
    total:"$1,880", remaining:"Running total $5,440",
    bg:"#F2EDE6",
  },
  lighting: {
    label:"Lighting", sub:"Lamps — warm ambient glow",
    items:[
      { num:"①", name:"Arco arc floor lamp", shop:"Scene Shang — local SG", sku:"SS-ARC-BR-OPL", desc:"Brushed brass, opal glass globe. 2700K warm. H180cm. Arcs over sofa.", price:"$420" },
      { num:"②", name:"Edison table lamp ×2", shop:"Taobao — Mua Light Store", sku:"mua-tc-terra-rtn", desc:"Terracotta base, rattan shade. Pair on console for symmetry. H42cm.", price:"$90 × 2" },
    ],
    total:"$600", remaining:"Running total $6,040",
    bg:"#EDE8E0",
  },
  accents: {
    label:"Accents", sub:"Vases + decor — finishing layer",
    items:[
      { num:"①", name:"Stoneware vase set ×3", shop:"In The Mood For Love SG", sku:"ITMFL-SW-SET3-TRS", desc:"Handmade, terracotta + sage. Heights 18/24/30cm. Shelf display.", price:"$220" },
      { num:"②", name:"Dried pampas + rattan tray", shop:"Taobao — Bos Home Store", sku:"bos-pampas-rtn-tray", desc:"Bleached pampas + oval rattan tray. Coffee table styling.", price:"$160" },
    ],
    total:"$380", remaining:"Grand total $6,420",
    bg:"#E8E3DC",
  },
};

const TABS = ["seating","storage","lighting","accents"];

function CollageSeating() {
  return (
    <svg viewBox="0 0 640 300" style={{width:"100%",display:"block"}}>
      <rect width="640" height="300" fill="#F5F1EC"/>
      <rect x="140" y="90" width="260" height="120" rx="16" fill="#C9B8A0"/>
      <rect x="152" y="80" width="236" height="22" rx="8" fill="#A89070"/>
      <rect x="155" y="196" width="46" height="26" rx="6" fill="#7A5C3E"/>
      <rect x="345" y="196" width="46" height="26" rx="6" fill="#7A5C3E"/>
      <rect x="200" y="104" width="72" height="46" rx="8" fill="#E8E0D0"/>
      <rect x="328" y="104" width="60" height="46" rx="8" fill="#E8E0D0"/>
      <ellipse cx="74" cy="200" rx="48" ry="48" fill="#A8B89C"/>
      <ellipse cx="74" cy="200" rx="34" ry="34" fill="#8BA882"/>
      <ellipse cx="74" cy="200" rx="20" ry="20" fill="#A8B89C"/>
      <ellipse cx="548" cy="200" rx="48" ry="48" fill="#A8B89C"/>
      <ellipse cx="548" cy="200" rx="34" ry="34" fill="#8BA882"/>
      <ellipse cx="548" cy="200" rx="20" ry="20" fill="#A8B89C"/>
      <line x1="270" y1="90" x2="270" y2="46" stroke="#888780" strokeWidth="0.5" strokeDasharray="3 3"/>
      <text x="180" y="40" fontFamily="sans-serif" fontSize="11" fill="#5F5E5A">① Modena 3-seater sofa</text>
      <line x1="74" y1="152" x2="74" y2="46" stroke="#888780" strokeWidth="0.5" strokeDasharray="3 3"/>
      <text x="4" y="40" fontFamily="sans-serif" fontSize="11" fill="#5F5E5A">② Bean bag A</text>
      <line x1="548" y1="152" x2="548" y2="46" stroke="#888780" strokeWidth="0.5" strokeDasharray="3 3"/>
      <text x="478" y="40" fontFamily="sans-serif" fontSize="11" fill="#5F5E5A">③ Bean bag B</text>
      <text x="320" y="288" fontFamily="sans-serif" fontSize="10" fill="#888780" textAnchor="middle">Retro ambient · Seating</text>
    </svg>
  );
}
function CollageStorage() {
  return (
    <svg viewBox="0 0 640 300" style={{width:"100%",display:"block"}}>
      <rect width="640" height="300" fill="#F5F1EC"/>
      <rect x="60" y="90" width="300" height="140" rx="8" fill="#7A5C3E"/>
      <rect x="78" y="108" width="80" height="104" rx="5" fill="#C9A870" fillOpacity="0.25"/>
      <rect x="174" y="108" width="80" height="104" rx="5" fill="#C9A870" fillOpacity="0.25"/>
      <rect x="270" y="108" width="72" height="104" rx="5" fill="#C9A870" fillOpacity="0.2"/>
      <circle cx="121" cy="212" r="5" fill="#C8A96E"/>
      <circle cx="217" cy="212" r="5" fill="#C8A96E"/>
      <rect x="410" y="64" width="170" height="210" rx="8" fill="#F0EBE0" stroke="#D4C4A0" strokeWidth="0.5"/>
      <rect x="420" y="74" width="70" height="92" rx="4" fill="#D4C4A0" fillOpacity="0.6"/>
      <rect x="498" y="74" width="72" height="92" rx="4" fill="#D4C4A0" fillOpacity="0.6"/>
      <rect x="420" y="174" width="70" height="88" rx="4" fill="#D4C4A0" fillOpacity="0.6"/>
      <rect x="498" y="174" width="72" height="88" rx="4" fill="#D4C4A0" fillOpacity="0.6"/>
      <line x1="210" y1="90" x2="210" y2="46" stroke="#888780" strokeWidth="0.5" strokeDasharray="3 3"/>
      <text x="120" y="40" fontFamily="sans-serif" fontSize="11" fill="#5F5E5A">① Oslo TV console 180cm</text>
      <line x1="494" y1="64" x2="494" y2="46" stroke="#888780" strokeWidth="0.5" strokeDasharray="3 3"/>
      <text x="428" y="40" fontFamily="sans-serif" fontSize="11" fill="#5F5E5A">② Arco display shelf</text>
      <text x="320" y="288" fontFamily="sans-serif" fontSize="10" fill="#888780" textAnchor="middle">Retro ambient · Storage</text>
    </svg>
  );
}
function CollageLighting() {
  return (
    <svg viewBox="0 0 640 300" style={{width:"100%",display:"block"}}>
      <rect width="640" height="300" fill="#F5F1EC"/>
      <line x1="210" y1="278" x2="210" y2="100" stroke="#C8A96E" strokeWidth="4" strokeLinecap="round"/>
      <path d="M210 100 Q300 56 350 82" stroke="#C8A96E" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <ellipse cx="356" cy="88" rx="30" ry="22" fill="#F5F0E8" stroke="#C8A96E" strokeWidth="1"/>
      <rect x="190" y="276" width="40" height="16" rx="6" fill="#7A5C3E"/>
      <rect x="106" y="184" width="22" height="76" rx="9" fill="#C07050"/>
      <ellipse cx="117" cy="180" rx="20" ry="13" fill="#D4C4A0" stroke="#B8A878" strokeWidth="0.5"/>
      <rect x="490" y="184" width="22" height="76" rx="9" fill="#C07050"/>
      <ellipse cx="501" cy="180" rx="20" ry="13" fill="#D4C4A0" stroke="#B8A878" strokeWidth="0.5"/>
      <line x1="210" y1="100" x2="160" y2="46" stroke="#888780" strokeWidth="0.5" strokeDasharray="3 3"/>
      <text x="20" y="40" fontFamily="sans-serif" fontSize="11" fill="#5F5E5A">① Arco arc floor lamp</text>
      <line x1="117" y1="180" x2="117" y2="46" stroke="#888780" strokeWidth="0.5" strokeDasharray="3 3"/>
      <text x="30" y="58" fontFamily="sans-serif" fontSize="11" fill="#5F5E5A">② Edison table lamp ×2</text>
      <text x="320" y="288" fontFamily="sans-serif" fontSize="10" fill="#888780" textAnchor="middle">Retro ambient · Lighting</text>
    </svg>
  );
}
function CollageAccents() {
  return (
    <svg viewBox="0 0 640 300" style={{width:"100%",display:"block"}}>
      <rect width="640" height="300" fill="#F5F1EC"/>
      <ellipse cx="190" cy="232" rx="70" ry="14" fill="#C4A870" fillOpacity="0.45"/>
      <rect x="166" y="140" width="16" height="94" rx="7" fill="#A0785A"/>
      <ellipse cx="174" cy="138" rx="11" ry="22" fill="#8B6048"/>
      <rect x="188" y="158" width="13" height="76" rx="5" fill="#8B9E7A"/>
      <ellipse cx="194" cy="156" rx="9" ry="18" fill="#6E8060"/>
      <rect x="206" y="170" width="11" height="64" rx="4" fill="#A0785A"/>
      <ellipse cx="211" cy="168" rx="8" ry="15" fill="#8B6048"/>
      <rect x="360" y="210" width="200" height="14" rx="5" fill="#C4A870" fillOpacity="0.6"/>
      <line x1="400" y1="210" x2="400" y2="136" stroke="#E8E0D0" strokeWidth="3" strokeLinecap="round"/>
      <ellipse cx="393" cy="128" rx="12" ry="26" fill="#E8E0D0" fillOpacity="0.75"/>
      <line x1="440" y1="210" x2="440" y2="106" stroke="#E8E0D0" strokeWidth="3" strokeLinecap="round"/>
      <ellipse cx="433" cy="96" rx="16" ry="32" fill="#E8E0D0" fillOpacity="0.9"/>
      <line x1="478" y1="210" x2="478" y2="120" stroke="#E8E0D0" strokeWidth="3" strokeLinecap="round"/>
      <ellipse cx="471" cy="112" rx="12" ry="24" fill="#E8E0D0" fillOpacity="0.7"/>
      <line x1="190" y1="138" x2="190" y2="46" stroke="#888780" strokeWidth="0.5" strokeDasharray="3 3"/>
      <text x="90" y="40" fontFamily="sans-serif" fontSize="11" fill="#5F5E5A">① Stoneware vase set ×3</text>
      <line x1="440" y1="96" x2="520" y2="46" stroke="#888780" strokeWidth="0.5" strokeDasharray="3 3"/>
      <text x="464" y="40" fontFamily="sans-serif" fontSize="11" fill="#5F5E5A">② Pampas + tray</text>
      <text x="320" y="288" fontFamily="sans-serif" fontSize="10" fill="#888780" textAnchor="middle">Retro ambient · Accents</text>
    </svg>
  );
}

const COLLAGES = { seating:<CollageSeating/>, storage:<CollageStorage/>, lighting:<CollageLighting/>, accents:<CollageAccents/> };

export default function Moodboard() {
  const [mbView, setMbView]     = useState("section");
  const [activeTab, setTab]     = useState("seating");
  const [showInfo, setInfo]     = useState(false);
  const [showBudget, setBudget] = useState(false);

  const sec = SECTION_INFO[activeTab];

  return (
    <div className="mb-wrap">
      {/* Top bar */}
      <div className="mb-topbar">
        <div>
          <div className="mb-eyebrow">Living room · Retro ambient</div>
          <div className="mb-title">Moodboard — Demo project</div>
          <div className="mb-sub">Budget: $10,000 SGD · 8 items · 4 sections</div>
        </div>
        <div className="mb-controls">
          <div className="mb-view-toggle">
            <button className={mbView==="section"?"active":""} onClick={()=>setMbView("section")}>Section</button>
            <button className={mbView==="full"?"active":""} onClick={()=>setMbView("full")}>Full room</button>
          </div>
          <button className={`mb-btn info-btn ${showInfo?"on":""}`} onClick={()=>setInfo(v=>!v)}>
            ⓘ Info
          </button>
          <button className={`mb-btn budget-btn ${showBudget?"on":""}`} onClick={()=>setBudget(v=>!v)}>
            ⟨$⟩ Budget
          </button>
        </div>
      </div>

      {/* Palette */}
      <div className="palette-row">
        {PALETTE.map(s => {
          const lit = mbView==="section" ? s.sections.includes(activeTab) : false;
          return (
            <div key={s.name} className={`swatch-card ${lit?"lit":""}`}>
              <div className="swatch-color" style={{background:s.hex}}/>
              <div className="swatch-label">
                <div className="swatch-name">{s.name}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section view */}
      {mbView==="section" && (
        <div>
          <div className="mb-tabs">
            {TABS.map((t,i) => (
              <button key={t} className={`mb-tab ${activeTab===t?"active":""}`} onClick={()=>setTab(t)}>
                {["①","②","③","④"][i]} {SECTION_INFO[t].label}
              </button>
            ))}
          </div>

          <div className="section-card">
            <div className="section-header">
              <span className="section-name">{sec.label}</span>
              <span className="section-sub">{sec.sub}</span>
            </div>
            <div className="collage-box">{COLLAGES[activeTab]}</div>

            {showInfo && (
              <div className="info-panel">
                {sec.items.map(item => (
                  <div key={item.num} className="info-item">
                    <div className="info-num">{item.num}</div>
                    <div className="info-name">{item.name}</div>
                    <div className="info-shop">{item.shop}</div>
                    <div className="info-sku">{item.sku}</div>
                    <div className="info-desc">{item.desc}</div>
                  </div>
                ))}
              </div>
            )}

            {showBudget && (
              <div className="budget-panel">
                <div className="budget-items">
                  {sec.items.map(item => (
                    <div key={item.num} className="budget-row">
                      <span>{item.num} {item.name}</span>
                      <span className="budget-price">{item.price}</span>
                    </div>
                  ))}
                </div>
                <div className="budget-total-row">
                  <span>Section total</span>
                  <span className="budget-total">{sec.total}</span>
                </div>
                <div className="budget-remain">{sec.remaining}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full room view */}
      {mbView==="full" && (
        <div>
          <div className="full-grid">
            {TABS.map((t,i) => {
              const s = SECTION_INFO[t];
              return (
                <div key={t} className="full-card">
                  <div className="full-label">{["①","②","③","④"][i]} {s.label}</div>
                  <div className="full-collage">{COLLAGES[t]}</div>
                  {showInfo && (
                    <div className="full-info">
                      {s.items.map(item => (
                        <div key={item.num} className="full-info-row">
                          <span className="full-info-name">{item.num} {item.name}</span>
                          <span className="full-info-shop">{item.shop}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {showBudget && (
                    <div className="full-budget">
                      {s.items.map(item => (
                        <div key={item.num} className="full-budget-row">
                          <span>{item.name}</span>
                          <span className="full-budget-price">{item.price}</span>
                        </div>
                      ))}
                      <div className="full-budget-sec-total">
                        <span>Subtotal</span><span>{s.total}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {showBudget && (
            <div className="grand-total-bar">
              <span>8 items · 4 sections · Seating $3,560 · Storage $1,880 · Lighting $600 · Accents $380</span>
              <div>
                <div className="grand-total-amt">$6,420 SGD</div>
                <div className="grand-total-remain">$3,580 under $10,000 budget</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
