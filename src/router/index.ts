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
    path: "/sorteringsordningar",
    name: "sorteringsordningar",
    component: () => import("../components/SorteringsordningarVy.vue"),
  },
  {
    path: "/sorteringsordningar/skapa",
    name: "sorteringsordningar-skapa",
    component: () => import("../components/SkapaSorteringsordning.vue"),
  },
  {
    path: "/sorteringsordningar/:id/redigera",
    name: "sorteringsordningar-redigera",
    component: () => import("../components/RedigeraSorteringsordning.vue"),
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
