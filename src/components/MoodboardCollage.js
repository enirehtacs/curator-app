import { useState } from "react";
import { COLOUR_HEX } from "../data/colours";
import { estimateApparentSize } from "../data/dimensions";

const NUMS = ["①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩"];

// Canvas zones — centre grid box flanked by left/right margins reserved for side labels
const GRID_X0 = 19, GRID_X1 = 81;
const GRID_Y0 = 4, GRID_Y1 = 96;
const CELL_GAP = 0.8; // % inset applied to each side of every cell, creating a thin gutter
const LEFT_LINE_X = 13, RIGHT_LINE_X = 87; // where leader lines start/end inside each margin

// Three sub-columns within the grid box: a centred "anchor" column for the single biggest
// item, flanked by a left and right column that each stack their items vertically.
// Stacking (rather than a multi-column grid) guarantees every item in a column sits at a
// different y — which matters because leader lines are strictly horizontal, so two items
// on the same side can never share a y without their labels colliding.
const COL_LEFT = { x0: 0, x1: 29 };
const COL_CENTER = { x0: 31, x1: 69 };
const COL_RIGHT = { x0: 71, x1: 100 };
const MIN_STACK_H = 16; // % floor per stacked cell so small accents don't shrink to nothing

function toCanvas(localX0, localX1, localY0, localY1) {
  const gw = GRID_X1 - GRID_X0, gh = GRID_Y1 - GRID_Y0;
  return {
    x: GRID_X0 + (localX0 / 100) * gw,
    w: ((localX1 - localX0) / 100) * gw,
    y: GRID_Y0 + (localY0 / 100) * gh,
    h: ((localY1 - localY0) / 100) * gh,
  };
}

// Stack a column's items top-to-bottom with height proportional to each item's real-world
// size (estimateApparentSize), clamped to a minimum so nothing becomes illegibly thin.
function stackColumn(list, col, bucket) {
  if (list.length === 0) return [];
  const sizes = list.map(m => m.size);
  const total = sizes.reduce((a, b) => a + b, 0) || 1;
  let heights = sizes.map(s => Math.max(MIN_STACK_H, (s / total) * 100));
  const sumH = heights.reduce((a, b) => a + b, 0);
  heights = heights.map(h => (h / sumH) * 100); // renormalise to fill exactly 100% of the column

  let localY = 0;
  return list.map((m, i) => {
    const h = heights[i];
    const { x, w, y, h: ch } = toCanvas(col.x0, col.x1, localY, localY + h);
    localY += h;
    return { item: m.item, num: m.num, x, y, w, h: ch, bucket, labelY: y + ch / 2 };
  });
}

// Assign items by real-world size (via estimateApparentSize, parsed from `dimensions`):
// the single biggest item becomes a centred anchor cell, the rest split between a left and
// right stack (snake-distributed so both sides carry a similar amount of visual weight).
function computeLayout(items) {
  const shown = items.slice(0, 10);
  const n = shown.length;
  if (n === 0) return { cells: [], leftLabels: [], rightLabels: [] };

  const withMeta = shown.map((item, num) => ({ item, num, size: estimateApparentSize(item) }));
  const bySize = [...withMeta].sort((a, b) => b.size - a.size);

  if (n === 1) {
    const { x, y, w, h } = toCanvas(0, 100, 0, 100);
    const cell = { item: bySize[0].item, num: bySize[0].num, x, y, w, h, bucket: "right", labelY: y + h / 2 };
    return { cells: [cell], leftLabels: [], rightLabels: [cell] };
  }

  if (n === 2) {
    const leftHalf = toCanvas(0, 49, 0, 100), rightHalf = toCanvas(51, 100, 0, 100);
    const cells = [
      { item: bySize[0].item, num: bySize[0].num, ...leftHalf, bucket: "left", labelY: leftHalf.y + leftHalf.h / 2 },
      { item: bySize[1].item, num: bySize[1].num, ...rightHalf, bucket: "right", labelY: rightHalf.y + rightHalf.h / 2 },
    ];
    return { cells, leftLabels: [cells[0]], rightLabels: [cells[1]] };
  }

  const anchor = bySize[0];
  const rest = bySize.slice(1);
  const left = [], right = [];
  rest.forEach((m, i) => (i % 2 === 0 ? left : right).push(m));

  const { x, y, w, h } = toCanvas(COL_CENTER.x0, COL_CENTER.x1, 0, 100);
  const anchorBucket = left.length <= right.length ? "left" : "right";
  const anchorCell = { item: anchor.item, num: anchor.num, x, y, w, h, bucket: anchorBucket, labelY: y + h / 2 };

  const leftCells = stackColumn(left, COL_LEFT, "left");
  const rightCells = stackColumn(right, COL_RIGHT, "right");

  const cells = [anchorCell, ...leftCells, ...rightCells];
  const leftLabels = cells.filter(c => c.bucket === "left");
  const rightLabels = cells.filter(c => c.bucket === "right");
  return { cells, leftLabels, rightLabels };
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

// Perfectly horizontal dashed line from a cell's outer edge straight out to the margin —
// no diagonals. Since both ends sit at the same y (the cell's own vertical centre), a plain
// absolutely-positioned div with a top border does the job without any aspect-ratio maths.
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
        {leftLabels.map(cell => <LeaderLine key={"line-"+cell.item.id} cell={cell} side="left" />)}
        {rightLabels.map(cell => <LeaderLine key={"line-"+cell.item.id} cell={cell} side="right" />)}
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
