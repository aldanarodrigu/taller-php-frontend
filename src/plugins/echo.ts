import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const appUrl = import.meta.env.VITE_APP_URL ?? "http://localhost:8000";
const wsScheme = import.meta.env.VITE_REVERB_SCHEME ?? (appUrl.startsWith("https") ? "https" : "http");
const wsHost = import.meta.env.VITE_REVERB_HOST ?? new URL(appUrl).hostname;
const wsPort = Number(
  import.meta.env.VITE_REVERB_PORT ?? (wsScheme === "https" ? 443 : 80),
);

export const echo = new Echo({
  broadcaster: "reverb",
  key: import.meta.env.VITE_REVERB_KEY ?? "local-key",
  wsHost,
  wsPort,
  forceTLS: wsScheme === "https",
  enabledTransports: wsScheme === "https" ? ["wss", "ws"] : ["ws"],
  withCredentials: true,

  authEndpoint: `${appUrl}/broadcasting/auth`,

  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      Accept: "application/json",
    },
  },
});

(window as any).Echo = echo;
