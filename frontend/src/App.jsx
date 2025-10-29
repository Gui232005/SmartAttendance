import { useEffect, useState } from 'react';
import axios from 'axios';

export default function App() {
  const [funcs, setFuncs] = useState([]);
  useEffect(() => {
    axios.get('http://localhost:3001/api/funcionarios').then(r => setFuncs(r.data));
  }, []);
  return (
    <div style={{ padding: 20 }}>
      <h1>Smart Attendance – PoC</h1>
      <ul>{funcs.map(f => <li key={f.id}>{f.nome} ({f.email})</li>)}</ul>
    </div>
  );
}
