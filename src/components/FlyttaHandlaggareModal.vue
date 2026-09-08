<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { FFormModal, FSelectField } from "@fkui/vue";
import type { HandlaggarId, Handlaggare } from "../types";
import { getHandlaggare, handlaggareKey } from "../utils/get-handlaggare";

const props = defineProps<{
  currentHandlaggarId: HandlaggarId | null;
}>();

const emit = defineEmits<{
  confirm: [handlaggarId: HandlaggarId];
  cancel: [];
}>();

const handlaggareLista = ref<Handlaggare[]>([]);
const isLoading = ref(true);
const loadError = ref<string | null>(null);

const value = ref({ handlaggareKey: "" });

const selectedHandlaggarId = computed<HandlaggarId | null>(() => {
  const found = handlaggareLista.value.find(
    (h) => handlaggareKey(h.handlaggarId) === value.value.handlaggareKey,
  );
  return found?.handlaggarId ?? null;
});

const isSameAsCurrent = computed(
  () =>
    !!props.currentHandlaggarId &&
    !!selectedHandlaggarId.value &&
    selectedHandlaggarId.value.typId === props.currentHandlaggarId.typId &&
    selectedHandlaggarId.value.varde === props.currentHandlaggarId.varde,
);

const canSubmit = computed(
  () => !!selectedHandlaggarId.value && !isSameAsCurrent.value,
);

const noSelectionError = ref(false);

const buttons = computed(() => [
  {
    label: "Flytta",
    event: "submit",
    type: "primary" as const,
    submitButton: true,
  },
  {
    label: "Avbryt",
    event: "dismiss",
    type: "secondary" as const,
    submitButton: false,
  },
]);

function onSubmit() {
  if (!selectedHandlaggarId.value) {
    noSelectionError.value = true;
    return;
  }
  if (!canSubmit.value) {
    return;
  }
  emit("confirm", selectedHandlaggarId.value);
}

function handlaggareLabel(h: Handlaggare): string {
  return `${h.fornamn} ${h.efternamn}`;
}

onMounted(async () => {
  try {
    handlaggareLista.value = await getHandlaggare();
  } catch {
    loadError.value = "Kunde inte hämta handläggarlistan. Försök igen senare.";
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <f-form-modal :value :buttons @submit="onSubmit" @cancel="emit('cancel')">
    <template #header>Flytta uppgift till annan handläggare</template>
    <template #input-text-fields>
      <p v-if="loadError" class="error-message">{{ loadError }}</p>
      <FSelectField v-else v-model="value.handlaggareKey" :disabled="isLoading">
        <template #label>Handläggare</template>
        <option value="" disabled>
          {{ isLoading ? "Hämtar handläggare..." : "Välj handläggare" }}
        </option>
        <option
          v-for="h in handlaggareLista"
          :key="handlaggareKey(h.handlaggarId)"
          :value="handlaggareKey(h.handlaggarId)"
        >
          {{ handlaggareLabel(h) }}
        </option>
      </FSelectField>
      <p v-if="isSameAsCurrent" class="error-message">
        Målhandläggaren kan inte vara densamma som uppgiftens nuvarande
        handläggare.
      </p>
      <p v-if="noSelectionError && !selectedHandlaggarId" class="error-message">
        Välj en handläggare innan du flyttar.
      </p>
    </template>
  </f-form-modal>
</template>

<style scoped>
.error-message {
  color: red;
  font-size: 0.875rem;
}
</style>
