import { Outlet } from "react-router-dom";
import SidebarPemberi from "../components/SidebarPemberi";

function LayoutPemberi() {
  return (
    <div className="layout-pemberi">
      <SidebarPemberi />

      <main className="layout-pemberi-content">
        <Outlet />
      </main>
    </div>
  );
}

export default LayoutPemberi;
