import { useEffect, useState } from "react";
import api from "./api";

export default function App() {
  const [funcs, setFuncs] = useState([]);
  const [status, setStatus] = useState("A carregar...");

  useEffect(() => {
    api
      .get("/api/funcionarios")
      .then((r) => {
        setFuncs(r.data);
        setStatus(`OK (${r.data.length} registos)`);
      })
      .catch((err) => {
        console.error(
          "ERRO GET /api/funcionarios:",
          err?.message,
          err?.response?.data
        );
        setStatus("Falhou. Ver consola (F12 → Network).");
      });
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>Smart Attendance – PoC</h1>
      <p>
        <b>Estado:</b> {status}
      </p>

      <button
        onClick={async () => {
          try {
            const nome = `User_${Math.floor(Math.random() * 1000)}`;
            const res = await api.post("/api/funcionarios", {
              nome,
              email: `${nome}@empresa.pt`,
            });
            setFuncs((prev) => [...prev, res.data]);
          } catch (e) {
            console.error(
              "ERRO POST /api/funcionarios:",
              e?.message,
              e?.response?.data
            );
          }
        }}
      >
        + Adicionar funcionário de teste
      </button>

      <ul>
        {funcs.map((f) => (
          <li key={f.id}>
            {f.nome} ({f.email})
          </li>
        ))}
      </ul>
    </div>
  );
}
