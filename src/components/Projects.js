import { useState } from "react";
import { VIBES } from "../data/furniture";

function ClientPicker({ clients, value, onChange, placeholder = "Search clients…" }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = clients.find(c => c.id === value);
  const matches = clients.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="client-picker">
      <input
        className="client-picker-input"
        value={open ? query : (selected ? selected.name : "")}
        onFocus={() => { setOpen(true); setQuery(""); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={e => setQuery(e.target.value)}
        placeholder={placeholder}
      />
      {open && (
        <div className="client-picker-dropdown">
          <div className="client-picker-option" onMouseDown={() => { onChange(null); setOpen(false); }}>No client</div>
          {matches.length === 0 && <div className="client-picker-empty">No matches</div>}
          {matches.map(c => (
            <div key={c.id} className="client-picker-option" onMouseDown={() => { onChange(c.id); setOpen(false); }}>{c.name}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Projects({ projects, clients, onCreate, onOpen, onDelete, onAssignClient }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ clientName:"", budget:"", vibes:[], notes:"", clientId:null });
  const [assigningId, setAssigningId] = useState(null);

  function toggleVibe(v) {
    setForm(f => ({ ...f, vibes: f.vibes.includes(v) ? f.vibes.filter(x=>x!==v) : [...f.vibes, v] }));
  }

  function submit() {
    if (!form.clientName.trim()) return alert("Please enter a client name");
    if (!form.budget) return alert("Please enter a budget");
    onCreate({ ...form, budget: parseInt(form.budget) });
    setShowForm(false);
    setForm({ clientName:"", budget:"", vibes:[], notes:"", clientId:null });
  }

  return (
    <div className="projects-wrap">
      <div className="projects-header">
        <div>
          <div className="page-eyebrow">Your work</div>
          <div className="page-title">Projects</div>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ New project</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">New project</div>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-field">
                <label>Client name</label>
                <input placeholder="e.g. Tan family" value={form.clientName} onChange={e => setForm(f=>({...f,clientName:e.target.value}))} />
              </div>
              <div className="form-field">
                <label>Link to client (optional)</label>
                <ClientPicker clients={clients} value={form.clientId} onChange={id => setForm(f => ({ ...f, clientId: id }))} />
              </div>
              <div className="form-field">
                <label>Total budget (SGD)</label>
                <input type="number" placeholder="e.g. 30000" value={form.budget} onChange={e => setForm(f=>({...f,budget:e.target.value}))} />
              </div>
              <div className="form-field">
                <label>Overall vibe — pick all that apply</label>
                <div className="vibe-picker">
                  {VIBES.map(v => (
                    <button key={v} className={`vibe-pick-btn ${form.vibes.includes(v)?"selected":""}`} onClick={() => toggleVibe(v)}>{v}</button>
                  ))}
                </div>
              </div>
              <div className="form-field">
                <label>Notes (optional)</label>
                <textarea placeholder="Client preferences, constraints, inspiration..." value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} rows={3} />
              </div>
              <div className="form-hint">You'll add rooms (Living Room, Bedroom etc.) inside the project.</div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={submit}>Create project</button>
            </div>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✦</div>
          <div className="empty-title">No projects yet</div>
          <div className="empty-sub">Create a project for each client. Add rooms and furniture inside.</div>
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ New project</button>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map(p => {
            const itemCount = p.rooms.reduce((sum, r) => sum + Object.values(r.sections||{}).flat().length, 0);
            const spent = p.rooms.reduce((sum, r) => sum + Object.values(r.sections||{}).flat().reduce((s,i)=>s+i.price,0), 0);
            const linkedClient = clients.find(c => c.id === p.clientId);
            return (
              <div key={p.id} className="project-card" onClick={() => onOpen(p)}>
                <div className="project-card-top">
                  <div className="project-card-rooms">{p.rooms.length} room{p.rooms.length!==1?"s":""}</div>
                  <button className="project-delete-btn" onClick={e=>{e.stopPropagation();if(window.confirm("Delete this project?"))onDelete(p.id)}}>✕</button>
                </div>
                <div className="project-card-name">{p.clientName}</div>
                {linkedClient ? (
                  <div className="project-card-client">Client: {linkedClient.name}</div>
                ) : (
                  <div className="project-card-client unlinked" onClick={e => { e.stopPropagation(); setAssigningId(assigningId === p.id ? null : p.id); }}>
                    Unlinked
                    <button className="btn-ghost project-assign-btn" onClick={e => { e.stopPropagation(); setAssigningId(assigningId === p.id ? null : p.id); }}>Assign to client</button>
                    {assigningId === p.id && (
                      <div onClick={e => e.stopPropagation()} style={{ marginTop: 6 }}>
                        <ClientPicker
                          clients={clients}
                          value={null}
                          onChange={id => { onAssignClient(p.id, id); setAssigningId(null); }}
                        />
                      </div>
                    )}
                  </div>
                )}
                <div className="project-card-vibes">{p.vibes.slice(0,3).map(v=><span key={v} className="vibe-chip">{v}</span>)}</div>
                <div className="project-card-footer">
                  <span className="project-card-stat">{itemCount} items</span>
                  <span className="project-card-budget">${spent.toLocaleString()} <span className="budget-of">of ${p.budget.toLocaleString()}</span></span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
