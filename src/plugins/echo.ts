import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

export const echo = new Echo({
  broadcaster: "reverb",
  key: "ograw18oznfis1qrf46q",
  wsHost: "localhost",
  wsPort: 8080,
  forceTLS: false,
  enabledTransports: ["ws"],
  withCredentials: true,

  authEndpoint: "http://localhost:8000/broadcasting/auth",

  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      Accept: "application/json",
    },
  },
});

(window as any).Echo = echo;
