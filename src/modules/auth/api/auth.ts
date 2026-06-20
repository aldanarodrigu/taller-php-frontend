/*las funciones que llaman a la API: loginRequest, registerRequest, meRequest. Usan el axios de http.ts.*/

import { http } from "@/modules/auth/api/http";

export const loginRequest = async (data: { email: string; password: string }) => {
  const res = await http.post("/login", data);
  return res.data; // token
};

export const registerRequest = async (data: {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  role: string;
}) => {
  const res = await http.post("/registrar", data);
  return res.data;
};

export const meRequest = async () => {
  const res = await http.get("/me");
  return res.data; // datos del usuario autenticado
};

export const logoutRequest = async () => {
  const res = await http.post("/logout");
  return res.data;
};

export const completeGoogleRequest = async (data: { payload: string; role: string }) => {
  const res = await http.post("/auth/google/complete", data);
  return res.data;
};
