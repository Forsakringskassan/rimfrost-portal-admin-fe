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
        <div class="left-nav-custom">
          <div class="nav-content">
            <AdminSektioner />
          </div>
        </div>
      </template>

      <router-view />
    </f-layout-left-panel>

    <template #footer>
      <div
        class="container-fluid"
        style="padding: 1rem 0; text-align: center"
      ></div>
    </template>
  </f-layout-application-template>
</template>

<style>
body.layout-application-template__body {
  height: 100vh !important;
  min-height: unset !important;
  overflow: hidden;
}

.layout-application-template {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.layout-application-template__header {
  flex-shrink: 0;
}

.layout-application-template__main {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

div:has(.left-nav-custom) {
  display: flex;
  flex-direction: column;
  height: 100% !important;
  overflow: hidden !important;
}

.left-nav-custom {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.nav-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
</style>
