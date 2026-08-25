<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  FButton,
  FIcon,
  FInteractiveTable,
  FLoader,
  FSortFilterDataset,
  FTableColumn,
  useModal,
} from "@fkui/vue";
import { useRouter } from "vue-router";
import type { Sorteringsordning } from "../types";
import { deleteSorteringsordning } from "../utils/delete-sorteringsordning";
import { getDefaultSorteringsordning } from "../utils/get-default-sorteringsordning";
import { getSorteringsordningar } from "../utils/get-sorteringsordningar";
import { setDefaultSorteringsordning } from "../utils/set-default-sorteringsordning";

const router = useRouter();
const { confirmModal } = useModal();

const sorteringsordningar = ref<Sorteringsordning[]>([]);
const defaultId = ref<string | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

const sortableSorteringsordningar = computed(() =>
  sorteringsordningar.value.map((row) => ({
    ...row,
    entriesCount: row.entries.length,
  })),
);

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
  <div class="sorteringsordningar-vy">
    <div>
      <h1 id="main-title" class="h1">Sorteringsordningar</h1>
      <p class="body">Hantera sorteringsordningar för operativa uppgifter.</p>
    </div>
    <FButton @click="router.push('/sorteringsordningar/skapa')">
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

    <template v-if="!isLoading">
      <p v-if="sorteringsordningar.length === 0 && !error" class="body">
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
          <template #default="{ sortFilterResult }">
            <FInteractiveTable :rows="sortFilterResult" key-attribute="id">
              <template #default="{ row }">
                <FTableColumn name="namn" title="Namn" sortable>
                  {{ row.namn }}
                </FTableColumn>
                <FTableColumn name="skapad" title="Skapad" sortable>
                  {{ formatDate(row.skapad) }}
                </FTableColumn>
                <FTableColumn
                  name="entriesCount"
                  title="Antal regler"
                  shrink
                  sortable
                >
                  {{ row.entriesCount }}
                </FTableColumn>
                <FTableColumn name="default" title="Status" shrink>
                  <span
                    v-if="row.id === defaultId"
                    class="badge badge--default"
                  >
                    Default
                  </span>
                </FTableColumn>
                <FTableColumn name="actions" title="Åtgärder" shrink>
                  <div class="action-cell align-items-center">
                    <button
                      type="button"
                      class="icon-button"
                      title="Redigera sorteringsordning"
                      @click="
                        router.push(`/sorteringsordningar/${row.id}/redigera`)
                      "
                    >
                      <FIcon name="pen" />
                    </button>
                    <button
                      type="button"
                      class="icon-button"
                      :disabled="row.id === defaultId"
                      :title="
                        row.id === defaultId
                          ? 'En sorteringsordning som är satt till default kan inte tas bort'
                          : 'Ta bort sorteringsordning'
                      "
                      @click="handleDelete(row.id)"
                    >
                      <FIcon name="trashcan" />
                    </button>
                    <FButton
                      type="button"
                      variant="tertiary"
                      :disabled="row.id === defaultId"
                      @click="handleSetDefault(row.id)"
                    >
                      Ange som default
                    </FButton>
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
  margin-top: -4.25rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.action-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  align-self: center;
  color: inherit;
}

.icon-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
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
