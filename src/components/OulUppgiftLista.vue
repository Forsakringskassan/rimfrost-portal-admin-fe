<script setup lang="ts">
import { onMounted } from "vue";
import { FLoader } from "@fkui/vue";
import { useOulStore } from "../stores/oul-store";
import type { OperativUppgiftItem } from "../types";
import { getOulUppgifter } from "../utils/get-oul-uppgifter";

const store = useOulStore();

function formatDate(dateString: string): string {
  if (!dateString) {
    return "—";
  }
  return new Date(dateString).toLocaleString("sv-SE", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function handlaggareLabel(item: OperativUppgiftItem): string {
  if (!item.handlaggarId) {
    return "—";
  }
  return item.handlaggarId.varde;
}

onMounted(async () => {
  if (!store.hasFetched) {
    try {
      await getOulUppgifter();
    } catch {
      // error already set in store
    }
  }
});
</script>

<template>
  <div class="oul-uppgift-lista">
    <h1 id="main-title" class="h1">OUL-prioritering</h1>
    <p class="body">
      Visar alla operativa uppgifter i uppgiftslagret. Prioriteringsordning
      bestäms av kolumnen "Skapad".
    </p>

    <f-loader
      :show="store.isLoading"
      :delay="true"
      style="margin-top: 10vh; display: block"
    >
      Hämtar uppgifter...
    </f-loader>

    <p v-if="store.error" class="error-message">{{ store.error }}</p>

    <template v-if="!store.isLoading && !store.error && store.hasFetched">
      <p v-if="store.uppgiftLista.length === 0" class="body">
        Inga uppgifter hittades i OUL.
      </p>

      <div v-else class="table-wrapper">
        <table class="oul-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Regel</th>
              <th>Roll</th>
              <th>Skapad</th>
              <th>Handläggare</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="uppgift in store.uppgiftLista" :key="uppgift.uppgiftId">
              <td class="id-cell" :title="uppgift.handlaggningId">
                {{ uppgift.handlaggningId.slice(-8) }}
              </td>
              <td>
                <span
                  :class="`status-badge status-badge--${uppgift.status?.toLowerCase() ?? 'okand'}`"
                >
                  {{ uppgift.status }}
                </span>
              </td>
              <td>{{ uppgift.regel }}</td>
              <td>{{ uppgift.roll }}</td>
              <td>{{ formatDate(uppgift.skapad) }}</td>
              <td>{{ handlaggareLabel(uppgift) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<style scoped>
.oul-uppgift-lista {
  padding: 1.5rem 2rem;
}

.table-wrapper {
  overflow-x: auto;
  margin-top: 1.5rem;
}

.oul-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.oul-table th,
.oul-table td {
  text-align: left;
  padding: 0.625rem 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.oul-table th {
  background-color: #f5f5f5;
  font-weight: 600;
  white-space: nowrap;
}

.oul-table tbody tr:hover {
  background-color: #f9f9f9;
}

.id-cell {
  font-family: monospace;
  font-size: 0.8rem;
  color: #666;
}

.status-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge--ny {
  background-color: #d4edda;
  color: #155724;
}

.status-badge--tilldelad {
  background-color: #cce5ff;
  color: #004085;
}

.status-badge--avslutad {
  background-color: #e2e3e5;
  color: #383d41;
}

.status-badge--avbruten {
  background-color: #f8d7da;
  color: #721c24;
}

.error-message {
  color: red;
  padding: 0.5rem 0;
}
</style>
