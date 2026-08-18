<script setup lang="ts">
import { computed } from "vue";
import { FNavigationMenu } from "@fkui/vue";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();

const sektioner = [
  { label: "Operativa uppgifter", route: "operativa-uppgifter" },
  { label: "Statistik", route: "statistik" },
  { label: "Sorteringsordningar", route: "sorteringsordningar" },
];

const currentRoute = computed(
  () => route.name?.toString() ?? "operativa-uppgifter",
);

function onSelectedRoute(routeId: string) {
  router.push({ name: routeId });
}
</script>

<template>
  <f-navigation-menu
    :route="currentRoute"
    :routes="sektioner"
    vertical
    menu-aria-label="Adminmenyn"
    @selected-route="onSelectedRoute"
  />
</template>
