// src/pages/registos.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [evRes, fRes] = await Promise.all([
        api.get("/api/eventos"),
        api.get("/api/funcionarios"),
      ]);
      setRegistos(evRes.data || []);
      setFuncionarios(fRes.data || []);
    } catch (e) {
      console.error("Erro ao carregar registos:", e);
    }
  }

  function onChangeFiltro(e) {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  }

  const mapaNome = useMemo(
    () => Object.fromEntries(funcionarios.map((f) => [f.id, f.nome])),
    [funcionarios]
  );

  // Filtros aplicados no cliente
  const registosFiltrados = useMemo(() => {
    return registos.filter((r) => {
      const data = r.instante ? new Date(r.instante) : null;

      if (data && filtros.dataDe) {
        const dDe = new Date(filtros.dataDe);
        if (data < dDe) return false;
      }
      if (data && filtros.dataAte) {
        const dAte = new Date(filtros.dataAte);
        dAte.setHours(23, 59, 59, 999);
        if (data > dAte) return false;
      }

      if (filtros.tipo && r.tipo !== filtros.tipo) return false;

      if (
        filtros.funcionarioId &&
        String(r.funcionario_id) !== String(filtros.funcionarioId)
      )
        return false;

      return true;
    });
  }, [registos, filtros]);

  function exportarDados(formato = "csv") {
    const dados = registosFiltrados.map((r) => ({
      ID: r.id,
      "Data / Hora": r.instante ? new Date(r.instante).toLocaleString() : "",
      Funcionário:
        r.Funcionario?.nome ||
        mapaNome[r.funcionario_id] ||
        `ID ${r.funcionario_id}`,
      Tipo: r.tipo,
      Confiança: r.conf ?? "",
      Revisto: r.revisto ? "✔" : "Pend.",
      Origem: r.origem ?? "",
      Observações: r.observacoes ?? "",
    }));

    if (dados.length === 0) {
      alert("Não há registos para exportar!");
      return;
    }

    if (formato === "csv") {
      // === CSV (com BOM UTF-8 para suportar acentuação no Excel) ===
      const header = Object.keys(dados[0]).join(";");
      const linhas = dados.map((obj) =>
        Object.values(obj)
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(";")
      );
      const csv = "\uFEFF" + header + "\n" + linhas.join("\n"); // BOM UTF-8
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "registos.csv");
    } else if (formato === "xlsx") {
      // === XLSX ===
      const ws = XLSX.utils.json_to_sheet(dados);

      // Define largura das colunas (ajuste automático)
      const colWidths = Object.keys(dados[0]).map(() => ({ wch: 20 }));
      ws["!cols"] = colWidths;

      // Centrar texto (horizontal + vertical)
      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[cellRef]) continue;
          if (!ws[cellRef].s) ws[cellRef].s = {};
          ws[cellRef].s.alignment = {
            horizontal: "center",
            vertical: "center",
            wrapText: true,
          };
        }
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Registos");

      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "registos.xlsx");
    }
  }

  // agora atualiza mesmo no backend
  async function marcarRevisto(id) {
    try {
      const res = await api.put(`/api/eventos/${id}`, { revisto: true });
      const atualizado = res.data;
      setRegistos((prev) => prev.map((r) => (r.id === id ? atualizado : r)));
    } catch (e) {
      console.error("Erro ao marcar revisto:", e);
      alert("Erro ao marcar registo como revisto.");
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Registos</h2>
        <p className="text-sm text-slate-300">
          Tabela baseada no modelo <code>Evento</code> do backend, com filtros e
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
              <option value="ENTRADA">ENTRADA</option>
              <option value="SAIDA">SAÍDA</option>
              <option value="ALMOCO_IN">ALMOCO_IN</option>
              <option value="ALMOCO_OUT">ALMOCO_OUT</option>
              <option value="CORRECAO">CORREÇÃO</option>
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
          <span className="text-xs text-slate-400">
          </span>

          <div className="flex gap-2 ml-auto">
            <button
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
              onClick={() => exportarDados("csv")}
            >
              Exportar CSV
            </button>
            <button
              className="rounded-lg border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-600/20"
              onClick={() => exportarDados("xlsx")}
            >
              Exportar Excel <span className="text-xs text-emerald-400"></span>
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
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase text-slate-400">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Data / Hora</th>
                <th className="px-3 py-2">Funcionário</th>
                <th className="px-3 py-2">Tipo</th>
                <th className="px-3 py-2">Observações</th>
                <th className="px-3 py-2">Revisto</th>
                <th className="px-3 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {registosFiltrados.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-slate-800/80 last:border-0 hover:bg-slate-800/60"
                >
                  <td className="px-3 py-2 text-xs text-slate-400">{r.id}</td>
                  <td className="px-3 py-2">
                    {r.instante ? new Date(r.instante).toLocaleString() : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {r.Funcionario?.nome ||
                      mapaNome[r.funcionario_id] ||
                      `ID ${r.funcionario_id}`}
                  </td>
                  <td className="px-3 py-2">{r.tipo}</td>
                  <td className="px-3 py-2">
                    {r.conf != null ? `${r.conf}%` : "—"}
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
              {registosFiltrados.length === 0 && (
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
