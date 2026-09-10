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
import { deleteSorteringsordning } from "../utils/delete-sorteringsordning";
import { getAktivSorteringsordning } from "../utils/get-aktiv-sorteringsordning";
import { getSorteringsordningar } from "../utils/get-sorteringsordningar";
import { setAktivSorteringsordning } from "../utils/set-aktiv-sorteringsordning";

const route = useRoute();
const router = useRouter();
const { confirmModal } = useModal();

const sorteringsordningar = ref<Sorteringsordning[]>([]);
const aktivId = ref<string | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);
const loadFailed = ref(false);
const successMessage = ref<string | null>(null);
const messageType = ref<"success" | "warning">("success");
let successMessageTimeout: ReturnType<typeof setTimeout> | null = null;

function pinAktivFirst<T extends { id: string }>(rows: T[]): T[] {
  if (!aktivId.value) {
    return rows;
  }
  const idx = rows.findIndex((row) => row.id === aktivId.value);
  if (idx <= 0) {
    return rows;
  }
  const reordered = [...rows];
  const aktivRow = reordered.splice(idx, 1)[0];
  if (!aktivRow) {
    return rows;
  }
  reordered.unshift(aktivRow);
  return reordered;
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
    const [page, aktivSO] = await Promise.all([
      getSorteringsordningar(100),
      getAktivSorteringsordning(),
    ]);
    sorteringsordningar.value = page.items;
    aktivId.value = aktivSO?.id ?? null;
  } catch {
    error.value = "Kunde inte hämta sorteringsordningar.";
    loadFailed.value = true;
  } finally {
    isLoading.value = false;
  }
}

function showMessage(
  message: string,
  type: "success" | "warning" = "success",
): void {
  successMessage.value = message;
  messageType.value = type;
  if (successMessageTimeout) {
    clearTimeout(successMessageTimeout);
  }
  // Only confirmations time out; a warning needs the administrator to act on it.
  if (type === "success") {
    successMessageTimeout = setTimeout(() => {
      successMessage.value = null;
    }, 4000);
  }
}

async function handleSetAktiv(id: string): Promise<void> {
  try {
    const result = await setAktivSorteringsordning(id);
    if (result === null) {
      error.value = "Sorteringsordningen hittades inte.";
      return;
    }
    aktivId.value = id;
    const namn = sorteringsordningar.value.find((row) => row.id === id)?.namn;
    if (namn) {
      showMessage(`"${namn}" är nu satt som aktiv och visas överst i listan.`);
    }
  } catch {
    error.value = "Kunde inte markera aktiv sorteringsordning.";
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
    if (aktivId.value === id) {
      aktivId.value = null;
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
  switch (route.query.saved) {
    case "created": {
      showMessage("Sorteringsordning har skapats.");
      break;
    }
    case "updated": {
      showMessage("Sorteringsordning har uppdaterats.");
      break;
    }
    case "created-aktiv-failed": {
      showMessage(
        "Sorteringsordningen har skapats, men kunde inte markeras som aktiv. Markera den från listan.",
        "warning",
      );
      break;
    }
    case "updated-aktiv-failed": {
      showMessage(
        "Sorteringsordningen har uppdaterats, men kunde inte markeras som aktiv. Markera den från listan.",
        "warning",
      );
      break;
    }
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
      :type="messageType"
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
          filter-label="Sök på namn"
          :filter-attributes="['namn']"
        >
          <template #header="{ slotClass }">
            <FButton
              :class="slotClass"
              @click="router.push('/sorteringsordningar/skapa')"
            >
              Skapa ny
            </FButton>
          </template>
          <template #default="{ sortFilterResult }">
            <FInteractiveTable
              :rows="pinAktivFirst(sortFilterResult)"
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
                    <span v-if="row.id === aktivId" class="badge badge--aktiv">
                      Aktiv
                    </span>
                  </div>
                </FTableColumn>
                <FTableColumn
                  name="actions"
                  title="Åtgärder"
                  type="action"
                  shrink
                >
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
                    :disabled="row.id === aktivId"
                    :title="
                      row.id === aktivId
                        ? 'En sorteringsordning som är satt till aktiv kan inte tas bort'
                        : 'Ta bort sorteringsordning'
                    "
                    @click="handleDelete(row.id)"
                  >
                    Ta bort sorteringsordning
                  </FTableButton>
                  <FTableButton
                    label
                    :disabled="row.id === aktivId"
                    :title="
                      row.id === aktivId
                        ? 'Detta är redan den aktiva sorteringsordningen'
                        : 'Markera som aktiv'
                    "
                    @click="handleSetAktiv(row.id)"
                  >
                    Ange som aktiv
                  </FTableButton>
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
.sorteringsordningar-vy {
  padding: 1.5rem 2rem;
}

.table-section {
  margin-top: 1rem;
}

/* FKUI's own margins here are asymmetric - the button has 0.25rem top and
   1.5rem bottom - and align-self centres the margin box, so the contents
   end up 4px apart. Equal top and bottom margins make the centres
   coincide. Below 640px the controls stack and keep FKUI defaults. */
@media (min-width: 640px) {
  .table-section :deep(.sort-filter-dataset__toolbar__header),
  .table-section :deep(.text-field--inline),
  .table-section :deep(.select-field--inline) {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
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
  align-items: center;
}

.badge--aktiv {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: #d4edda;
  color: #155724;
}

.nowrap-cell {
  white-space: nowrap;
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
