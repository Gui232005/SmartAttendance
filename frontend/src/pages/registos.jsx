// src/pages/registos.jsx
import { useEffect, useState } from "react";
import api from "../api";

export default function Registos() {
  const [registos, setRegistos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [filtros, setFiltros] = useState({
    dataDe: "",
    dataAte: "",
    tipo: "",
    funcionarioId: "",
  });

  useEffect(() => {
    carregarFuncionarios();
    carregarRegistos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function carregarFuncionarios() {
    try {
      const res = await api.get("/api/funcionarios");
      setFuncionarios(res.data);
    } catch (e) {
      console.error(e);
    }
  }

  async function carregarRegistos() {
    try {
      const res = await api.get("/api/registos", { params: filtros });
      setRegistos(res.data);
    } catch (e) {
      console.error(e);
    }
  }

  function onChangeFiltro(e) {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  }

  function exportarCsv() {
    const params = new URLSearchParams(filtros).toString();
    window.open(`/api/registos/export?${params}`, "_blank");
  }

  async function marcarRevisto(id) {
    try {
      const res = await api.put(`/api/registos/${id}`, { revisto: true });
      setRegistos((prev) => prev.map((r) => (r.id === id ? res.data : r)));
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Registos</h2>
        <p className="text-sm text-slate-300">
          Consulta e revisão dos eventos de presença, com filtros avançados e
          exportação para CSV.
        </p>
      </header>

      {/* FILTROS */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-300">
              Data de
            </label>
            <input
              type="date"
              name="dataDe"
              value={filtros.dataDe}
              onChange={onChangeFiltro}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-300">
              Data até
            </label>
            <input
              type="date"
              name="dataAte"
              value={filtros.dataAte}
              onChange={onChangeFiltro}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-300">Tipo</label>
            <select
              name="tipo"
              value={filtros.tipo}
              onChange={onChangeFiltro}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Todos</option>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-300">
              Funcionário
            </label>
            <select
              name="funcionarioId"
              value={filtros.funcionarioId}
              onChange={onChangeFiltro}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Todos</option>
              {funcionarios.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex gap-2">
            <button
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-emerald-400"
              onClick={carregarRegistos}
            >
              Filtrar
            </button>
            <button
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
              onClick={exportarCsv}
            >
              Exportar CSV
            </button>
          </div>
        </div>
      </section>

      {/* TABELA */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">
            Registos encontrados
          </h3>
          <span className="text-xs text-slate-400">
            {registos.length} registo(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase text-slate-400">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Data / Hora</th>
                <th className="px-3 py-2">Funcionário</th>
                <th className="px-3 py-2">Tipo</th>
                <th className="px-3 py-2">Confiança</th>
                <th className="px-3 py-2">Revisto</th>
                <th className="px-3 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {registos.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-slate-800/80 last:border-0 hover:bg-slate-800/60"
                >
                  <td className="px-3 py-2 text-xs text-slate-400">{r.id}</td>
                  <td className="px-3 py-2">
                    {new Date(r.dataHora).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">{r.funcionarioNome}</td>
                  <td className="px-3 py-2 capitalize">{r.tipo}</td>
                  <td className="px-3 py-2">
                    {r.confianca != null ? `${r.confianca}%` : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {r.revisto ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300">
                        ✔ Revisto
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-700/60 px-2 py-0.5 text-xs font-medium text-slate-200">
                        Pend.
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {!r.revisto && (
                      <button
                        className="rounded-full border border-emerald-500/60 px-3 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/10"
                        onClick={() => marcarRevisto(r.id)}
                      >
                        Marcar revisto
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {registos.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-6 text-center text-sm text-slate-400"
                  >
                    Sem registos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
