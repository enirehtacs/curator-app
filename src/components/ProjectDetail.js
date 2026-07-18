import { useState, useMemo } from "react";
import { VIBES } from "../data/furniture";
import { getCustomFurniture } from "../data/customFurniture";
import { ROOM_TYPES, ROOM_SECTIONS, SECTION_CATEGORY_MAP } from "../data/projects";
import MoodboardCollage from "./MoodboardCollage";

const TIER_STYLE = { Budget:{background:"#D6F0E2",color:"#0F5C30"}, Mid:{background:"#FFF3CC",color:"#7A5A00"}, Premium:{background:"#FFD6D6",color:"#8B1A1A"} };
const CAT_STYLE = { "Sofa":{background:"#FFD6E0",color:"#8B1A2E"}, "Chair":{background:"#FFE8CC",color:"#8B4A00"}, "Ottoman":{background:"#FFF3CC",color:"#7A5A00"}, "Table":{background:"#D6F0E2",color:"#1A5C38"}, "Storage":{background:"#D6E8F7",color:"#1A3F6E"}, "Bed":{background:"#E8D6F7",color:"#5A1A8B"}, "Lighting":{background:"#FFF8CC",color:"#7A6800"}, "Accent":{background:"#F7D6F0",color:"#6E1A5A"}, "Outdoor":{background:"#D6F7D6",color:"#1A6E1A"}, "Kitchen/Dining":{background:"#F7E8D6",color:"#6E4A1A"} };
function getTier(p){ return p<=500?"Budget":p<=2000?"Mid":"Premium"; }

function PhotoCard({ item, showBudget, num }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="mb-photo-card">
      <div className="mb-photo-wrap">
        {!imgError && item.photo ? (
          <img src={item.photo} alt={item.name} className="mb-photo-img" onError={()=>setImgError(true)} />
        ) : (
          <div className="mb-photo-fallback" style={{background:`hsl(${(num*53+20)%360},15%,88%)`}}>
            <span className="mb-fallback-cat">{item.category}</span>
          </div>
        )}
        <div className="mb-photo-num">{["①","②","③","④","⑤","⑥"][num]||num+1}</div>
        {showBudget && <div className="mb-price-tag">${item.price.toLocaleString()}</div>}
      </div>
      <div className="mb-photo-label">{item.name}</div>
      <div className="mb-photo-shop">{item.shop}</div>
    </div>
  );
}

export default function ProjectDetail({ project, onUpdate, onBack }) {
  const [activeRoomId, setActiveRoomId] = useState(project.rooms[0]?.id || null);
  const [tab, setTab] = useState("workspace");
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoomType, setNewRoomType] = useState("Living Room");
  const [dragItem, setDragItem] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [search, setSearch] = useState("");
  const [vibeFilter, setVibeFilter] = useState("Match project");
  const [catFilter, setCat] = useState("All");
  const [showInfo, setShowInfo] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [houseView, setHouseView] = useState(false);
  const [mbMode, setMbMode] = useState("collage"); // "collage" | "list"

  const activeRoom = project.rooms.find(r => r.id === activeRoomId) || null;
  const roomSections = activeRoom ? (ROOM_SECTIONS[activeRoom.type] || ["Seating","Storage","Lighting","Accents"]) : [];
  const allSections = useMemo(() => {
    if (!activeRoom) return {};
    const s = {};
    roomSections.forEach(sec => { s[sec] = (activeRoom.sections||{})[sec] || []; });
    return s;
  }, [activeRoom, roomSections]);

  const totalSpent = project.rooms.reduce((sum,r) => sum + Object.values(r.sections||{}).flat().reduce((s,i)=>s+i.price,0), 0);
  const roomSpent = Object.values(allSections).flat().reduce((s,i)=>s+i.price,0);
  const budgetPct = Math.min(100, Math.round((totalSpent/project.budget)*100));

  function addRoom() {
    if (project.rooms.some(r=>r.type===newRoomType)) return alert("This room type already exists in this project");
    const newRoom = { id: Date.now(), type: newRoomType, sections: {} };
    const updated = { ...project, rooms: [...project.rooms, newRoom] };
    onUpdate(updated);
    setActiveRoomId(newRoom.id);
    setShowAddRoom(false);
    setTab("board");
  }

  function updateSections(newSections) {
    const updatedRooms = project.rooms.map(r =>
      r.id === activeRoomId ? { ...r, sections: newSections } : r
    );
    onUpdate({ ...project, rooms: updatedRooms });
  }

  function addToSection(item, sec) {
    const updated = { ...allSections, [sec]: [...(allSections[sec]||[]), item] };
    updateSections(updated);
  }

  function removeFromSection(itemId, sec) {
    const updated = { ...allSections, [sec]: allSections[sec].filter(i=>i.id!==itemId) };
    updateSections(updated);
  }

  const allFurniture = useMemo(() => getCustomFurniture(), []);
  const addedIds = Object.values(allSections).flat().map(i=>i.id);
  const filtered = useMemo(() => allFurniture.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = !q || f.name.toLowerCase().includes(q) || f.shop.toLowerCase().includes(q) || (f.description||"").toLowerCase().includes(q);
    const matchVibe = vibeFilter==="All" || (vibeFilter==="Match project" ? project.vibes.some(v=>f.vibes.includes(v)) : f.vibes.includes(vibeFilter));
    const matchCat = catFilter==="All" || f.category===catFilter;
    return matchSearch && matchVibe && matchCat && !addedIds.includes(f.id);
  }), [allFurniture, search, vibeFilter, catFilter, addedIds, project.vibes]);

  return (
    <div className="pd-wrap">
      <div className="pd-header">
        <div className="pd-header-left">
          <button className="back-btn" onClick={onBack}>← All projects</button>
          <div>
            <div className="pd-title">{project.clientName}</div>
            <div className="pd-vibes">{project.vibes.map(v=><span key={v} className="vibe-chip">{v}</span>)}</div>
          </div>
        </div>
        <div className="pd-header-right">
          <div className="budget-pill">
            <div className="budget-pill-label">Total budget</div>
            <div className="budget-pill-track">
              <div className="budget-pill-fill" style={{width:`${budgetPct}%`,background:budgetPct>90?"#E53535":budgetPct>70?"#D48A00":"#1A6E3C"}}/>
            </div>
            <div className="budget-pill-nums">
              <span style={{color:budgetPct>90?"#E53535":"inherit"}}>${totalSpent.toLocaleString()}</span>
              <span className="budget-of"> of ${project.budget.toLocaleString()} SGD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Room tabs */}
      <div className="room-tabs-bar">
        <div className="room-tabs">
          {project.rooms.map(r => (
            <button key={r.id} className={`room-tab ${activeRoomId===r.id&&!houseView?"active":""}`}
              onClick={()=>{setActiveRoomId(r.id);setHouseView(false);}}>
              {r.type}
            </button>
          ))}
          <button className={`room-tab house-tab ${houseView?"active":""}`} onClick={()=>setHouseView(true)}>
            🏠 Full house
          </button>
          <button className="room-tab add-room-tab" onClick={()=>setShowAddRoom(true)}>+ Add room</button>
        </div>
        {!houseView && activeRoom && (
          <div className="pd-tabs">
            <button className={tab==="workspace"?"active":""} onClick={()=>setTab("workspace")}>Workspace</button>
            <button className={tab==="visualisation"?"active":""} onClick={()=>setTab("visualisation")}>Visualisation</button>
          </div>
        )}
      </div>

      {/* Add room modal */}
      {showAddRoom && (
        <div className="modal-overlay" onClick={()=>setShowAddRoom(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:380}}>
            <div className="modal-header">
              <div className="modal-title">Add a room</div>
              <button className="modal-close" onClick={()=>setShowAddRoom(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-field">
                <label>Room type</label>
                <select value={newRoomType} onChange={e=>setNewRoomType(e.target.value)}>
                  {ROOM_TYPES.filter(rt=>!project.rooms.some(r=>r.type===rt)).map(rt=><option key={rt}>{rt}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={()=>setShowAddRoom(false)}>Cancel</button>
              <button className="btn-primary" onClick={addRoom}>Add room</button>
            </div>
          </div>
        </div>
      )}

      {/* No rooms yet */}
      {project.rooms.length === 0 && !showAddRoom && (
        <div className="empty-state" style={{marginTop:40}}>
          <div className="empty-icon">🛋</div>
          <div className="empty-title">No rooms yet</div>
          <div className="empty-sub">Add your first room to start curating furniture</div>
          <button className="btn-primary" onClick={()=>setShowAddRoom(true)}>+ Add room</button>
        </div>
      )}

      {/* Full house moodboard */}
      {houseView && (
        <div className="mb-wrap" style={{marginTop:16}}>
          <div className="mb-controls-row">
            <div className="mb-view-toggle">
              <button className={mbMode==="collage"?"active":""} onClick={()=>setMbMode("collage")}>🖼 Collage</button>
              <button className={mbMode==="list"?"active":""} onClick={()=>setMbMode("list")}>☰ List</button>
            </div>
            <button className={`mb-btn info-btn ${showInfo?"on":""}`} onClick={()=>setShowInfo(v=>!v)}>ⓘ Info</button>
            <button className={`mb-btn budget-btn ${showBudget?"on":""}`} onClick={()=>setShowBudget(v=>!v)}>⟨$⟩ Budget</button>
          </div>
          {project.rooms.map(room => {
            const secs = ROOM_SECTIONS[room.type] || [];
            const hasItems = secs.some(s=>(room.sections?.[s]||[]).length>0);
            if (!hasItems) return null;
            const filledSections = {};
            secs.forEach(s => { if ((room.sections?.[s]||[]).length>0) filledSections[s] = room.sections[s]; });
            return (
              <div key={room.id} className="house-room-block">
                <div className="house-room-label">{room.type}</div>
                {mbMode==="collage" ? (
                  <MoodboardCollage sections={filledSections} roomLabel={room.type} showInfo={showInfo} showBudget={showBudget} />
                ) : (
                  Object.entries(filledSections).map(([sec,items])=>(
                    <div key={sec} className="mb-section-block">
                      <div className="mb-section-label">{sec}</div>
                      <div className="mb-list-items">
                        {items.map((item,idx)=>(
                          <div key={item.id} className="mb-list-item">
                            <div className="mb-list-num">{["①","②","③","④","⑤"][idx]||idx+1}</div>
                            <div className="mb-list-thumb">
                              {item.photo ? <img src={item.photo} alt={item.name} onError={e=>e.target.style.display="none"} /> : <div className="mb-list-thumb-fallback"/>}
                            </div>
                            <div className="mb-list-body">
                              <div className="mb-list-name">{item.name}</div>
                              {showInfo && <>
                                <div className="mb-list-shop">{item.shop} · {item.sku}</div>
                                <div className="mb-list-desc">{item.description}</div>
                              </>}
                            </div>
                            {showBudget && <div className="mb-list-price">${item.price.toLocaleString()}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
          {showBudget && (
            <div className="grand-total-bar" style={{marginTop:16}}>
              <span>{project.rooms.reduce((s,r)=>s+Object.values(r.sections||{}).flat().length,0)} items · {project.rooms.length} rooms</span>
              <div>
                <div className="grand-total-amt">${totalSpent.toLocaleString()} SGD</div>
                <div className="grand-total-remain">${(project.budget-totalSpent).toLocaleString()} {project.budget>totalSpent?"under":"over"} budget</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Workspace — drag and drop */}
      {!houseView && activeRoom && tab==="workspace" && (
        <div className="pd-body">
          <div className="pd-db-panel">
            <div className="pd-db-panel-header">
              <div className="pd-db-panel-title">Furniture database</div>
              <div className="pd-db-hint">Drag an item onto a section →</div>
            </div>
            <div className="pd-db-filters">
              <input className="pd-search" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} />
              <select value={vibeFilter} onChange={e=>setVibeFilter(e.target.value)}>
                <option>Match project</option>
                <option>All</option>
                {VIBES.map(v=><option key={v}>{v}</option>)}
              </select>
              <select value={catFilter} onChange={e=>setCat(e.target.value)}>
                <option value="All">All categories</option>
                {["Sofa","Chair","Ottoman","Table","Storage","Bed","Lighting","Accent","Outdoor","Kitchen/Dining"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="pd-db-count">{filtered.length} items</div>
            <div className="pd-db-list">
              {filtered.map(item => (
                <div key={item.id} className="db-item-card" draggable onDragStart={()=>setDragItem(item)} onDragEnd={()=>{setDragItem(null);setDragOver(null);}}>
                  <div className="db-item-thumb">
                    {item.photo ? (
                      <img src={item.photo} alt={item.name} onError={e=>e.target.style.display='none'} />
                    ) : (
                      <div className="db-item-thumb-fallback" style={{background:`hsl(${Math.abs(item.id.charCodeAt(0)*7)%360},15%,88%)`}} />
                    )}
                  </div>
                  <div className="db-item-body">
                    <div className="db-item-name">{item.name}</div>
                    <div className="db-item-meta">
                      <span style={{fontSize:10,padding:"1px 6px",borderRadius:10,fontWeight:600,...(CAT_STYLE[item.category]||{})}}>{item.category}</span>
                      <span className="db-item-shop">{item.shop}</span>
                    </div>
                  </div>
                  <div className="db-item-right">
                    <div className="db-item-price">${item.price.toLocaleString()}</div>
                    <div style={{fontSize:10,padding:"1px 6px",borderRadius:10,fontWeight:600,...TIER_STYLE[getTier(item.price)]}}>{getTier(item.price)}</div>
                  </div>
                </div>
              ))}
              {filtered.length===0 && <div className="empty-panel">No items match — try changing filters</div>}
            </div>
          </div>

          <div className="pd-sections">
            {roomSections.map(sec => {
              const secItems = allSections[sec]||[];
              const secTotal = secItems.reduce((s,i)=>s+i.price,0);
              const isDragTarget = dragOver===sec;
              return (
                <div key={sec} className={`section-drop-zone ${isDragTarget?"drag-over":""}`}
                  onDragOver={e=>{e.preventDefault();setDragOver(sec);}}
                  onDrop={e=>{e.preventDefault();if(dragItem)addToSection(dragItem,sec);setDragItem(null);setDragOver(null);}}>
                  <div className="sdz-header">
                    <span className="sdz-name">{sec}</span>
                    <span className="sdz-count">{secItems.length} item{secItems.length!==1?"s":""}</span>
                    {secItems.length>0 && <span className="sdz-total">${secTotal.toLocaleString()}</span>}
                  </div>
                  {secItems.length===0 ? (
                    <div className="sdz-empty">{isDragTarget?"Drop here ↓":"Drag items here"}</div>
                  ) : (
                    <div className="sdz-items">
                      {secItems.map(item=>(
                        <div key={item.id} className="sdz-item">
                          <div className="sdz-item-thumb">
                            {item.photo && <img src={item.photo} alt={item.name} onError={e=>e.target.style.display='none'} />}
                          </div>
                          <div className="sdz-item-body">
                            <div className="sdz-item-name">{item.name}</div>
                            <div className="sdz-item-shop">{item.shop}</div>
                          </div>
                          <div className="sdz-item-price">${item.price.toLocaleString()}</div>
                          <button className="sdz-remove" onClick={()=>removeFromSection(item.id,sec)}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Visualisation — collage + list */}
      {!houseView && activeRoom && tab==="visualisation" && (
        <div className="mb-wrap" style={{marginTop:16}}>
          <div className="mb-controls-row">
            <div className="mb-view-toggle">
              <button className={mbMode==="collage"?"active":""} onClick={()=>setMbMode("collage")}>🖼 Collage</button>
              <button className={mbMode==="list"?"active":""} onClick={()=>setMbMode("list")}>☰ List</button>
            </div>
            <button className={`mb-btn info-btn ${showInfo?"on":""}`} onClick={()=>setShowInfo(v=>!v)}>ⓘ Info</button>
            <button className={`mb-btn budget-btn ${showBudget?"on":""}`} onClick={()=>setShowBudget(v=>!v)}>⟨$⟩ Budget</button>
          </div>

          {Object.values(allSections).flat().length===0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛋</div>
              <div className="empty-title">No items in this room yet</div>
              <div className="empty-sub">Go to Board view and drag items into sections</div>
              <button className="btn-primary" onClick={()=>setTab("workspace")}>Go to Workspace</button>
            </div>
          ) : mbMode==="collage" ? (
            <>
              <MoodboardCollage sections={allSections} roomLabel={activeRoom.type} showInfo={showInfo} showBudget={showBudget} />
              {showBudget && (
                <div className="grand-total-bar" style={{marginTop:16}}>
                  <span>{Object.values(allSections).flat().length} items · {activeRoom.type}</span>
                  <div>
                    <div className="grand-total-amt">${roomSpent.toLocaleString()} SGD</div>
                    <div className="grand-total-remain">Total across all rooms: ${totalSpent.toLocaleString()}</div>
                  </div>
                </div>
              )}
            </>
          ) : (
            // List view
            <>
              {roomSections.map(sec => {
                const items = allSections[sec]||[];
                if (!items.length) return null;
                const secTotal = items.reduce((s,i)=>s+i.price,0);
                return (
                  <div key={sec} className="mb-section-block">
                    <div className="mb-section-label">{sec}{showBudget && <span style={{float:"right",color:"#C8A96E"}}>${secTotal.toLocaleString()}</span>}</div>
                    <div className="mb-list-items">
                      {items.map((item,idx)=>(
                        <div key={item.id} className="mb-list-item">
                          <div className="mb-list-num">{["①","②","③","④","⑤"][idx]||idx+1}</div>
                          <div className="mb-list-thumb">
                            {item.photo ? <img src={item.photo} alt={item.name} onError={e=>e.target.style.display="none"} /> : <div className="mb-list-thumb-fallback"/>}
                          </div>
                          <div className="mb-list-body">
                            <div className="mb-list-name">{item.name}</div>
                            {showInfo && <>
                              <div className="mb-list-shop">{item.shop} · {item.sku}</div>
                              <div className="mb-list-desc">{item.description}</div>
                            </>}
                          </div>
                          {showBudget && <div className="mb-list-price">${item.price.toLocaleString()}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {showBudget && (
                <div className="grand-total-bar" style={{marginTop:16}}>
                  <span>{Object.values(allSections).flat().length} items · {activeRoom.type}</span>
                  <div>
                    <div className="grand-total-amt">${roomSpent.toLocaleString()} SGD</div>
                    <div className="grand-total-remain">Total across all rooms: ${totalSpent.toLocaleString()}</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
