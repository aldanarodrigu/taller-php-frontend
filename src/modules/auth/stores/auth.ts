import { defineStore } from "pinia";

interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  foto?: string | null;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    loaded: false,
  }),

  actions: {
    async fetchUser() {
      if (this.loaded) return this.user;

      const res = await fetch("/api/me");
      this.user = await res.json();

      this.loaded = true;

      return this.user;
    },

    logout() {
      this.user = null;
      this.loaded = false;
    },
  },
});
