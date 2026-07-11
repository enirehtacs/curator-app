import { useState } from "react";

const NUMS = ["①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩"];

// Layout templates — all items on ONE canvas
// Each slot: { x, y, w, h } as % of canvas width/height
const CANVAS_LAYOUTS = {
  1: [{ x:15, y:10, w:70, h:80 }],
  2: [
    { x:2,  y:8,  w:47, h:84 },
    { x:51, y:8,  w:47, h:84 },
  ],
  3: [
    { x:2,  y:5,  w:47, h:55 },
    { x:51, y:5,  w:47, h:55 },
    { x:18, y:63, w:64, h:32 },
  ],
  4: [
    { x:2,  y:4,  w:47, h:45 },
    { x:51, y:4,  w:47, h:45 },
    { x:2,  y:52, w:47, h:44 },
    { x:51, y:52, w:47, h:44 },
  ],
  5: [
    { x:2,  y:4,  w:47, h:55 },
    { x:51, y:4,  w:29, h:55 },
    { x:82, y:4,  w:16, h:55 },
    { x:2,  y:62, w:30, h:34 },
    { x:34, y:62, w:64, h:34 },
  ],
  6: [
    { x:2,  y:4,  w:30, h:45 },
    { x:34, y:4,  w:30, h:45 },
    { x:66, y:4,  w:32, h:45 },
    { x:2,  y:52, w:30, h:44 },
    { x:34, y:52, w:30, h:44 },
    { x:66, y:52, w:32, h:44 },
  ],
  7: [
    { x:2,  y:4,  w:30, h:45 },
    { x:34, y:4,  w:30, h:45 },
    { x:66, y:4,  w:32, h:45 },
    { x:2,  y:52, w:21, h:44 },
    { x:25, y:52, w:21, h:44 },
    { x:48, y:52, w:21, h:44 },
    { x:71, y:52, w:27, h:44 },
  ],
  8: [
    { x:2,  y:4,  w:23, h:44 },
    { x:27, y:4,  w:23, h:44 },
    { x:52, y:4,  w:23, h:44 },
    { x:77, y:4,  w:21, h:44 },
    { x:2,  y:52, w:23, h:44 },
    { x:27, y:52, w:23, h:44 },
    { x:52, y:52, w:23, h:44 },
    { x:77, y:52, w:21, h:44 },
  ],
};

function getLayout(count) {
  const capped = Math.min(count, 8);
  return CANVAS_LAYOUTS[capped] || CANVAS_LAYOUTS[8];
}

function CollageCard({ item, layout, idx, showBudget, showInfo }) {
  const [err, setErr] = useState(false);
  return (
    <div style={{
      position:"absolute",
      left:`${layout.x}%`, top:`${layout.y}%`,
      width:`${layout.w}%`, height:`${layout.h}%`,
      transition:"transform 0.15s",
    }}>
      <div style={{
        width:"100%", height:"100%",
        borderRadius:12,
        overflow:"hidden",
        boxShadow:"0 3px 16px rgba(0,0,0,0.13)",
        position:"relative",
        background:"#EDE8E0",
      }}>
        {item.photo && !err ? (
          <img
            src={item.photo}
            alt={item.name}
            onError={()=>setErr(true)}
            style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
          />
        ) : (
          <div style={{
            width:"100%", height:"100%",
            background:`hsl(${(idx*53+20)%360},12%,86%)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            flexDirection:"column", gap:4,
          }}>
            <span style={{fontSize:28,opacity:0.35}}>🪑</span>
            <span style={{fontSize:10,color:"#888",fontWeight:500,textAlign:"center",padding:"0 6px"}}>{item.name}</span>
          </div>
        )}

        {/* Number badge */}
        <div style={{
          position:"absolute", top:7, left:7,
          background:"rgba(255,255,255,0.92)",
          borderRadius:20, padding:"2px 8px",
          fontSize:12, fontWeight:700, color:"#2C2B28",
          backdropFilter:"blur(4px)",
          lineHeight:1.4,
        }}>{NUMS[idx]}</div>

        {/* Price tag */}
        {showBudget && (
          <div style={{
            position:"absolute", top:7, right:7,
            background:"rgba(250,238,218,0.95)",
            border:"1px solid #C8A96E", borderRadius:7,
            padding:"2px 8px", fontSize:11, fontWeight:700, color:"#633806",
          }}>${item.price.toLocaleString()}</div>
        )}

        {/* Name gradient overlay — always show */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0,
          background:"linear-gradient(transparent, rgba(0,0,0,0.62))",
          padding:"28px 8px 7px",
        }}>
          <div style={{fontSize:11,fontWeight:600,color:"#fff",lineHeight:1.3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.name}</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.7)",marginTop:1}}>{item.shop}</div>
        </div>
      </div>
    </div>
  );
}

export default function MoodboardCollage({ sections, roomLabel, showInfo, showBudget }) {
  // Flatten ALL items from all sections into one array for single canvas
  const allItems = Object.entries(sections)
    .filter(([,items])=>items.length>0)
    .flatMap(([sec, items]) => items.map(item => ({ ...item, _section: sec })));

  if (allItems.length === 0) return null;

  const layout = getLayout(allItems.length);
  const totalSpent = allItems.reduce((s,i)=>s+i.price,0);

  // Group for info panel
  const sectionGroups = Object.entries(sections).filter(([,items])=>items.length>0);

  return (
    <div>
      {/* Single canvas — all items together */}
      <div style={{
        position:"relative",
        width:"100%",
        paddingBottom: allItems.length<=2?"50%":allItems.length<=4?"62%":"75%",
        background:"#F5F1EC",
        borderRadius:18,
        border:"1px solid #E0DAD0",
        overflow:"hidden",
      }}>
        <div style={{position:"absolute",inset:"8px"}}>
          {allItems.slice(0,8).map((item,idx)=>(
            <CollageCard
              key={item.id}
              item={item}
              layout={layout[idx]}
              idx={idx}
              showBudget={showBudget}
              showInfo={showInfo}
            />
          ))}
        </div>

        {/* Room label watermark */}
        <div style={{
          position:"absolute", bottom:12, right:16,
          fontSize:11, fontWeight:600, letterSpacing:"0.1em",
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
