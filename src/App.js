import { useState, useEffect } from "react";
import Database from "./components/Database";
import Projects from "./components/Projects";
import ProjectDetail from "./components/ProjectDetail";
import "./App.css";

export default function App() {
  const [view, setView] = useState("projects");
  const [projects, setProjects] = useState(() => {
    try { return JSON.parse(localStorage.getItem("curator-projects-v2")) || []; }
    catch { return []; }
  });
  const [activeProjectId, setActiveProjectId] = useState(null);

  useEffect(() => {
    localStorage.setItem("curator-projects-v2", JSON.stringify(projects));
  }, [projects]);

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  function createProject(data) {
    const p = { ...data, id: Date.now(), rooms: [], createdAt: new Date().toISOString() };
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
        </div>
      </header>
      <main className="app-main">
        {view==="db" && <Database />}
        {view==="projects" && <Projects projects={projects} onCreate={createProject} onOpen={openProject} onDelete={deleteProject} />}
        {view==="project" && activeProject && (
          <ProjectDetail project={activeProject} onUpdate={updateProject} onBack={() => setView("projects")} />
        )}
      </main>
    </div>
  );
}
