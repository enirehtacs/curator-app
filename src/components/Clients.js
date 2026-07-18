import { useState, useMemo } from "react";
import { STATUS_OPTIONS, STATUS_STYLE } from "../data/clients";

function Pill({ label, style }) {
  return <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap", ...style }}>{label}</span>;
}

function formatDate(str) {
  if (!str) return "";
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" });
}

function NewClientModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: "", whatsapp: "", email: "", status: STATUS_OPTIONS[0] });
  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  function submit() {
    if (!form.name.trim()) return alert("Please enter a name");
    onSave({
      ...form,
      id: `CLIENT-${Date.now().toString(36).toUpperCase()}`,
      date: new Date().toISOString().slice(0, 10),
      howHeard: "", propertyType: "HDB", address: "", sizeSqft: "", sizeSqm: "",
      intake: { rooms: {}, budgetPerRoom: {}, budget: "", vibes: [], floorPlan: "", notes: "" },
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">New client</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-field">
            <label>Name</label>
            <input value={form.name} onChange={set("name")} placeholder="e.g. Tan family" autoFocus />
          </div>
          <div className="form-field">
            <label>WhatsApp</label>
            <input value={form.whatsapp} onChange={set("whatsapp")} placeholder="+65 9xxx xxxx" />
          </div>
          <div className="form-field">
            <label>Email</label>
            <input value={form.email} onChange={set("email")} placeholder="name@email.com" />
          </div>
          <div className="form-field">
            <label>Status</label>
            <select value={form.status} onChange={set("status")}>
              {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-hint">You'll fill in the full intake form (property details, rooms, budget, vibes) inside the client record.</div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit}>Add client</button>
        </div>
      </div>
    </div>
  );
}

function ClientCard({ client, selected, onToggleSelect, onStatusChange, onOpen, onDelete }) {
  const isUrgent = client.status === "Urgent";
  const sizeStr = [client.sizeSqft && `${client.sizeSqft} sqft`, client.sizeSqm && `${client.sizeSqm} sqm`].filter(Boolean).join(" / ");
  const contact = [client.whatsapp, client.email].filter(Boolean).join(" · ");

  return (
    <div className={`lead-card ${isUrgent ? "urgent" : ""}`} onClick={() => onOpen(client)} style={{ cursor: "pointer" }}>
      <div className="lead-card-top" onClick={e => e.stopPropagation()}>
        <input type="checkbox" checked={selected} onChange={() => onToggleSelect(client.id)} />
        <Pill label={client.status} style={STATUS_STYLE[client.status]} />
      </div>

      <div className={`lead-name ${isUrgent ? "urgent-text" : ""}`}>{client.name}</div>
      {contact && <div className="lead-sub">{contact}</div>}
      <div className="lead-sub">{formatDate(client.date)}</div>
      <div className="lead-sub">{client.propertyType}{sizeStr ? ` · ${sizeStr}` : ""}</div>
      {client.address && <div className="lead-sub">{client.address}</div>}

      <div className="lead-card-footer" onClick={e => e.stopPropagation()}>
        <select className="lead-status-select" value={client.status} onChange={e => onStatusChange(client.id, e.target.value)}>
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
        <div className="lead-card-actions">
          <button className="btn-ghost" onClick={() => onOpen(client)}>Open record</button>
          <button className="lead-delete-btn" onClick={() => { if (window.confirm(`Delete client "${client.name}"?`)) onDelete(client.id); }}>✕</button>
        </div>
      </div>
    </div>
  );
}

export default function Clients({ clients, onAdd, onUpdate, onDelete, onBulkUpdateStatus, onBulkDelete, onOpen }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [selected, setSelected] = useState(() => new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [bulkStatus, setBulkStatus] = useState(STATUS_OPTIONS[0]);

  const filtered = useMemo(() => clients.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || (c.whatsapp || "").toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchStatus;
  }), [clients, search, statusFilter]);

  const sorted = useMemo(() => {
    const cmp = (a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "budget") return (b.intake?.budget || 0) - (a.intake?.budget || 0);
      if (sortBy === "status") return STATUS_OPTIONS.indexOf(a.status) - STATUS_OPTIONS.indexOf(b.status);
      return new Date(b.date) - new Date(a.date);
    };
    const urgent = filtered.filter(c => c.status === "Urgent").sort(cmp);
    const rest = filtered.filter(c => c.status !== "Urgent").sort(cmp);
    return [...urgent, ...rest];
  }, [filtered, sortBy]);

  const allVisibleSelected = sorted.length > 0 && sorted.every(c => selected.has(c.id));

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected(prev => {
      if (allVisibleSelected) return new Set();
      return new Set(sorted.map(c => c.id));
    });
  }

  function handleSave(client) {
    onAdd(client);
    setShowAddModal(false);
  }

  function handleBulkDelete() {
    if (!window.confirm(`Delete ${selected.size} client${selected.size !== 1 ? "s" : ""}? This can't be undone.`)) return;
    onBulkDelete([...selected]);
    setSelected(new Set());
  }

  function handleBulkStatus(status) {
    setBulkStatus(status);
    onBulkUpdateStatus([...selected], status);
  }

  return (
    <div className="leads-wrap">
      <div className="leads-header">
        <div>
          <div className="page-eyebrow">Your pipeline</div>
          <div className="page-title">Clients</div>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>+ New client</button>
      </div>

      <div className="db-toolbar">
        <div className="db-search-wrap">
          <span className="db-search-icon">⌕</span>
          <input className="db-search" placeholder="Search by name, WhatsApp or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="db-filters">
          <label className="leads-select-all">
            <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll} />
            Select all
          </label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="date">Sort by date</option>
            <option value="name">Sort by name</option>
            <option value="budget">Sort by budget</option>
            <option value="status">Sort by status</option>
          </select>
        </div>
        <div className="db-count">{sorted.length} client{sorted.length !== 1 ? "s" : ""}</div>
      </div>

      {showAddModal && (
        <NewClientModal onClose={() => setShowAddModal(false)} onSave={handleSave} />
      )}

      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✦</div>
          <div className="empty-title">No clients yet</div>
          <div className="empty-sub">New enquiries show up here first — add one to get started.</div>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>+ New client</button>
        </div>
      ) : (
        <div className="lead-grid">
          {sorted.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              selected={selected.has(client.id)}
              onToggleSelect={toggleSelect}
              onStatusChange={(id, status) => onUpdate({ ...clients.find(c => c.id === id), status })}
              onOpen={onOpen}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      <div className={`leads-bulk-bar ${selected.size > 0 ? "visible" : ""}`}>
        <span className="leads-bulk-count">{selected.size} selected</span>
        <select value={bulkStatus} onChange={e => handleBulkStatus(e.target.value)}>
          <option value="" disabled>Set status…</option>
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
        <button className="btn-ghost" onClick={handleBulkDelete}>Delete selected</button>
        <button className="btn-ghost" onClick={() => setSelected(new Set())}>Clear</button>
      </div>
    </div>
  );
}
