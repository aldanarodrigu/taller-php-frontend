/*el estado global del usuario logueado (Pinia). Guarda el objeto user y lo cachea para no pedir /api/me en cada página*/
import { defineStore } from "pinia";
import { http } from "@/modules/auth/api/http";

interface Profesional {
  descripcion?: string | null;
  profesion?: string | null;
  foto?: string | null;
}

interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  role: "profesional" | "cliente";
  foto?: string | null;
  profesional?: Profesional;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    loaded: false,
    error: null as string | null,
  }),
  actions: {
    async fetchUser() {
      if (this.loaded) return this.user;
      try {
        const res = await http.get("/api/me");
        this.user = res.data;
        localStorage.setItem("user", JSON.stringify(res.data));
        this.error = null;
      } catch (err) {
        this.error = "No autorizado";
        this.user = null;
      }
      this.loaded = true;
      return this.user;
    },
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.loaded = false;
      this.error = null;
    },
  },
});
