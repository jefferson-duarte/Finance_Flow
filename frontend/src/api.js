import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// 1. Interceptor de REQUISIÇÃO (Envia o Token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Interceptor de RESPOSTA (Trata erros globais)
api.interceptors.response.use(
  (response) => response, // Se der certo, só passa adiante
  (error) => {
    // Se o erro for 401 (Não autorizado), significa que o token é inválido ou expirou
    if (error.response && error.response.status === 401) {
      console.warn("Sessão expirada ou token inválido via interceptor.");

      // Remove o token podre
      localStorage.removeItem("access_token");

      // Opcional: Força um reload na página para voltar pro Login
      // Isso garante que o estado do App reinicie zerado
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;