// src/pages/configuracao.jsx
import { useState } from "react";

export default function Configuracao() {
  const [config, setConfig] = useState({
    limiarConfianca: 80,
    tempoEntreLeiturasSeg: 5,
    somAtivo: true,
    mensagemDisplay: "Bem-vindo!",
  });

  // Exemplo de utilizadores estáticos, só para layout
  const [utilizadores] = useState([
    { id: 1, nome: "Admin", username: "admin", perfil: "Administrador" },
  ]);

  function onChangeConfig(e) {
    const { name, value, type, checked } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function guardarConfig(e) {
    e.preventDefault();
    alert(
      "Configuração guardada apenas no frontend.\n" +
        "Quando tiveres o endpoint /api/config no backend, podemos enviar estes dados para lá."
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          Configuração
        </h2>
        <p className="text-sm text-slate-300">
          Neste momento a configuração é apenas simulada no frontend. Quando o
          backend tiver os endpoints, ligamos isto a /api/config.
        </p>
      </header>

      {/* FORM CONFIG */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={guardarConfig}
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-300">
              Limiar de confiança (%)
            </label>
            <input
              type="number"
              name="limiarConfianca"
              value={config.limiarConfianca}
              onChange={onChangeConfig}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-300">
              Tempo entre leituras (segundos)
            </label>
            <input
              type="number"
              name="tempoEntreLeiturasSeg"
              value={config.tempoEntreLeiturasSeg}
              onChange={onChangeConfig}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="somAtivo"
              type="checkbox"
              name="somAtivo"
              checked={config.somAtivo}
              onChange={onChangeConfig}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
            />
            <label
              htmlFor="somAtivo"
              className="text-sm font-medium text-slate-200"
            >
              Som ativo no dispositivo
            </label>
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs font-medium text-slate-300">
              Mensagem no display
            </label>
            <input
              name="mensagemDisplay"
              value={config.mensagemDisplay}
              onChange={onChangeConfig}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="md:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-emerald-400"
            >
              Guardar configuração (simulação)
            </button>
          </div>
        </form>
      </section>

      {/* UTILIZADORES */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">
            Utilizadores da aplicação (exemplo)
          </h3>
          <span className="text-xs text-slate-400">
            {utilizadores.length} utilizador(es)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase text-slate-400">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Username</th>
                <th className="px-3 py-2">Perfil</th>
              </tr>
            </thead>
            <tbody>
              {utilizadores.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-slate-800/80 last:border-0 hover:bg-slate-800/60"
                >
                  <td className="px-3 py-2 text-xs text-slate-400">{u.id}</td>
                  <td className="px-3 py-2">{u.nome}</td>
                  <td className="px-3 py-2 text-slate-300">{u.username}</td>
                  <td className="px-3 py-2 text-slate-200">{u.perfil}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
