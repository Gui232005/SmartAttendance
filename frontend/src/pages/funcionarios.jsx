// src/pages/funcionarios.jsx
import { useEffect, useRef, useState } from "react";
import api from "../api";

export default function Funcionarios() {
  const [funcs, setFuncs] = useState([]);
  const [status, setStatus] = useState("A carregar...");

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [idEdicao, setIdEdicao] = useState(null);

  // câmera (ainda sem envio para backend)
  const [idEnrolamento, setIdEnrolamento] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streamAtivo, setStreamAtivo] = useState(false);

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  async function carregarFuncionarios() {
    try {
      const res = await api.get("/api/funcionarios");
      setFuncs(res.data);
      setStatus(`OK (${res.data.length} registos)`);
    } catch (e) {
      console.error(e);
      setStatus("Erro ao carregar.");
    }
  }

  async function guardarFuncionario(e) {
    e.preventDefault();
    if (!nome || !email) {
      alert("Preenche nome e email.");
      return;
    }

    try {
      if (idEdicao) {
        const res = await api.put(`/api/funcionarios/${idEdicao}`, {
          nome,
          email,
          ativo,
        });
        setFuncs((prev) => prev.map((f) => (f.id === idEdicao ? res.data : f)));
        setStatus("Funcionário atualizado.");
      } else {
        const res = await api.post("/api/funcionarios", {
          nome,
          email,
          ativo,
        });
        setFuncs((prev) => [...prev, res.data]);
        setStatus("Funcionário criado.");
      }
      setNome("");
      setEmail("");
      setAtivo(true);
      setIdEdicao(null);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.error || "Erro ao guardar funcionário");
    }
  }

  function editar(f) {
    setIdEdicao(f.id);
    setNome(f.nome);
    setEmail(f.email);
    setAtivo(f.ativo);
  }

  async function eliminar(id) {
    if (!window.confirm("Eliminar este funcionário?")) return;
    try {
      await api.delete(`/api/funcionarios/${id}`);
      setFuncs((prev) => prev.filter((f) => f.id !== id));
      setStatus("Funcionário eliminado.");
    } catch (e) {
      console.error(e);
      alert("Erro ao eliminar");
    }
  }

  // --- CÂMARA / ENROLAMENTO (ainda só frontend) ---

  async function iniciarCamera(funcId) {
    setIdEnrolamento(funcId);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamAtivo(true);
      }
    } catch (e) {
      console.error(e);
      alert("Não foi possível aceder à câmara.");
    }
  }

  function pararCamera() {
    const v = videoRef.current;
    if (v?.srcObject) {
      v.srcObject.getTracks().forEach((t) => t.stop());
    }
    setStreamAtivo(false);
    setIdEnrolamento(null);
  }

  function capturarFoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);

    alert(
      "Foto capturada no frontend.\n" +
        "Quando tiveres endpoints para FaceTemplate (por ex. /api/facetemplates)," +
        " podemos enviar a imagem/embedding para o backend."
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Funcionários</h2>
        <p className="text-sm text-slate-300">
          CRUD completo em cima de <code>/api/funcionarios</code>.
        </p>
        <p className="text-xs text-slate-400">
          <b>Estado:</b> {status}
        </p>
      </header>

      {/* FORM CRIAR/EDITAR */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <form
          className="flex flex-col gap-3 md:flex-row md:items-end"
          onSubmit={guardarFuncionario}
        >
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Nome
            </label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ex.: Ana Silva"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Email
            </label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="ana@empresa.pt"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="ativo"
              type="checkbox"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
            />
            <label
              htmlFor="ativo"
              className="text-xs font-medium text-slate-300"
            >
              Ativo
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-emerald-400"
            >
              {idEdicao ? "Guardar alterações" : "Adicionar"}
            </button>
            {idEdicao && (
              <button
                type="button"
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
                onClick={() => {
                  setIdEdicao(null);
                  setNome("");
                  setEmail("");
                  setAtivo(true);
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      {/* LISTA */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">
            Lista de funcionários
          </h3>
          <span className="text-xs text-slate-400">
            {funcs.length} registo(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase text-slate-400">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Ativo</th>
                <th className="px-3 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {funcs.map((f) => (
                <tr
                  key={f.id}
                  className="border-b border-slate-800/80 last:border-0 hover:bg-slate-800/60"
                >
                  <td className="px-3 py-2 text-xs text-slate-400">{f.id}</td>
                  <td className="px-3 py-2">{f.nome}</td>
                  <td className="px-3 py-2 text-slate-300">{f.email}</td>
                  <td className="px-3 py-2">
                    {f.ativo ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300">
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-700/60 px-2 py-0.5 text-xs font-medium text-slate-200">
                        Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right space-x-2">
                    <button
                      className="rounded-full border border-emerald-500/60 px-3 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/10"
                      onClick={() => editar(f)}
                    >
                      Editar
                    </button>
                    <button
                      className="rounded-full border border-rose-500/60 px-3 py-1 text-xs font-medium text-rose-300 hover:bg-rose-500/10"
                      onClick={() => eliminar(f.id)}
                    >
                      Eliminar
                    </button>
                    <button
                      className="rounded-full border border-sky-500/60 px-3 py-1 text-xs font-medium text-sky-300 hover:bg-sky-500/10"
                      onClick={() => iniciarCamera(f.id)}
                    >
                      Enrolamento
                    </button>
                  </td>
                </tr>
              ))}
              {funcs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-sm text-slate-400"
                  >
                    Sem funcionários na base de dados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECÇÃO CÂMARA */}
      {streamAtivo && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">
              Enrolamento – Funcionário #{idEnrolamento}
            </h3>
            <button
              className="text-xs text-slate-400 hover:text-slate-200"
              onClick={pararCamera}
            >
              Fechar
            </button>
          </div>

          <div className="flex flex-col gap-4 md:flex-row">
            <video
              ref={videoRef}
              autoPlay
              className="h-56 w-full max-w-sm rounded-xl border border-slate-700 bg-black object-cover"
            />
            <canvas
              ref={canvasRef}
              className="h-56 w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900"
            />
          </div>

          <div className="flex gap-3">
            <button
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-emerald-400"
              onClick={capturarFoto}
            >
              Capturar (simulação)
            </button>
            <button
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
              onClick={pararCamera}
            >
              Fechar câmara
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
