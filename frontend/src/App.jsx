// src/App.jsx
import { Link, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import Funcionarios from "./pages/funcionarios";
import Registos from "./pages/registos";
import Configuracao from "./pages/configuracao";

const navItems = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/funcionarios", label: "Funcionários" },
  { path: "/registos", label: "Registos" },
  { path: "/configuracao", label: "Configuração" },
];

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur border-b border-slate-800 shadow-sm">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-2 no-underline hover:no-underline"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-400 text-slate-900 font-extrabold shadow-lg transition-transform hover:scale-110">
              SA
            </span>
            <span className="text-lg font-semibold tracking-tight hover:text-emerald-400 transition-colors">
              Smart Attendance
            </span>
          </Link>

          {/* NAV LINKS */}
          <div className="flex gap-5 text-sm font-medium">
            {navItems.map((item) => {
              const active = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={[
                    "no-underline px-3 py-1 rounded-md transition-colors duration-200",
                    active
                      ? "text-emerald-400 bg-slate-800/60"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/40",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* CONTEÚDO */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/funcionarios" element={<Funcionarios />} />
          <Route path="/registos" element={<Registos />} />
          <Route path="/configuracao" element={<Configuracao />} />
        </Routes>
      </main>
    </div>
  );
}
