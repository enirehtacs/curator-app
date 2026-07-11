import { useState } from "react";
import { COLOUR_HEX } from "../data/colours";

const NUMS = ["①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩"];

function sizeClass(item) {
  const cat = item.category;
  const sub = (item.subtype || "").toLowerCase();
  if (cat === "Sofa" || cat === "Bed") return "anchor";
  if (cat === "Table" && /dining|coffee|console/.test(sub)) return "anchor";
  if (cat === "Storage" || cat === "Table" || cat === "Chair" || cat === "Outdoor" || cat === "Kitchen/Dining") return "medium";
  if (cat === "Lighting") return "small";
  return "tiny"; // Accent, Ottoman, etc.
}
const RANK = { anchor: 0, medium: 1, small: 2, tiny: 3 };

// Bento-style mosaic templates — cells tile edge-to-edge (0-100 local box), biggest slot first.
// The 9-slot template is modelled on a classic gallery-wall collage layout.
const GRID_TEMPLATES = {
  1: [{ x: 8, y: 4, w: 84, h: 92 }],
  2: [
    { x: 0, y: 0, w: 48, h: 100 },
    { x: 52, y: 0, w: 48, h: 100 },
  ],
  3: [
    { x: 0, y: 0, w: 48, h: 48 },
    { x: 52, y: 0, w: 48, h: 48 },
    { x: 0, y: 52, w: 100, h: 48 },
  ],
  4: [
    { x: 0, y: 0, w: 48, h: 48 },
    { x: 52, y: 0, w: 48, h: 48 },
    { x: 0, y: 52, w: 48, h: 48 },
    { x: 52, y: 52, w: 48, h: 48 },
  ],
  5: [
    { x: 0, y: 0, w: 48, h: 64 },
    { x: 52, y: 0, w: 29, h: 64 },
    { x: 83, y: 0, w: 17, h: 64 },
    { x: 0, y: 66, w: 31, h: 34 },
    { x: 33, y: 66, w: 67, h: 34 },
  ],
  6: [
    { x: 0, y: 0, w: 31, h: 48 },
    { x: 33, y: 0, w: 31, h: 48 },
    { x: 66, y: 0, w: 34, h: 48 },
    { x: 0, y: 52, w: 31, h: 48 },
    { x: 33, y: 52, w: 31, h: 48 },
    { x: 66, y: 52, w: 34, h: 48 },
  ],
  7: [
    { x: 0, y: 0, w: 31, h: 48 },
    { x: 33, y: 0, w: 31, h: 48 },
    { x: 66, y: 0, w: 34, h: 48 },
    { x: 0, y: 52, w: 22, h: 48 },
    { x: 24, y: 52, w: 22, h: 48 },
    { x: 48, y: 52, w: 22, h: 48 },
    { x: 72, y: 52, w: 28, h: 48 },
  ],
  8: [
    { x: 0, y: 0, w: 22, h: 48 },
    { x: 24, y: 0, w: 22, h: 48 },
    { x: 48, y: 0, w: 22, h: 48 },
    { x: 72, y: 0, w: 28, h: 48 },
    { x: 0, y: 52, w: 22, h: 48 },
    { x: 24, y: 52, w: 22, h: 48 },
    { x: 48, y: 52, w: 22, h: 48 },
    { x: 72, y: 52, w: 28, h: 48 },
  ],
  9: [
    { x: 63, y: 0, w: 34, h: 31 },   // top-right
    { x: 16, y: 12, w: 44, h: 19 },  // top-left wide
    { x: 9, y: 32, w: 20, h: 25 },   // mid-left
    { x: 31, y: 32, w: 44, h: 38 },  // centre — biggest, the anchor slot
    { x: 78, y: 32, w: 19, h: 21 },  // mid-right upper
    { x: 78, y: 54, w: 22, h: 16 },  // mid-right lower
    { x: 0, y: 58, w: 29, h: 14 },   // small band, lower-left
    { x: 16, y: 72, w: 33, h: 28 },  // bottom-left
    { x: 50, y: 72, w: 43, h: 28 },  // bottom-right
  ],
};

// Canvas zones — centre grid box flanked by left/right margins reserved for side labels
const GRID_X0 = 16, GRID_X1 = 84;
const GRID_Y0 = 4, GRID_Y1 = 96;
const CELL_GAP = 0.8; // % inset applied to each side of every cell, creating a thin gutter

// Assign items to grid slots (biggest slot goes to the highest-ranked/"anchor" item),
// then bucket each into a left/right side-label column based on its slot's position.
function computeLayout(items) {
  const shown = items.slice(0, 9);
  const n = shown.length;
  if (n === 0) return { cells: [], leftLabels: [], rightLabels: [] };
  const template = GRID_TEMPLATES[n];

  const withMeta = shown.map((item, num) => ({ item, num, cls: sizeClass(item) }));
  const bySize = [...withMeta].sort((a, b) => RANK[a.cls] - RANK[b.cls]);
  const slotsByArea = template.map((slot, i) => ({ slot, i })).sort((a, b) => (b.slot.w * b.slot.h) - (a.slot.w * a.slot.h));

  const cells = bySize.map((m, i) => {
    const slot = slotsByArea[i].slot;
    const x = GRID_X0 + (slot.x / 100) * (GRID_X1 - GRID_X0);
    const y = GRID_Y0 + (slot.y / 100) * (GRID_Y1 - GRID_Y0);
    const w = (slot.w / 100) * (GRID_X1 - GRID_X0);
    const h = (slot.h / 100) * (GRID_Y1 - GRID_Y0);
    const bucket = slot.x + slot.w / 2 < 50 ? "left" : "right";
    return { item: m.item, num: m.num, x, y, w, h, bucket };
  });

  const stack = (bucket) => {
    const list = cells.filter(c => c.bucket === bucket).sort((a, b) => a.y - b.y);
    return list.map((c, i) => ({ ...c, labelY: list.length === 1 ? 50 : 6 + i * (88 / (list.length - 1)) }));
  };

  return { cells, leftLabels: stack("left"), rightLabels: stack("right") };
}

function CollagePhoto({ cell, showBudget }) {
  const { item, num, x, y, w, h } = cell;
  const [err, setErr] = useState(false);
  const g = CELL_GAP;
  return (
    <div style={{ position: "absolute", left: `${x + g}%`, top: `${y + g}%`, width: `${w - 2 * g}%`, height: `${h - 2 * g}%` }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 7, overflow: "hidden", position: "relative", background: "#EDE8E0" }}>
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
      </div>
    </div>
  );
}

// Straight dashed line from a cell's outer edge out to its label in the side margin.
// Drawn in an SVG whose viewBox aspect matches the canvas's real aspect ratio (see `aspect`
// prop), so a diagonal line renders at its true angle instead of being stretched.
function LeaderLines({ leftLabels, rightLabels, aspect }) {
  const lines = [...leftLabels.map(c => ({ ...c, side: "left" })), ...rightLabels.map(c => ({ ...c, side: "right" }))];
  return (
    <svg viewBox={`0 0 100 ${100 * aspect}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      {lines.map(c => {
        const edgeX = c.side === "left" ? c.x : c.x + c.w;
        const edgeY = (c.y + c.h / 2) * aspect;
        const labelX = c.side === "left" ? GRID_X0 - 6 : GRID_X1 + 6;
        const labelY = c.labelY * aspect;
        return (
          <line key={c.item.id} x1={labelX} y1={labelY} x2={edgeX} y2={edgeY} stroke="#888780" strokeWidth={0.15} strokeDasharray="0.8,0.9" />
        );
      })}
    </svg>
  );
}

function SideLabel({ cell, side, showInfo, showBudget }) {
  const { item, num, labelY } = cell;
  const style = side === "left"
    ? { left: 0, width: `${GRID_X0 - 6}%`, textAlign: "right" }
    : { left: `${GRID_X1 + 6}%`, width: `${100 - GRID_X1 - 6}%`, textAlign: "left" };
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

const CANVAS_PADDING_BOTTOM = 58; // % — defines the canvas aspect ratio (height = width * this / 100)

export default function MoodboardCollage({ sections, roomLabel, showInfo, showBudget }) {
  // Flatten ALL items from all sections into one array for single canvas
  const allItems = Object.entries(sections)
    .filter(([,items])=>items.length>0)
    .flatMap(([sec, items]) => items.map(item => ({ ...item, _section: sec })));

  if (allItems.length === 0) return null;

  const { cells, leftLabels, rightLabels } = computeLayout(allItems);
  const totalSpent = allItems.reduce((s,i)=>s+i.price,0);

  // Group for info panel
  const sectionGroups = Object.entries(sections).filter(([,items])=>items.length>0);

  return (
    <div>
      <RoomPalette items={allItems} />

      {/* Single canvas — all items together, mosaic grid + side labels */}
      <div style={{
        position:"relative",
        width:"100%",
        paddingBottom: `${CANVAS_PADDING_BOTTOM}%`,
        background:"#F5F1EC",
        borderRadius:18,
        border:"1px solid #E0DAD0",
        overflow:"hidden",
      }}>
        <LeaderLines leftLabels={leftLabels} rightLabels={rightLabels} aspect={CANVAS_PADDING_BOTTOM / 100} />
        {leftLabels.map(cell => <SideLabel key={cell.item.id} cell={cell} side="left" showInfo={showInfo} showBudget={showBudget} />)}
        {rightLabels.map(cell => <SideLabel key={cell.item.id} cell={cell} side="right" showInfo={showInfo} showBudget={showBudget} />)}
        {cells.map(cell => <CollagePhoto key={cell.item.id} cell={cell} showBudget={showBudget} />)}

        {/* Room label watermark — bottom-centre, clear of the side label columns */}
        <div style={{
          position:"absolute", bottom:6, left:"50%", transform:"translateX(-50%)",
          fontSize:10, fontWeight:600, letterSpacing:"0.1em",
          textTransform:"uppercase", color:"rgba(0,0,0,0.18)",
        }}>{roomLabel}</div>
      </div>

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
