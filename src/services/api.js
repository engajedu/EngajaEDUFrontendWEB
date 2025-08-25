import axios from 'axios';

const getBaseURL = () => {
  // Produção (Vite lê do .env.production)
  if (import.meta.env?.VITE_API_URL) return import.meta.env.VITE_API_URL;

  // Desenvolvimento local (ajuste seu IP se precisar)
  if (import.meta.env?.DEV) return 'http://192.168.1.173:5001';

  // Fallback produção: sempre HTTPS + domínio
  return 'https://api.engajedu.com.br';
};

const baseURL = getBaseURL();
console.log('🔗 API configurada para:', baseURL, '(Development:', !!import.meta.env?.DEV, ')');

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: 300000, // 5 min (áudio, etc.)
  // withCredentials: true, // habilite se usa cookies/sessões
});

// Logs só em dev
if (import.meta.env?.DEV) {
  api.interceptors.request.use((req) => {
    console.log('📤 API Request:', req.method?.toUpperCase(), req.url);
    if (req.url === '/Questionarios') {
      req.timeout = 60000;
      console.log('⏱️ Timeout custom /Questionarios: 60s');
    }
    return req;
  });
  api.interceptors.response.use(
    (res) => {
      console.log('📥 API Response:', res.status, res.config.url);
      return res;
    },
    (err) => {
      console.error('❌ API Error:', err.message, err.config?.url);
      return Promise.reject(err);
    }
  );
}

export default api;
