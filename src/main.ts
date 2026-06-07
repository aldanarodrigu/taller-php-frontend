import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import "./styles.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");

app.directive("click-outside", {
  mounted(el, binding) {
    el._clickOutside = (e: Event) => {
      if (!el.contains(e.target as Node)) binding.value(e);
    };
    document.addEventListener("click", el._clickOutside);
  },
  unmounted(el) {
    document.removeEventListener("click", el._clickOutside);
  },
});
