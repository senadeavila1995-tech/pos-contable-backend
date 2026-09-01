import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor para adjuntar el token JWT automáticamente
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/**
 * Interceptor de respuestas (manejo global de errores)
 */
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message?: string }>) => {
    // Token inválido o expirado
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // window.location.href = "/login"; // opcional
    }

    // Error de backend controlado
    if (error.response?.data?.message) {
      console.error("API Error:", error.response.data.message);
    } else {
      console.error("API Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
