// src/pages/home.jsx
import { Link } from "react-router-dom";

const tiles = [
  {
    path: "/dashboard",
    title: "Dashboard",
    desc: "Vê os últimos eventos e o estado em tempo real do dispositivo.",
    badge: "Visão geral",
    color: "from-emerald-500/20 to-emerald-500/0",
  },
  {
    path: "/funcionarios",
    title: "Funcionários",
    desc: "Gerir lista, criar/editar e fazer enrolamento com câmara.",
    badge: "Gestão",
    color: "from-sky-500/20 to-sky-500/0",
  },
  {
    path: "/registos",
    title: "Registos",
    desc: "Consultar presenças, filtrar por data/tipo e exportar CSV.",
    badge: "Histórico",
    color: "from-violet-500/20 to-violet-500/0",
  },
  {
    path: "/configuracao",
    title: "Configuração",
    desc: "Ajustar limites de confiança, tempos, som e utilizadores da app.",
    badge: "Admin",
    color: "from-amber-500/20 to-amber-500/0",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-10 py-6 md:py-10">
      {/* HERO */}
      <section className="text-center space-y-4">
        <p className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 mb-1">
          Projeto SE • Prova de Conceito
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Smart Attendance
        </h1>
        <p className="max-w-2xl mx-auto text-slate-300 text-sm md:text-base">
          Plataforma web para gerir presença por reconhecimento facial:
          funcionários, registos, estado do dispositivo e toda a configuração
          necessária – pronta para ligar ao backend.
        </p>
      </section>

      {/* TILES */}
      <section className="grid gap-6 md:grid-cols-2">
        {tiles.map((tile) => (
          <Link
            key={tile.path}
            to={tile.path}
            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm transition hover:border-emerald-400/60 hover:shadow-emerald-500/20 no-underline"
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tile.color} opacity-0 transition-opacity group-hover:opacity-100`}
            />
            <div className="relative flex flex-col h-full gap-3">
              <span className="inline-flex w-fit rounded-full bg-slate-800/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                {tile.badge}
              </span>
              <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
                {tile.title}
                <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-transform group-hover:translate-x-1 text-sm">
                  →
                </span>
              </h2>
              <p className="text-sm text-slate-300 flex-1">{tile.desc}</p>
              <span className="mt-1 text-xs font-medium text-emerald-400 group-hover:text-emerald-300">
                Abrir {tile.title}
              </span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
