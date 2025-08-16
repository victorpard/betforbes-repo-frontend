import api from "@/services/api";

let refreshing = false;
let queue: Array<(t: string) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error || {};
    if (response?.status === 401 && !config._retry) {
      config._retry = true;
      try {
        // dispara refresh (cookie HttpOnly precisa de withCredentials: true já configurado na instância)
        const { data } = await api.post("/auth/refresh", null);
        // supondo que o backend devolve { token }
        if (data?.token) {
          localStorage.setItem("authToken", data.token);
        }
        config.headers.Authorization = `Bearer ${localStorage.getItem("authToken") ?? ""}`;
        queue.forEach(fn => fn(localStorage.getItem("authToken") ?? ""));
        queue = [];
        return api(config);
      } catch (e) {
        // logout hard
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(e);
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
