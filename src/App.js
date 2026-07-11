import { useState } from "react";
import Database from "./components/Database";
import Moodboard from "./components/Moodboard";
import "./App.css";

export default function App() {
  const [view, setView] = useState("db");

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-brand">
            <span className="app-brand-mark">✦</span>
            <span className="app-brand-name">Curator</span>
          </div>
          <nav className="app-nav">
            <button
              className={`nav-btn ${view === "db" ? "active" : ""}`}
              onClick={() => setView("db")}
            >
              Database
            </button>
            <button
              className={`nav-btn ${view === "board" ? "active" : ""}`}
              onClick={() => setView("board")}
            >
              Moodboard
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {view === "db" ? <Database /> : <Moodboard />}
      </main>
    </div>
  );
}
