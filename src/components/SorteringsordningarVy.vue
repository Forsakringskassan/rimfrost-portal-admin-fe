<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  FButton,
  FInteractiveTable,
  FLoader,
  FMessageBox,
  FSortFilterDataset,
  FTableButton,
  FTableColumn,
  useModal,
} from "@fkui/vue";
import { useRoute, useRouter } from "vue-router";
import type { Sorteringsordning } from "../types";
import {
  loadActiveSorteringsordningIds,
  saveActiveSorteringsordningIds,
} from "../utils/active-sorteringsordningar";
import { deleteSorteringsordning } from "../utils/delete-sorteringsordning";
import { getDefaultSorteringsordning } from "../utils/get-default-sorteringsordning";
import { getSorteringsordningar } from "../utils/get-sorteringsordningar";
import { setDefaultSorteringsordning } from "../utils/set-default-sorteringsordning";

const route = useRoute();
const router = useRouter();
const { confirmModal } = useModal();

const sorteringsordningar = ref<Sorteringsordning[]>([]);
const defaultId = ref<string | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);
const loadFailed = ref(false);
const successMessage = ref<string | null>(null);
let successMessageTimeout: ReturnType<typeof setTimeout> | null = null;

function pinDefaultFirst<T extends { id: string }>(rows: T[]): T[] {
  if (!defaultId.value) {
    return rows;
  }
  const idx = rows.findIndex((row) => row.id === defaultId.value);
  if (idx <= 0) {
    return rows;
  }
  const reordered = [...rows];
  const defaultRow = reordered.splice(idx, 1)[0];
  if (!defaultRow) {
    return rows;
  }
  reordered.unshift(defaultRow);
  return reordered;
}

const activeIds = ref<Set<string>>(loadActiveSorteringsordningIds());
const sortActiveFirst = ref(false);

function sortActiveFirstIfEnabled<T extends { id: string }>(rows: T[]): T[] {
  if (!sortActiveFirst.value) {
    return rows;
  }
  // eslint-disable-next-line unicorn/no-array-sort -- toSorted() needs ES2023 lib, not enabled in tsconfig.app.json
  return [...rows].sort((a, b) => {
    const aActive = activeIds.value.has(a.id);
    const bActive = activeIds.value.has(b.id);
    if (aActive === bActive) {
      return 0;
    }
    return aActive ? -1 : 1;
  });
}

function toggleActive(id: string): void {
  const next = new Set(activeIds.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  activeIds.value = next;
  saveActiveSorteringsordningIds(next);
}

const sortableSorteringsordningar = computed(() =>
  sorteringsordningar.value.map((row) => ({
    ...row,
    entriesCount: row.entries.length,
  })),
);

async function load(): Promise<void> {
  isLoading.value = true;
  error.value = null;
  loadFailed.value = false;
  try {
    const [page, defaultSO] = await Promise.all([
      getSorteringsordningar(100),
      getDefaultSorteringsordning(),
    ]);
    sorteringsordningar.value = page.items;
    defaultId.value = defaultSO?.id ?? null;
  } catch {
    error.value = "Kunde inte hämta sorteringsordningar.";
    loadFailed.value = true;
  } finally {
    isLoading.value = false;
  }
}

function showSuccessMessage(message: string): void {
  successMessage.value = message;
  if (successMessageTimeout) {
    clearTimeout(successMessageTimeout);
  }
  successMessageTimeout = setTimeout(() => {
    successMessage.value = null;
  }, 4000);
}

async function handleSetDefault(id: string): Promise<void> {
  try {
    const result = await setDefaultSorteringsordning(id);
    if (result === null) {
      error.value = "Sorteringsordningen hittades inte.";
      return;
    }
    defaultId.value = id;
    const namn = sorteringsordningar.value.find((row) => row.id === id)?.namn;
    if (namn) {
      showSuccessMessage(
        `"${namn}" är nu satt som default och visas överst i listan.`,
      );
    }
  } catch {
    error.value = "Kunde inte sätta default sorteringsordning.";
  }
}

async function handleDelete(id: string): Promise<void> {
  const confirmed = await confirmModal({
    heading: "Ta bort sorteringsordning",
    content:
      "Är du säker på att du vill ta bort sorteringsordningen? Åtgärden kan inte ångras.",
    confirm: "Ta bort",
    dismiss: "Avbryt",
  });
  if (!confirmed) {
    return;
  }

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
    if (activeIds.value.has(id)) {
      const next = new Set(activeIds.value);
      next.delete(id);
      activeIds.value = next;
      saveActiveSorteringsordningIds(next);
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

onMounted(() => {
  if (route.query.saved === "created") {
    showSuccessMessage("Sorteringsordning har skapats.");
  } else if (route.query.saved === "updated") {
    showSuccessMessage("Sorteringsordning har uppdaterats.");
  }
  if (route.query.saved) {
    router.replace({ path: route.path });
  }
  load();
});

onUnmounted(() => {
  if (successMessageTimeout) {
    clearTimeout(successMessageTimeout);
  }
});
</script>

<template>
  <div class="sorteringsordningar-vy">
    <div class="title-row">
      <div>
        <h1 id="main-title" class="h1">Sorteringsordningar</h1>
        <p class="body">Hantera sorteringsordningar för operativa uppgifter.</p>
      </div>
      <button
        type="button"
        class="active-first-toggle"
        :class="{ 'active-first-toggle--on': sortActiveFirst }"
        :aria-pressed="sortActiveFirst"
        @click="sortActiveFirst = !sortActiveFirst"
      >
        Sortera aktiva överst
      </button>
    </div>

    <FButton
      v-if="isLoading || sorteringsordningar.length === 0"
      @click="router.push('/sorteringsordningar/skapa')"
    >
      Skapa ny
    </FButton>

    <f-loader
      :show="isLoading"
      :delay="true"
      style="margin-top: 10vh; display: block"
    >
      Hämtar sorteringsordningar...
    </f-loader>

    <p v-if="error" class="error-message">{{ error }}</p>

    <FMessageBox
      v-if="successMessage"
      type="success"
      layout="short"
      class="success-message"
    >
      {{ successMessage }}
    </FMessageBox>

    <template v-if="!isLoading && !loadFailed">
      <p v-if="sorteringsordningar.length === 0" class="body">
        Inga sorteringsordningar är konfigurerade.
      </p>

      <div v-else class="table-section">
        <FSortFilterDataset
          :data="sortableSorteringsordningar"
          :sortable-attributes="{
            namn: 'Namn',
            skapad: 'Skapad',
            entriesCount: 'Antal regler',
          }"
          default-sort-attribute="namn"
          :default-sort-ascending="true"
          filter-label="Sök"
          :filter-attributes="['namn']"
        >
          <template #header>
            <FButton @click="router.push('/sorteringsordningar/skapa')">
              Skapa ny
            </FButton>
          </template>
          <template #default="{ sortFilterResult }">
            <FInteractiveTable
              :rows="
                pinDefaultFirst(sortActiveFirstIfEnabled(sortFilterResult))
              "
              key-attribute="id"
            >
              <template #default="{ row }">
                <FTableColumn name="namn" title="Namn" sortable>
                  {{ row.namn }}
                </FTableColumn>
                <FTableColumn name="skapad" title="Skapad" sortable>
                  <span class="nowrap-cell">{{ formatDate(row.skapad) }}</span>
                </FTableColumn>
                <FTableColumn
                  name="entriesCount"
                  title="Regler"
                  shrink
                  sortable
                >
                  {{ row.entriesCount }}
                </FTableColumn>
                <FTableColumn name="status" title="Status" shrink>
                  <div class="status-cell">
                    <button
                      type="button"
                      class="status-chip"
                      :class="{ 'status-chip--active': row.id === defaultId }"
                      :aria-pressed="row.id === defaultId"
                      :disabled="row.id === defaultId"
                      :title="
                        row.id === defaultId
                          ? 'Detta är redan default'
                          : 'Ange som default'
                      "
                      @click="handleSetDefault(row.id)"
                    >
                      Default
                    </button>
                    <button
                      type="button"
                      class="status-chip"
                      :class="{
                        'status-chip--active': activeIds.has(row.id),
                      }"
                      :aria-pressed="activeIds.has(row.id)"
                      title="Markera/avmarkera som aktiv"
                      @click="toggleActive(row.id)"
                    >
                      Aktiv
                    </button>
                  </div>
                </FTableColumn>
                <FTableColumn name="actions" title="Åtgärder">
                  <div class="action-cell align-items-center">
                    <FTableButton
                      icon="pen"
                      title="Redigera sorteringsordning"
                      @click="
                        router.push(`/sorteringsordningar/${row.id}/redigera`)
                      "
                    >
                      Redigera sorteringsordning
                    </FTableButton>
                    <FTableButton
                      icon="trashcan"
                      :disabled="row.id === defaultId"
                      :title="
                        row.id === defaultId
                          ? 'En sorteringsordning som är satt till default kan inte tas bort'
                          : 'Ta bort sorteringsordning'
                      "
                      @click="handleDelete(row.id)"
                    >
                      Ta bort sorteringsordning
                    </FTableButton>
                  </div>
                </FTableColumn>
              </template>
            </FInteractiveTable>
          </template>
        </FSortFilterDataset>
      </div>
    </template>
  </div>
</template>

<style scoped>
.align-items-center {
  display: flex;
  margin-top: 3px;
  align-items: center;
}

.sorteringsordningar-vy {
  padding: 1.5rem 2rem;
}

.table-section {
  margin-top: 1rem;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.action-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.action-cell :deep(.table__button) {
  color: inherit;
}

:deep(.table) {
  margin-top: 1rem;
}

/* Nudge Namn (1st column), Skapad (2nd column), Regler (3rd column)
   and Status (4th column) without disturbing the other columns. */
:deep(.table thead th:nth-child(1)),
:deep(.table tbody td:nth-child(1)) {
  min-width: 260px;
}

:deep(.table thead th:nth-child(2)),
:deep(.table tbody td:nth-child(2)) {
  max-width: 220px;
}

:deep(.table thead th:nth-child(3)),
:deep(.table tbody td:nth-child(3)) {
  min-width: 150px;
}

:deep(.table thead th:nth-child(4)),
:deep(.table tbody td:nth-child(4)) {
  min-width: 210px;
}

.status-cell {
  display: flex;
  flex-direction: row;
  gap: 0.375rem;
}

.nowrap-cell {
  white-space: nowrap;
}

.status-chip {
  display: inline-block;
  padding: 0.125rem 0.625rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid var(--color-border, #ced4da);
  background-color: transparent;
  color: var(--color-grey-600, #6c757d);
  cursor: pointer;
}

.status-chip--active {
  border-color: #b6dfc4;
  background-color: #d4edda;
  color: #155724;
}

.status-chip:disabled {
  cursor: not-allowed;
}

.active-first-toggle {
  margin-right: 38px;
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid var(--color-border, #ced4da);
  background-color: transparent;
  color: var(--color-grey-600, #6c757d);
  cursor: pointer;
}

.active-first-toggle--on {
  border-color: #b6dfc4;
  background-color: #d4edda;
  color: #155724;
}

.error-message {
  color: red;
  padding: 0.5rem 0;
}

.success-message {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 9995;
  max-width: 24rem;
  margin: 0;
}
</style>
