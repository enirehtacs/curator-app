import { useState, useEffect } from "react";
import Database from "./components/Database";
import Projects from "./components/Projects";
import ProjectDetail from "./components/ProjectDetail";
import Clients from "./components/Clients";
import ClientDetail from "./components/ClientDetail";
import "./App.css";

export default function App() {
  const [view, setView] = useState("projects");
  const [projects, setProjects] = useState(() => {
    try { return JSON.parse(localStorage.getItem("curator-projects-v2")) || []; }
    catch { return []; }
  });
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [clients, setClients] = useState(() => {
    try { return JSON.parse(localStorage.getItem("curator-clients-v1")) || []; }
    catch { return []; }
  });
  const [activeClientId, setActiveClientId] = useState(null);

  useEffect(() => {
    localStorage.setItem("curator-projects-v2", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("curator-clients-v1", JSON.stringify(clients));
  }, [clients]);

  const activeProject = projects.find(p => p.id === activeProjectId) || null;
  const activeClient = clients.find(c => c.id === activeClientId) || null;

  function createProject(data) {
    const p = { ...data, id: Date.now(), rooms: [], status: data.status || "Planning", createdAt: new Date().toISOString() };
    setProjects(prev => [p, ...prev]);
    setActiveProjectId(p.id);
    setView("project");
  }

  function updateProject(updated) {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  }

  function deleteProject(id) {
    setProjects(prev => prev.filter(p => p.id !== id));
    setActiveProjectId(null);
    setView("projects");
  }

  function openProject(p) {
    setActiveProjectId(p.id);
    setActiveClientId(null);
    setView("project");
  }

  function assignProjectToClient(projectId, clientId) {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, clientId } : p));
  }

  function addClient(client) {
    setClients(prev => [{ ...client, createdAt: new Date().toISOString() }, ...prev]);
  }

  function updateClient(updated) {
    setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
  }

  function deleteClient(id) {
    setClients(prev => prev.filter(c => c.id !== id));
    setActiveClientId(null);
    setView("clients");
  }

  function bulkUpdateClientStatus(ids, status) {
    setClients(prev => prev.map(c => ids.includes(c.id) ? { ...c, status } : c));
  }

  function bulkDeleteClients(ids) {
    setClients(prev => prev.filter(c => !ids.includes(c.id)));
  }

  function openClient(client) {
    setActiveClientId(client.id);
    setView("client");
  }

  function createProjectForClient(client) {
    const intake = client.intake || {};
    const p = {
      id: Date.now(),
      clientId: client.id,
      clientName: client.name,
      budget: intake.budget || 0,
      vibes: intake.vibes || [],
      notes: "",
      status: "Planning",
      rooms: Object.keys(intake.rooms || {}).map((type, i) => ({ id: Date.now() + i, type, sections: {} })),
      createdAt: new Date().toISOString(),
    };
    setProjects(prev => [p, ...prev]);
    if (client.status === "Lead") {
      setClients(prev => prev.map(c => c.id === client.id ? { ...c, status: "Converted" } : c));
    }
    setActiveProjectId(p.id);
    setActiveClientId(null);
    setView("project");
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-brand" onClick={() => setView(activeProject ? "project" : "projects")} style={{cursor:"pointer"}}>
            <span className="app-brand-mark">✦</span>
            <span className="app-brand-name">Curator</span>
          </div>
          <nav className="app-nav">
            <button className={`nav-btn ${(view==="clients"||view==="client")?"active":""}`}
              onClick={() => setView(activeClient?"client":"clients")}>Clients</button>
            <button className={`nav-btn ${(view==="projects"||view==="project")?"active":""}`}
              onClick={() => setView(activeProject?"project":"projects")}>Projects</button>
            <button className={`nav-btn ${view==="db"?"active":""}`} onClick={() => setView("db")}>Database</button>
          </nav>
          {view==="project" && activeProject && (
            <div className="header-breadcrumb">
              <span className="breadcrumb-sep" onClick={() => setView("projects")}>All projects</span>
              <span className="breadcrumb-arrow">›</span>
              <span className="breadcrumb-current">{activeProject.clientName}</span>
            </div>
          )}
          {view==="client" && activeClient && (
            <div className="header-breadcrumb">
              <span className="breadcrumb-sep" onClick={() => setView("clients")}>All clients</span>
              <span className="breadcrumb-arrow">›</span>
              <span className="breadcrumb-current">{activeClient.name}</span>
            </div>
          )}
        </div>
      </header>
      <main className="app-main">
        {view==="db" && <Database />}
        {view==="clients" && (
          <Clients
            clients={clients}
            onAdd={addClient}
            onUpdate={updateClient}
            onDelete={deleteClient}
            onBulkUpdateStatus={bulkUpdateClientStatus}
            onBulkDelete={bulkDeleteClients}
            onOpen={openClient}
          />
        )}
        {view==="client" && activeClient && (
          <ClientDetail
            client={activeClient}
            projects={projects}
            onUpdate={updateClient}
            onDelete={deleteClient}
            onBack={() => setView("clients")}
            onOpenProject={openProject}
            onUpdateProject={updateProject}
            onCreateProjectForClient={createProjectForClient}
          />
        )}
        {view==="projects" && (
          <Projects
            projects={projects}
            clients={clients}
            onCreate={createProject}
            onOpen={openProject}
            onDelete={deleteProject}
            onAssignClient={assignProjectToClient}
          />
        )}
        {view==="project" && activeProject && (
          <ProjectDetail project={activeProject} onUpdate={updateProject} onBack={() => setView("projects")} />
        )}
      </main>
    </div>
  );
}
