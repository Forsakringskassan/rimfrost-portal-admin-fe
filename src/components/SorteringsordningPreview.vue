<!-- eslint-disable camelcase -->
<script setup lang="ts">
import { ref, watch } from "vue";
import { FButton, FLoader } from "@fkui/vue";
import type { OperativUppgiftItem, SorteringsordningSpec } from "../types";
import { previewSorteringsordning } from "../utils/preview-sorteringsordning";

const props = defineProps<{
  spec: SorteringsordningSpec;
}>();

const PREVIEW_LIMIT = 20;

const isVisible = ref(false);
const isLoading = ref(false);
const error = ref<string | null>(null);
const total = ref(0);
const uppgifter = ref<OperativUppgiftItem[]>([]);

watch(
  () => props.spec,
  () => {
    if (isVisible.value) {
      fetchPreview();
    }
  },
  { deep: true },
);

async function fetchPreview(): Promise<void> {
  isLoading.value = true;
  error.value = null;
  try {
    const spec = props.spec.namn
      ? props.spec
      : { ...props.spec, namn: "Förhandsvisning" };
    const result = await previewSorteringsordning(spec, PREVIEW_LIMIT);
    total.value = result.total;
    uppgifter.value = result.operativa_uppgifter;
  } catch {
    error.value = "Kunde inte hämta förhandsvisning.";
  } finally {
    isLoading.value = false;
  }
}

async function toggle(): Promise<void> {
  isVisible.value = !isVisible.value;
  if (isVisible.value) {
    await fetchPreview();
  }
}

function formatDate(dateString: string | null): string {
  if (!dateString) {
    return "—";
  }
  return new Date(dateString).toLocaleDateString("sv-SE", {
    dateStyle: "short",
  });
}
</script>

<template>
  <div class="sorteringsordning-preview">
    <FButton type="button" variant="secondary" @click="toggle">
      {{ isVisible ? "Dölj förhandsvisning" : "Förhandsgranska" }}
    </FButton>

    <div v-if="isVisible" class="preview-panel">
      <FLoader
        :show="isLoading"
        :delay="true"
        style="display: block; margin: 1rem 0"
      >
        Hämtar förhandsvisning...
      </FLoader>

      <p v-if="error" class="preview-error">{{ error }}</p>

      <template v-if="!isLoading && !error">
        <p v-if="uppgifter.length === 0" class="preview-empty">
          Inga uppgifter matchade den här sorteringsordningen.
        </p>
        <template v-else>
          <p class="preview-count">
            Visar {{ uppgifter.length }} av {{ total }} uppgifter
          </p>
          <div class="preview-table-wrapper">
            <table class="preview-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Regel</th>
                  <th>Status</th>
                  <th>Roll</th>
                  <th>Planerad till</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in uppgifter" :key="row.uppgiftId">
                  <td class="preview-rank">{{ index + 1 }}</td>
                  <td>{{ row.regel }}</td>
                  <td>
                    <span
                      :class="`status-badge status-badge--${row.status?.toLowerCase() ?? 'okand'}`"
                    >
                      {{ row.status }}
                    </span>
                  </td>
                  <td>{{ row.roll }}</td>
                  <td>{{ formatDate(row.planeradTill) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<style scoped>
.sorteringsordning-preview {
  margin-bottom: 1.5rem;
}

.preview-panel {
  margin-top: 1rem;
  border: 1px solid var(--color-border, #dee2e6);
  border-radius: 0.375rem;
  padding: 1rem;
  background: var(--color-grey-50, #fafafa);
}

.preview-count {
  font-size: 0.875rem;
  color: var(--color-grey-600, #555);
  margin: 0 0 0.75rem;
}

.preview-empty {
  font-size: 0.875rem;
  color: var(--color-grey-600, #555);
  margin: 0;
}

.preview-error {
  color: var(--color-error, red);
  margin: 0;
}

.preview-table-wrapper {
  overflow-x: auto;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.preview-table th,
.preview-table td {
  text-align: left;
  padding: 0.375rem 0.625rem;
  border-bottom: 1px solid var(--color-border, #dee2e6);
}

.preview-table th {
  font-weight: 600;
  background: var(--color-grey-100, #f8f9fa);
}

.preview-table tr:last-child td {
  border-bottom: none;
}

.preview-rank {
  color: var(--color-grey-500, #888);
  font-variant-numeric: tabular-nums;
  width: 2rem;
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
</style>
