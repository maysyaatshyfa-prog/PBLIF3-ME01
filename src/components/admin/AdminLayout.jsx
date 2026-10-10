import Sidebar from "./Sidebar";

export default function AdminLayout({ children }) {
return ( <div className="admin-layout">
  <Sidebar />

  <main className="admin-main">
    <div className="admin-content">
      {children}
    </div>
  </main>
</div>

);
}
