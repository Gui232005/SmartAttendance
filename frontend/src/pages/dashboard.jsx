// src/pages/dashboard.jsx
import { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
  const [eventos, setEventos] = useState([]);
  const [estadoDispositivo, setEstadoDispositivo] = useState("A carregar...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        // /api/eventos já traz o Funcionario incluído (pelo controller)
        const res = await api.get("/api/eventos");
        setEventos(res.data || []);
        setEstadoDispositivo("Online");
      } catch (e) {
        console.error("Erro ao carregar eventos:", e);
        setEstadoDispositivo("Erro ao ligar ao backend.");
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-slate-300">
          Resumo rápido do estado do sistema e dos últimos eventos registados.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {/* Estado do dispositivo */}
        <div className="col-span-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
            Estado do dispositivo
          </p>
          <p className="text-lg font-semibold">
            {loading ? "A carregar..." : estadoDispositivo}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Informação com base na resposta do endpoint{" "}
            <code>/api/eventos</code>.
          </p>
        </div>

        {/* Últimos eventos */}
        <div className="col-span-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
            Últimos eventos
          </p>

          {eventos.length === 0 ? (
            <p className="text-sm text-slate-300">
              Ainda não há eventos registados.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {eventos.slice(0, 8).map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between rounded-lg bg-slate-800/70 px-3 py-2"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {e.Funcionario?.nome ||
                        `Funcionario ID ${e.funcionario_id || "—"}`}
                    </span>
                    <span className="text-xs text-slate-400">
                      {e.instante
                        ? new Date(e.instante).toLocaleString()
                        : "sem data"}{" "}
                      • {e.tipo}
                    </span>
                  </div>
                  <div className="text-xs text-emerald-400 text-right">
                    {e.conf != null ? `Conf. ${e.conf}%` : "Conf. N/A"}
                    <br />
                    {e.revisto ? "✔ Revisto" : "❌ Por rever"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
