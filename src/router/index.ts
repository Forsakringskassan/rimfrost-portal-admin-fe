import {
  type RouteRecordRaw,
  createRouter,
  createWebHistory,
} from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/oul-prioritering",
  },
  {
    path: "/oul-prioritering",
    name: "oul-prioritering",
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
    path: "/:pathMatch(.*)*",
    redirect: "/oul-prioritering",
  },
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
