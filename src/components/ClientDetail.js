import { useState } from "react";
import { VIBES } from "../data/furniture";
import { ROOM_TYPES, PROJECT_STATUS_OPTIONS } from "../data/projects";
import {
  STATUS_OPTIONS, STATUS_STYLE, PROPERTY_TYPES, HEARD_ABOUT_OPTIONS,
  sqftToSqm, sqmToSqft, EMPTY_INTAKE, hasIntakeData,
} from "../data/clients";

function MultiPick({ options, selected, onToggle }) {
  return (
    <div className="vibe-picker">
      {options.map(o => (
        <button key={o} type="button" className={`vibe-pick-btn ${selected.includes(o) ? "selected" : ""}`} onClick={() => onToggle(o)}>{o}</button>
      ))}
    </div>
  );
}

// Rooms the curator is scoped to furnish, each with a quantity and its own budget slice.
function RoomAllocationPicker({ rooms, budgetPerRoom, totalBudget, onChangeQty, onChangeBudget }) {
  const selected = ROOM_TYPES.filter(r => (rooms[r] || 0) > 0);
  const unselected = ROOM_TYPES.filter(r => !(rooms[r] > 0));
  const allocated = Object.values(budgetPerRoom).reduce((s, v) => s + (Number(v) || 0), 0);

  return (
    <div>
      {selected.length > 0 && (
        <div className="room-allocation">
          {selected.map(r => (
            <div key={r} className="room-allocation-row">
              <span className="room-allocation-name">{r}</span>
              <div className="qty-stepper">
                <button type="button" onClick={() => onChangeQty(r, rooms[r] - 1)}>−</button>
                <span>{rooms[r]}</span>
                <button type="button" onClick={() => onChangeQty(r, rooms[r] + 1)}>+</button>
              </div>
              <div className="room-budget-input">
                <span>$</span>
                <input type="number" min="0" value={budgetPerRoom[r] || ""} onChange={e => onChangeBudget(r, e.target.value)} placeholder="0" />
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="vibe-picker" style={{ marginTop: selected.length ? 8 : 0 }}>
        {unselected.map(r => (
          <button key={r} type="button" className="vibe-pick-btn" onClick={() => onChangeQty(r, 1)}>+ {r}</button>
        ))}
      </div>
      {selected.length > 0 && (
        <div className="form-hint" style={{ marginTop: 8 }}>
          Allocated: ${allocated.toLocaleString()} of ${(Number(totalBudget) || 0).toLocaleString()} total budget
        </div>
      )}
    </div>
  );
}

function fieldsFromClient(client) {
  return {
    whatsapp: client.whatsapp || "", email: client.email || "", howHeard: client.howHeard || "",
    propertyType: client.propertyType || PROPERTY_TYPES[0], address: client.address || "",
    sizeSqft: client.sizeSqft || "", sizeSqm: client.sizeSqm || "",
  };
}

function OverviewTab({ client, onSave }) {
  const [form, setForm] = useState(() => fieldsFromClient(client));
  const dirty = JSON.stringify(form) !== JSON.stringify(fieldsFromClient(client));
  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  function setSqft(e) {
    const v = e.target.value;
    setForm(f => ({ ...f, sizeSqft: v, sizeSqm: sqftToSqm(v) }));
  }
  function setSqm(e) {
    const v = e.target.value;
    setForm(f => ({ ...f, sizeSqm: v, sizeSqft: sqmToSqft(v) }));
  }

  return (
    <div className="client-tab-panel">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="form-field">
          <label>WhatsApp</label>
          <input value={form.whatsapp} onChange={set("whatsapp")} placeholder="+65 9xxx xxxx" />
        </div>
        <div className="form-field">
          <label>Email</label>
          <input value={form.email} onChange={set("email")} placeholder="name@email.com" />
        </div>
      </div>
      <div className="form-field">
        <label>How they heard about you</label>
        <input list="heard-options" value={form.howHeard} onChange={set("howHeard")} placeholder="Instagram, referral…" />
        <datalist id="heard-options">{HEARD_ABOUT_OPTIONS.map(o => <option key={o} value={o} />)}</datalist>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="form-field">
          <label>Property type</label>
          <select value={form.propertyType} onChange={set("propertyType")}>
            {PROPERTY_TYPES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>Address</label>
          <input value={form.address} onChange={set("address")} placeholder="Unit / street" />
        </div>
      </div>
      <div className="form-field">
        <label>Property size</label>
        <div className="property-area-row">
          <input type="number" min="0" value={form.sizeSqft} onChange={setSqft} placeholder="e.g. 1200" />
          <span className="property-area-converted">sqft</span>
          <input type="number" min="0" value={form.sizeSqm} onChange={setSqm} placeholder="e.g. 111.5" />
          <span className="property-area-converted">sqm</span>
        </div>
      </div>
      <div className="modal-footer" style={{ padding: "16px 0 0", borderTop: "none" }}>
        <button className="btn-primary" disabled={!dirty} onClick={() => onSave({ ...client, ...form })}>Save changes</button>
      </div>
    </div>
  );
}

function IntakeTab({ client, onSave }) {
  const [form, setForm] = useState({ ...EMPTY_INTAKE, ...(client.intake || {}) });

  function handleRoomQty(room, qty) {
    setForm(f => {
      const rooms = { ...f.rooms };
      const budgetPerRoom = { ...f.budgetPerRoom };
      if (qty <= 0) { delete rooms[room]; delete budgetPerRoom[room]; }
      else rooms[room] = qty;
      return { ...f, rooms, budgetPerRoom };
    });
  }
  function handleRoomBudget(room, value) {
    setForm(f => ({ ...f, budgetPerRoom: { ...f.budgetPerRoom, [room]: value } }));
  }
  function toggleVibe(v) {
    setForm(f => ({ ...f, vibes: f.vibes.includes(v) ? f.vibes.filter(x => x !== v) : [...f.vibes, v] }));
  }
  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, floorPlan: reader.result }));
    reader.readAsDataURL(file);
  }
  function save() {
    onSave({ ...client, intake: { ...form, budget: Number(form.budget) || 0 } });
  }

  return (
    <div className="client-tab-panel">
      <div className="form-hint" style={{ marginBottom: 12 }}>
        {hasIntakeData(form) ? "Intake in progress — save anytime, fields can stay partial." : "No intake info yet — fill in what you have and save as a draft."}
      </div>
      <div className="form-field">
        <label>Total budget (SGD)</label>
        <input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} placeholder="e.g. 30000" />
      </div>
      <div className="form-field">
        <label>Rooms to furnish — click to add, then step up the quantity</label>
        <RoomAllocationPicker
          rooms={form.rooms}
          budgetPerRoom={form.budgetPerRoom}
          totalBudget={form.budget}
          onChangeQty={handleRoomQty}
          onChangeBudget={handleRoomBudget}
        />
      </div>
      <div className="form-field">
        <label>Vibes</label>
        <MultiPick options={VIBES} selected={form.vibes} onToggle={toggleVibe} />
      </div>
      <div className="form-field">
        <label>Notes</label>
        <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Preferences, constraints, inspiration…" />
      </div>
      <div className="form-field">
        <label>Floor plan (optional)</label>
        <input type="file" accept="image/*" onChange={handleFile} />
        {form.floorPlan && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
            <img src={form.floorPlan} alt="Floor plan preview" style={{ width: 64, height: 48, objectFit: "cover", borderRadius: 6, border: "1px solid #E0DAD0" }} />
            <button type="button" className="btn-ghost" style={{ padding: "4px 10px" }} onClick={() => setForm(f => ({ ...f, floorPlan: "" }))}>Remove</button>
          </div>
        )}
      </div>
      <div className="modal-footer" style={{ padding: "16px 0 0", borderTop: "none" }}>
        <button className="btn-primary" onClick={save}>Save intake</button>
      </div>
    </div>
  );
}

function ProjectsTab({ client, projects, onOpenProject, onUpdateProjectStatus, onCreateProject }) {
  const linked = projects.filter(p => p.clientId === client.id);

  return (
    <div className="client-tab-panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div className="form-hint">{linked.length} linked project{linked.length !== 1 ? "s" : ""}</div>
        <button className="btn-primary" onClick={onCreateProject}>+ Create project</button>
      </div>
      {linked.length === 0 ? (
        <div className="empty-state" style={{ padding: "32px 20px" }}>
          <div className="empty-sub">No projects linked yet.</div>
        </div>
      ) : (
        <div className="client-project-list">
          {linked.map(p => {
            const roomLabel = p.rooms.length ? p.rooms.map(r => r.type).join(", ") : "No rooms yet";
            return (
              <div key={p.id} className="client-project-row">
                <div className="client-project-name">{p.clientName}</div>
                <div className="client-project-rooms">{roomLabel}</div>
                <div className="client-project-budget">${(p.budget || 0).toLocaleString()}</div>
                <select value={p.status || "Planning"} onChange={e => onUpdateProjectStatus(p.id, e.target.value)}>
                  {PROJECT_STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
                <button className="btn-ghost" onClick={() => onOpenProject(p)}>Open</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ClientDetail({ client, projects, onUpdate, onDelete, onBack, onOpenProject, onUpdateProject, onCreateProjectForClient }) {
  const [tab, setTab] = useState("overview");
  const isUrgent = client.status === "Urgent";

  return (
    <div className="leads-wrap">
      <div className="leads-header">
        <div>
          <div className="page-eyebrow" onClick={onBack} style={{ cursor: "pointer" }}>‹ All clients</div>
          <div className="page-title" style={isUrgent ? { color: "#8B1A1A" } : undefined}>{client.name}</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select className="lead-status-select" style={{ width: "auto" }} value={client.status} onChange={e => onUpdate({ ...client, status: e.target.value })}>
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
          <button className="lead-delete-btn" onClick={() => { if (window.confirm(`Delete client "${client.name}"? This can't be undone.`)) onDelete(client.id); }}>✕</button>
        </div>
      </div>

      <div className="client-tabs">
        <button className={`client-tab-btn ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>Overview</button>
        <button className={`client-tab-btn ${tab === "intake" ? "active" : ""}`} onClick={() => setTab("intake")}>Intake form</button>
        <button className={`client-tab-btn ${tab === "projects" ? "active" : ""}`} onClick={() => setTab("projects")}>Projects</button>
      </div>

      {tab === "overview" && <OverviewTab client={client} onSave={onUpdate} />}
      {tab === "intake" && <IntakeTab client={client} onSave={onUpdate} />}
      {tab === "projects" && (
        <ProjectsTab
          client={client}
          projects={projects}
          onOpenProject={onOpenProject}
          onUpdateProjectStatus={(id, status) => onUpdateProject({ ...projects.find(p => p.id === id), status })}
          onCreateProject={() => onCreateProjectForClient(client)}
        />
      )}
    </div>
  );
}
