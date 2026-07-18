import { useState } from "react";
import { COLOUR_HEX } from "../data/colours";

const NUMS = ["①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩"];

// Canvas zones — centre grid box flanked by left/right margins reserved for the dashed
// leader-line labels, same overall proportions as before.
const GRID_X0 = 19, GRID_X1 = 81;
const GRID_Y0 = 4, GRID_Y1 = 96;
const LEFT_LINE_X = 13, RIGHT_LINE_X = 87; // where leader lines start/end inside each margin
const GAP_PCT = 1.5; // % of canvas width — gutter between tiles, both directions
const STAGGER_STEP = 1 / 3; // tile-size offset step between stagger phases
const STAGGER_PHASES = [0, 2, 1]; // cycled by column index — 3 distinct phases so that up to
  // 3 columns sharing a side (our largest bucket, at 5 columns) never land on the same phase
const VIEW_COLUMNS = { large: 3, small: 5 };
const MIN_ASPECT = 0.4, MAX_ASPECT = 1.3; // clamp on the canvas's computed height/width ratio

// Lay `columns` of standardised square tiles inside the centre grid, filling left-to-right,
// top-to-bottom, with columns nudged down by varying thirds of a tile for a collage-like
// stagger. Columns in the left half of the grid point their leader line left, the rest point
// right — and because every column has a distinct stagger phase, same-side labels (which can
// span more than one column) never land at the same height and collide.
function computeLayout(items, columns) {
  const gridW = GRID_X1 - GRID_X0;
  const tileW = (gridW - GAP_PCT * (columns - 1)) / columns;
  const rows = Math.ceil(items.length / columns);
  const leftCols = Math.ceil(columns / 2);
  const maxPhase = Math.max(...STAGGER_PHASES);

  // Pick a canvas aspect ratio (padding-bottom %) tall enough to fit every row of this
  // count/column combination, so tiles render as true squares regardless of item count.
  const staggerExtra = tileW * STAGGER_STEP * maxPhase;
  const contentSpanAtSquareAspect = rows * tileW + (rows - 1) * GAP_PCT + staggerExtra;
  const targetSpan = GRID_Y1 - GRID_Y0;
  const aspect = Math.max(MIN_ASPECT, Math.min(MAX_ASPECT, contentSpanAtSquareAspect / targetSpan));

  const tileH = tileW / aspect;
  const gapH = GAP_PCT / aspect;

  const cells = items.map((item, num) => {
    const col = num % columns;
    const row = Math.floor(num / columns);
    const stagger = tileH * STAGGER_STEP * STAGGER_PHASES[col % STAGGER_PHASES.length];
    const x = GRID_X0 + col * (tileW + GAP_PCT);
    const y = GRID_Y0 + row * (tileH + gapH) + stagger;
    const bucket = col < leftCols ? "left" : "right";
    return { item, num, x, y, w: tileW, h: tileH, bucket, labelY: y + tileH / 2 };
  });

  return { cells, leftLabels: cells.filter(c => c.bucket === "left"), rightLabels: cells.filter(c => c.bucket === "right"), aspect };
}

function ColourDot({ colour, size = 12 }) {
  const bg = COLOUR_HEX[colour] || "#CCC";
  const isGradient = bg.startsWith("linear");
  return (
    <span title={colour} style={{
      display: "inline-block", width: size, height: size, borderRadius: "50%",
      background: isGradient ? undefined : bg, backgroundImage: isGradient ? bg : undefined,
      border: "1px solid rgba(0,0,0,0.12)", flexShrink: 0,
    }} />
  );
}

function SquareTile({ cell, showBudget, onClick }) {
  const { item, num, x, y, w, h } = cell;
  const [err, setErr] = useState(false);
  return (
    <div onClick={onClick} style={{
      position: "absolute", left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`,
      borderRadius: 8, overflow: "hidden", cursor: "pointer", background: "#EDE8E0",
    }}>
      {item.photo && !err ? (
        <img
          src={item.photo}
          alt={item.name}
          onError={() => setErr(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <div style={{ width: "100%", height: "100%", background: `hsl(38,${22 - (num % 3) * 4}%,${83 - (num % 4) * 3}%)` }} />
      )}
      <div style={{
        position: "absolute", top: 6, left: 6,
        background: "rgba(255,255,255,0.9)", borderRadius: 20,
        padding: "1px 7px", fontSize: 11, fontWeight: 700, color: "#2C2B28",
      }}>{NUMS[num] || num + 1}</div>
      {showBudget && (
        <div style={{
          position: "absolute", bottom: 6, right: 6,
          background: "rgba(250,238,218,0.95)", border: "1px solid #C8A96E",
          borderRadius: 6, padding: "1px 7px", fontSize: 10, fontWeight: 700, color: "#633806",
        }}>${item.price.toLocaleString()}</div>
      )}
    </div>
  );
}

// Perfectly horizontal dashed line from a tile's outer edge straight out to the margin —
// both ends sit at the tile's own vertical centre, so a plain absolutely-positioned div
// with a top border does the job without any aspect-ratio maths.
function LeaderLine({ cell, side }) {
  const edgeX = side === "left" ? cell.x : cell.x + cell.w;
  const lineX = side === "left" ? LEFT_LINE_X : RIGHT_LINE_X;
  const left = Math.min(edgeX, lineX);
  const width = Math.max(edgeX, lineX) - left;
  return (
    <div style={{
      position: "absolute", top: `${cell.labelY}%`, left: `${left}%`, width: `${width}%`,
      height: 0, borderTop: "1px dashed #888780",
    }} />
  );
}

function SideLabel({ cell, side, showInfo, showBudget }) {
  const { item, num, labelY } = cell;
  const style = side === "left"
    ? { left: "2%", width: `${LEFT_LINE_X - 4}%`, textAlign: "left" }
    : { left: `${RIGHT_LINE_X + 2}%`, width: `${98 - RIGHT_LINE_X - 2}%`, textAlign: "right" };
  return (
    <div style={{ position: "absolute", top: `${labelY}%`, transform: "translateY(-50%)", ...style }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#2C2B28", lineHeight: 1.3 }}>
        {NUMS[num] || num + 1} {item.name}
      </div>
      {showInfo && <div style={{ fontSize: 10, color: "#999", marginTop: 1 }}>{item.shop}</div>}
      {showBudget && <div style={{ fontSize: 10, fontWeight: 600, color: "#A87A2E", marginTop: 1 }}>${item.price.toLocaleString()}</div>}
    </div>
  );
}

function ItemDetailModal({ item, onClose }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal item-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{item.name}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="item-detail-body">
          <div className="item-detail-image">
            {item.photo && !imgError ? (
              <img src={item.photo} alt={item.name} onError={() => setImgError(true)} />
            ) : (
              <div className="drawer-photo-fallback" style={{ width: "100%", height: "100%" }}>
                <span>{item.category}</span>
              </div>
            )}
          </div>
          <div className="item-detail-info">
            <div className="drawer-grid">
              <div className="drawer-field"><span className="df-label">Shop</span><span>{item.shop}</span></div>
              <div className="drawer-field"><span className="df-label">SKU</span><span className="mono">{item.sku}</span></div>
              <div className="drawer-field"><span className="df-label">Price</span><span className="df-price">${item.price.toLocaleString()} SGD</span></div>
              <div className="drawer-field"><span className="df-label">Category</span><span>{item.category}{item.subtype ? ` — ${item.subtype}` : ""}</span></div>
              <div className="drawer-field"><span className="df-label">Materials</span><span>{item.materials}</span></div>
              <div className="drawer-field"><span className="df-label">Dimensions</span><span>{item.dimensions}</span></div>
              <div className="drawer-field"><span className="df-label">Colours</span>
                <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
                  {(item.colourTags || []).map(c => (
                    <span key={c} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                      <ColourDot colour={c} />{c}
                    </span>
                  ))}
                </div>
              </div>
              <div className="drawer-field"><span className="df-label">Rooms</span><span>{(item.rooms || []).join(", ")}</span></div>
              <div className="drawer-field"><span className="df-label">Vibes</span><span>{(item.vibes || []).join(", ")}</span></div>
              <div className="drawer-field"><span className="df-label">Lead time</span><span>{item.leadTime}</span></div>
              <div className="drawer-field"><span className="df-label">Availability</span><span>{item.availability}</span></div>
              <div className="drawer-field"><span className="df-label">Quality</span><span>{item.quality}</span></div>
            </div>
            {item.description && <div className="drawer-desc">{item.description}</div>}
            {item.notes && <div className="drawer-notes"><span className="df-label">Curator notes: </span>{item.notes}</div>}
            {item.url && (
              <div className="drawer-actions">
                <a href={item.url} target="_blank" rel="noreferrer" className="drawer-link">View on {item.shop} ↗</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RoomPalette({ items }) {
  const tags = [];
  items.forEach(item => (item.colourTags || []).forEach(c => { if (!tags.includes(c)) tags.push(c); }));
  if (tags.length === 0) return null;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#AAA", marginBottom: 6 }}>Room palette</div>
      <div style={{ display: "flex", gap: 14 }}>
        {tags.map(c => {
          const bg = COLOUR_HEX[c] || "#CCC";
          const isGradient = bg.startsWith("linear");
          return (
            <div key={c} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 8,
                background: isGradient ? undefined : bg,
                backgroundImage: isGradient ? bg : undefined,
                border: "1px solid rgba(0,0,0,0.12)",
              }} />
              <span style={{ fontSize: 10, color: "#888" }}>{c}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MoodboardCollage({ sections, roomLabel, showInfo, showBudget }) {
  const [density, setDensity] = useState("large"); // "large" (3 cols, see each clearly) | "small" (5 cols, see all at once)
  const [detailItem, setDetailItem] = useState(null);

  // Flatten ALL items from all sections into one array for single canvas
  const allItems = Object.entries(sections)
    .filter(([,items])=>items.length>0)
    .flatMap(([sec, items]) => items.map(item => ({ ...item, _section: sec })));

  if (allItems.length === 0) return null;

  const { cells, leftLabels, rightLabels, aspect } = computeLayout(allItems, VIEW_COLUMNS[density]);
  const totalSpent = allItems.reduce((s,i)=>s+i.price,0);

  // Group for info panel
  const sectionGroups = Object.entries(sections).filter(([,items])=>items.length>0);

  return (
    <div>
      <RoomPalette items={allItems} />

      <div className="mb-view-toggle" style={{ marginBottom: 10, marginLeft: "auto", width: "fit-content" }}>
        <button className={density === "large" ? "active" : ""} onClick={() => setDensity("large")}>Large view</button>
        <button className={density === "small" ? "active" : ""} onClick={() => setDensity("small")}>Small view</button>
      </div>

      {/* Single canvas — all items together, standardised square tiles in a staggered grid,
          with dashed leader lines out to numbered labels in the side margins */}
      <div style={{
        position: "relative", width: "100%", paddingBottom: `${aspect * 100}%`,
        background: "#F5F1EC", borderRadius: 18, border: "1px solid #E0DAD0", overflow: "hidden",
      }}>
        {leftLabels.map(cell => <LeaderLine key={"line-" + cell.item.id} cell={cell} side="left" />)}
        {rightLabels.map(cell => <LeaderLine key={"line-" + cell.item.id} cell={cell} side="right" />)}
        {leftLabels.map(cell => <SideLabel key={cell.item.id} cell={cell} side="left" showInfo={showInfo} showBudget={showBudget} />)}
        {rightLabels.map(cell => <SideLabel key={cell.item.id} cell={cell} side="right" showInfo={showInfo} showBudget={showBudget} />)}
        {cells.map(cell => <SquareTile key={cell.item.id} cell={cell} showBudget={showBudget} onClick={() => setDetailItem(cell.item)} />)}

        {/* Room label watermark — bottom-centre, clear of the side label columns */}
        <div style={{
          position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)",
          fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "rgba(0,0,0,0.18)",
        }}>{roomLabel}</div>
      </div>

      {detailItem && <ItemDetailModal item={detailItem} onClose={() => setDetailItem(null)} />}

      {/* Info panel — grouped by section */}
      {showInfo && (
        <div style={{
          marginTop:8, background:"#fff",
          border:"1px solid #E0DAD0", borderRadius:12, overflow:"hidden",
        }}>
          {sectionGroups.map(([sec, items])=>(
            <div key={sec}>
              <div style={{padding:"8px 14px 4px",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",color:"#AAA",borderBottom:"1px solid #F7F3EE"}}>{sec}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))"}}>
                {items.map((item,idx)=>{
                  const globalIdx = allItems.findIndex(i=>i.id===item.id);
                  return (
                    <div key={item.id} style={{padding:"10px 14px",borderRight:"1px solid #F7F3EE"}}>
                      <div style={{fontSize:11,color:"#AAA",marginBottom:2}}>{NUMS[globalIdx]||idx+1}</div>
                      <div style={{fontSize:12,fontWeight:600,color:"#2C2B28"}}>{item.name}</div>
                      <div style={{fontSize:11,color:"#888",margin:"2px 0"}}>{item.shop}</div>
                      <div style={{fontSize:10,fontFamily:"monospace",color:"#AAA"}}>{item.sku}</div>
                      <div style={{fontSize:11,color:"#666",marginTop:4,lineHeight:1.4}}>{item.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Budget panel — grouped by section */}
      {showBudget && (
        <div style={{
          marginTop:8, background:"#FAEEDA",
          border:"1px solid #F5D9A0", borderRadius:12, padding:"12px 16px",
        }}>
          {sectionGroups.map(([sec, items])=>{
            const secTotal = items.reduce((s,i)=>s+i.price,0);
            return (
              <div key={sec} style={{marginBottom:10}}>
                <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",color:"#854F0B",marginBottom:4}}>{sec}</div>
                {items.map((item,idx)=>{
                  const globalIdx = allItems.findIndex(i=>i.id===item.id);
                  return (
                    <div key={item.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#633806",padding:"2px 0"}}>
                      <span>{NUMS[globalIdx]||idx+1} {item.name}</span>
                      <span style={{fontWeight:600}}>${item.price.toLocaleString()}</span>
                    </div>
                  );
                })}
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#854F0B",borderTop:"1px solid #F5D9A0",marginTop:4,paddingTop:4}}>
                  <span>{sec} subtotal</span><span style={{fontWeight:600}}>${secTotal.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
          <div style={{display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:700,color:"#412402",borderTop:"2px solid #F5D9A0",paddingTop:10,marginTop:4}}>
            <span>Total — {allItems.length} items</span>
            <span>${totalSpent.toLocaleString()} SGD</span>
          </div>
        </div>
      )}
    </div>
  );
}
