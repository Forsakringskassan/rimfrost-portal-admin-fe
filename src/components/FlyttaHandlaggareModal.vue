<script setup lang="ts">
import { computed, ref } from "vue";
import { FFormModal, FTextField } from "@fkui/vue";
import type { HandlaggarId } from "../types";

const props = defineProps<{
  currentHandlaggarId: HandlaggarId | null;
}>();

const emit = defineEmits<{
  confirm: [handlaggarId: HandlaggarId];
  cancel: [];
}>();

const value = ref({
  typId: "",
  varde: "",
});

const isSameAsCurrent = computed(
  () =>
    !!props.currentHandlaggarId &&
    value.value.typId === props.currentHandlaggarId.typId &&
    value.value.varde === props.currentHandlaggarId.varde,
);

const canSubmit = computed(
  () =>
    value.value.typId.trim() !== "" &&
    value.value.varde.trim() !== "" &&
    !isSameAsCurrent.value,
);

const buttons = computed(() => [
  {
    label: "Flytta",
    event: "submit",
    type: "primary" as const,
    submitButton: true,
    disabled: !canSubmit.value,
  },
  {
    label: "Avbryt",
    event: "dismiss",
    type: "secondary" as const,
    submitButton: false,
  },
]);

function onSubmit() {
  if (!canSubmit.value) {
    return;
  }
  emit("confirm", { typId: value.value.typId, varde: value.value.varde });
}
</script>

<template>
  <f-form-modal :value :buttons @submit="onSubmit" @cancel="emit('cancel')">
    <template #header>Flytta uppgift till annan handläggare</template>
    <template #input-text-fields>
      <p class="body">
        Ange målhandläggarens identitet. Tillfällig lösning i väntan på en
        riktig handläggarkatalog.
      </p>
      <f-text-field v-model="value.typId">Typ-ID</f-text-field>
      <f-text-field v-model="value.varde">Värde</f-text-field>
      <p v-if="isSameAsCurrent" class="error-message">
        Målhandläggaren kan inte vara densamma som uppgiftens nuvarande
        handläggare.
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
