<script setup lang="ts">
import { onMounted, ref } from "vue";
import { FButton, FInteractiveTable, FLoader, FTableColumn } from "@fkui/vue";
import { useRouter } from "vue-router";
import type { Sorteringsordning } from "../types";
import { deleteSorteringsordning } from "../utils/delete-sorteringsordning";
import { getDefaultSorteringsordning } from "../utils/get-default-sorteringsordning";
import { getSorteringsordningar } from "../utils/get-sorteringsordningar";
import { setDefaultSorteringsordning } from "../utils/set-default-sorteringsordning";

const router = useRouter();

const sorteringsordningar = ref<Sorteringsordning[]>([]);
const defaultId = ref<string | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

async function load(): Promise<void> {
  isLoading.value = true;
  error.value = null;
  try {
    const [page, defaultSO] = await Promise.all([
      getSorteringsordningar(100),
      getDefaultSorteringsordning(),
    ]);
    sorteringsordningar.value = page.items;
    defaultId.value = defaultSO?.id ?? null;
  } catch {
    error.value = "Kunde inte hämta sorteringsordningar.";
  } finally {
    isLoading.value = false;
  }
}

async function handleSetDefault(id: string): Promise<void> {
  try {
    const result = await setDefaultSorteringsordning(id);
    if (result === null) {
      error.value = "Sorteringsordningen hittades inte.";
      return;
    }
    defaultId.value = id;
  } catch {
    error.value = "Kunde inte sätta default sorteringsordning.";
  }
}

async function handleDelete(id: string): Promise<void> {
  try {
    const result = await deleteSorteringsordning(id);
    if (result === null) {
      error.value = "Sorteringsordningen hittades inte.";
      return;
    }
    sorteringsordningar.value = sorteringsordningar.value.filter(
      (s) => s.id !== id,
    );
    if (defaultId.value === id) {
      defaultId.value = null;
    }
  } catch {
    error.value = "Kunde inte ta bort sorteringsordningen.";
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("sv-SE", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

onMounted(load);
</script>

<template>
  <div class="konfiguration-vy">
    <div>
      <h1 id="main-title" class="h1">Konfiguration</h1>
      <p class="body">Hantera sorteringsordningar för OUL-prioritering.</p>
    </div>
    <FButton @click="router.push('/konfiguration/skapa')"> Skapa ny </FButton>

    <f-loader
      :show="isLoading"
      :delay="true"
      style="margin-top: 10vh; display: block"
    >
      Hämtar sorteringsordningar...
    </f-loader>

    <p v-if="error" class="error-message">{{ error }}</p>

    <template v-if="!isLoading">
      <p v-if="sorteringsordningar.length === 0 && !error" class="body">
        Inga sorteringsordningar är konfigurerade.
      </p>

      <FInteractiveTable v-else :rows="sorteringsordningar" key-attribute="id">
        <template #default="{ row }">
          <FTableColumn name="id" title="ID" shrink>
            <span class="id-cell" :title="row.id">
              {{ row.id.slice(-8) }}
            </span>
          </FTableColumn>
          <FTableColumn name="skapad" title="Skapad">
            {{ formatDate(row.skapad) }}
          </FTableColumn>
          <FTableColumn name="entries" title="Antal regler" shrink>
            {{ row.entries.length }}
          </FTableColumn>
          <FTableColumn name="default" title="Status" shrink>
            <span v-if="row.id === defaultId" class="badge badge--default">
              Default
            </span>
          </FTableColumn>
          <FTableColumn name="actions" title="Åtgärder" shrink>
            <FButton
              type="button"
              variant="secondary"
              :disabled="row.id === defaultId"
              @click="handleSetDefault(row.id)"
            >
              Sätt som default
            </FButton>
            <FButton
              type="button"
              variant="tertiary"
              :disabled="row.id === defaultId"
              @click="handleDelete(row.id)"
            >
              Ta bort
            </FButton>
          </FTableColumn>
        </template>
      </FInteractiveTable>
    </template>
  </div>
</template>

<style scoped>
.konfiguration-vy {
  padding: 1.5rem 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.id-cell {
  font-family: monospace;
  font-size: 0.8rem;
  color: #666;
}

.badge--default {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: #d4edda;
  color: #155724;
}

.error-message {
  color: red;
  padding: 0.5rem 0;
}
</style>
