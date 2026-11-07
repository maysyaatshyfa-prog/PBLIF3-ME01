import { useState } from "react";
import Sidebar from "./Sidebar";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <header className="admin-mobile-header">
        <button
          type="button"
          className="admin-hamburger"
          onClick={() => setSidebarOpen(true)}
          aria-label="Buka menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <span className="admin-mobile-title">ZAKATARA</span>
      </header>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="admin-main">
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
