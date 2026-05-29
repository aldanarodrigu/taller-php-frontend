import { ref } from "vue";
import { useRouter } from "vue-router";
import { loginRequest, registerRequest, meRequest } from "@/modules/auth/api/auth";
import type { AxiosError } from "axios";

import { useAuthStore } from "@/modules/auth/stores/auth";

export function useAuth() {
  const router = useRouter();
  const loading = ref(false);
  const error = ref<string | null>(null);

  const login = async (email: string, password: string) => {
    loading.value = true;
    error.value = null;
    try {
      const data = await loginRequest({ email, password });
      localStorage.setItem("token", data.token);

      await router.push("/app");
    } catch (e) {
      const err = e as AxiosError<{ message: string }>;
      error.value = err.response?.data?.message ?? "Error al iniciar sesión";
    } finally {
      loading.value = false;
    }
  };

  const register = async (data: {
    name: string;
    lastname: string;
    email: string;
    password: string;
    role: string;
  }) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await registerRequest({
        nombre: data.name,
        apellido: data.lastname,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      localStorage.setItem("token", res.token);

      const authStore = useAuthStore();
      authStore.logout();

      await router.push("/app");
    } catch (e) {
      const err = e as AxiosError<{ message: string }>;
      error.value = err.response?.data?.message ?? "Error al registrarse";
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const me = async () => {
    return await meRequest();
  };

  return { login, logout, me, register, loading, error };
}
