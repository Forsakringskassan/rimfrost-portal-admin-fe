<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { SortOrder } from "@fkui/vue";
import {
  FButton,
  FInteractiveTable,
  FLoader,
  FSortFilterDataset,
  FTableColumn,
} from "@fkui/vue";
import { useOulStore } from "../stores/oul-store";
import type { OperativUppgiftItem } from "../types";
import { getOulUppgifter } from "../utils/get-oul-uppgifter";
import { unassignUppgift } from "../utils/unassign-uppgift";

const store = useOulStore();

const unassigningIds = ref(new Set<string>());
const unassignError = ref<string | null>(null);

async function handleUnassign(row: OperativUppgiftItem): Promise<void> {
  unassignError.value = null;
  unassigningIds.value.add(row.uppgiftId);
  try {
    const updated = await unassignUppgift(row.uppgiftId);
    if (updated) {
      store.updateUppgift(updated);
    }
  } catch {
    unassignError.value = `Kunde inte lägga tillbaka uppgift ${row.uppgiftId.slice(-8)}.`;
  } finally {
    unassigningIds.value.delete(row.uppgiftId);
  }
}

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

function onSortChange(sortState: SortOrder) {
  store.setSort(String(sortState.attribute), sortState.ascending);
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
    <p v-if="unassignError" class="error-message">{{ unassignError }}</p>

    <template v-if="!store.isLoading && !store.error && store.hasFetched">
      <p v-if="store.uppgiftLista.length === 0" class="body">
        Inga uppgifter hittades i OUL.
      </p>

      <p
        v-if="store.totalUppgifter > store.uppgiftLista.length"
        class="truncation-warning"
      >
        Visar {{ store.uppgiftLista.length }} av
        {{ store.totalUppgifter }} uppgifter. Kontakta administratören för att
        justera hämtningsgränsen.
      </p>

      <FSortFilterDataset
        v-else
        :data="store.uppgiftLista"
        :sortable-attributes="{ skapad: 'Skapad', regel: 'Regeltyp' }"
        :default-sort-attribute="store.sortAttribute"
        :default-sort-ascending="store.sortAscending"
        @used-sort-attributes="onSortChange"
      >
        <template #default="{ sortFilterResult }">
          <FInteractiveTable :rows="sortFilterResult" key-attribute="uppgiftId">
            <template #default="{ row }">
              <FTableColumn name="handlaggningId" title="ID" shrink>
                <span class="id-cell" :title="row.handlaggningId">
                  {{ row.handlaggningId.slice(-8) }}
                </span>
              </FTableColumn>
              <FTableColumn name="status" title="Status">
                <span
                  :class="`status-badge status-badge--${row.status?.toLowerCase() ?? 'okand'}`"
                >
                  {{ row.status }}
                </span>
              </FTableColumn>
              <FTableColumn name="regel" title="Regel" sortable>
                {{ row.regel }}
              </FTableColumn>
              <FTableColumn name="roll" title="Roll">
                {{ row.roll }}
              </FTableColumn>
              <FTableColumn name="skapad" title="Skapad" sortable>
                {{ formatDate(row.skapad) }}
              </FTableColumn>
              <FTableColumn name="handlaggarId" title="Handläggare">
                {{ handlaggareLabel(row) }}
              </FTableColumn>
              <FTableColumn name="actions" title="" shrink>
                <FButton
                  type="button"
                  variant="tertiary"
                  :disabled="
                    !row.handlaggarId || unassigningIds.has(row.uppgiftId)
                  "
                  @click="handleUnassign(row)"
                >
                  {{
                    unassigningIds.has(row.uppgiftId)
                      ? "Lägger tillbaka..."
                      : "Lägg tillbaka"
                  }}
                </FButton>
              </FTableColumn>
            </template>
          </FInteractiveTable>
        </template>
      </FSortFilterDataset>
    </template>
  </div>
</template>

<style scoped>
.oul-uppgift-lista {
  padding: 1.5rem 2rem;
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

.truncation-warning {
  color: #856404;
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 0.25rem;
  padding: 0.5rem 0.75rem;
  margin-bottom: 1rem;
}

.error-message {
  color: red;
  padding: 0.5rem 0;
}
</style>
