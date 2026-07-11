import { useState } from "react";
import { VIBES } from "../data/furniture";

export default function Projects({ projects, onCreate, onOpen, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ clientName:"", budget:"", vibes:[], notes:"" });

  function toggleVibe(v) {
    setForm(f => ({ ...f, vibes: f.vibes.includes(v) ? f.vibes.filter(x=>x!==v) : [...f.vibes, v] }));
  }

  function submit() {
    if (!form.clientName.trim()) return alert("Please enter a client name");
    if (!form.budget) return alert("Please enter a budget");
    onCreate({ ...form, budget: parseInt(form.budget) });
    setShowForm(false);
    setForm({ clientName:"", budget:"", vibes:[], notes:"" });
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
            return (
              <div key={p.id} className="project-card" onClick={() => onOpen(p)}>
                <div className="project-card-top">
                  <div className="project-card-rooms">{p.rooms.length} room{p.rooms.length!==1?"s":""}</div>
                  <button className="project-delete-btn" onClick={e=>{e.stopPropagation();if(window.confirm("Delete this project?"))onDelete(p.id)}}>✕</button>
                </div>
                <div className="project-card-name">{p.clientName}</div>
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
