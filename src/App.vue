<script setup lang="ts">
import {
  FLayoutApplicationTemplate,
  FLayoutLeftPanel,
  FPageHeader,
} from "@fkui/vue";
import { RouterLink } from "vue-router";
import AdminSektioner from "./components/AdminSektioner.vue";
</script>

<template>
  <f-layout-application-template>
    <template #header>
      <f-page-header skip-link="main-title">
        <RouterLink
          to="/oul-prioritering"
          style="
            font-weight: bold;
            font-size: 1.25rem;
            text-decoration: none;
            color: inherit;
          "
        >
          Rimfrost Admin
        </RouterLink>
      </f-page-header>
    </template>

    <f-layout-left-panel>
      <template #heading>
        <h3 class="h3">Administration</h3>
      </template>

      <template #content>
        <AdminSektioner />
      </template>

      <router-view />
    </f-layout-left-panel>

    <template #footer>
      <div></div>
    </template>
  </f-layout-application-template>
</template>
