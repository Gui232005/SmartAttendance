// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://sistemas-embebidos-baackend.onrender.com",
});

export default api;
