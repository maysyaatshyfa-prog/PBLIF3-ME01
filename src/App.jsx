import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import MustahiqPage from "./pages/MustahiqPage";
import AsnafPage from "./pages/AsnafPage";
import KriteriaPage from "./pages/KriteriaPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/mustahiq" element={<MustahiqPage />} />
        <Route path="/asnaf" element={<AsnafPage />} />
        <Route path="/kriteria" element={<KriteriaPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;