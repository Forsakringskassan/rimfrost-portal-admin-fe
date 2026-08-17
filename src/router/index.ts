import {
  type RouteRecordRaw,
  createRouter,
  createWebHistory,
} from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/operativa-uppgifter",
  },
  {
    path: "/operativa-uppgifter",
    name: "operativa-uppgifter",
    component: () => import("../components/OulUppgiftLista.vue"),
  },
  {
    path: "/statistik",
    name: "statistik",
    component: () => import("../components/StatistikVy.vue"),
  },
  {
    path: "/konfiguration",
    name: "konfiguration",
    component: () => import("../components/KonfigurationVy.vue"),
  },
  {
    path: "/konfiguration/skapa",
    name: "konfiguration-skapa",
    component: () => import("../components/SkapaKonfiguration.vue"),
  },
  {
    path: "/konfiguration/:id/redigera",
    name: "konfiguration-redigera",
    component: () => import("../components/RedigeraKonfiguration.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/operativa-uppgifter",
  },
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
