import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const wsScheme = import.meta.env.VITE_REVERB_SCHEME ?? "http";
const wsHost   = import.meta.env.VITE_REVERB_HOST   ?? "localhost";
const wsPort   = Number(import.meta.env.VITE_REVERB_PORT ?? (wsScheme === "https" ? 443 : 80));

// authEndpoint apunta siempre al backend, derivado del host de Reverb
const authEndpoint = `${wsScheme}://${wsHost}/broadcasting/auth`;

export const echo = new Echo({
  broadcaster: "reverb",
  key: import.meta.env.VITE_REVERB_KEY ?? "local-key",
  wsHost,
  wsPort,
  forceTLS: wsScheme === "https",
  enabledTransports: wsScheme === "https" ? ["wss", "ws"] : ["ws"],
  withCredentials: true,

  authEndpoint,

  auth: {
    headers: {
      // El token se lee en cada request al authEndpoint, no al cargar el módulo
      get Authorization() {
        const token = localStorage.getItem("token");
        return token ? `Bearer ${token}` : "";
      },
      Accept: "application/json",
    },
  },
});

(window as any).Echo = echo;
