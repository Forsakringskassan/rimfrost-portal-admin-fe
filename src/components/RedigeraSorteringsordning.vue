<!-- eslint-disable camelcase -->
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  FButton,
  FSelectField,
  FTextField,
  FTooltip,
  FValidationForm,
  useModal,
} from "@fkui/vue";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
import type { Constraint, SortBy, SorteringsordningEntry } from "../types";
import { getDefaultSorteringsordning } from "../utils/get-default-sorteringsordning";
import { getSorteringsordning } from "../utils/get-sorteringsordning";
import { setDefaultSorteringsordning } from "../utils/set-default-sorteringsordning";
import { updateSorteringsordning } from "../utils/update-sorteringsordning";
import SorteringsordningPreview from "./SorteringsordningPreview.vue";

const DATE_FIELDS = new Set(["skapad", "planerad_till"]);
const EQ_ONLY_FIELDS = new Set(["uppgift_id"]);

const CONSTRAINT_FIELDS = [
  { value: "uppgift_id", label: "Uppgift-ID" },
  { value: "skapad", label: "Skapad (datum)" },
  { value: "planerad_till", label: "Planerad till (datum)" },
  { value: "status", label: "Status" },
  { value: "regel", label: "Regeltyp" },
  { value: "roll", label: "Roll" },
  { value: "verksamhetslogik", label: "Verksamhetslogik" },
  { value: "beskrivning", label: "Beskrivning" },
];

const SORT_FIELDS = CONSTRAINT_FIELDS;

const OPERATOR_LABELS: Record<string, string> = {
  eq: "är",
  contains: "innehåller",
  between: "är ett datum mellan",
  offset_to_now: "är de senaste",
};

const FIELD_EXAMPLES: Record<string, string> = {
  uppgift_id: "är 99999-1234-5678-9012.",
  skapad: "är ett datum mellan 2026-01-01 och 2026-01-31.",
  planerad_till: "är de senaste 7 dagarna.",
  status: "är Tilldelad.",
  regel: "är BEKRAFTA_BESLUT.",
  roll: "är Handläggning.",
  verksamhetslogik: "är VAB.",
  beskrivning: "innehåller husdjur.",
};

const VALUE_EXAMPLES: Record<string, string> = {
  uppgift_id: "99999-1234-5678-9012",
  status: "Tilldelad",
  regel: "BEKRAFTA_BESLUT",
  roll: "Handläggning",
  verksamhetslogik: "VAB",
  beskrivning: "husdjur",
};

function operatorsForField(field: string): string[] {
  if (DATE_FIELDS.has(field)) {
    return ["between", "offset_to_now"];
  }
  if (EQ_ONLY_FIELDS.has(field)) {
    return ["eq"];
  }
  return ["eq", "contains"];
}

function sortDirectionLabel(field: string, direction: "asc" | "desc"): string {
  if (DATE_FIELDS.has(field)) {
    return direction === "asc"
      ? "Stigande (äldst först)"
      : "Fallande (nyast först)";
  }
  return direction === "asc" ? "Stigande (A till Ö)" : "Fallande (Ö till A)";
}

function fieldLabel(field: string): string {
  return CONSTRAINT_FIELDS.find((f) => f.value === field)?.label ?? field;
}

interface FormConstraint {
  field: string;
  operator: string;
  value: string;
  from: string;
  to: string;
  offsetDays: number;
}

interface FormEntry {
  constraints: FormConstraint[];
  sortByField: string;
  sortByDirection: "asc" | "desc";
}

function newConstraint(): FormConstraint {
  return {
    field: "regel",
    operator: "eq",
    value: "",
    from: "",
    to: "",
    offsetDays: 7,
  };
}

function isConstraintUntouched(constraint: FormConstraint): boolean {
  const fresh = newConstraint();
  return (
    constraint.field === fresh.field &&
    constraint.operator === fresh.operator &&
    constraint.value === fresh.value &&
    constraint.from === fresh.from &&
    constraint.to === fresh.to &&
    constraint.offsetDays === fresh.offsetDays
  );
}

function isEntryUntouched(entry: FormEntry): boolean {
  const constraint = entry.constraints[0];
  return (
    entry.constraints.length === 1 &&
    constraint !== undefined &&
    isConstraintUntouched(constraint) &&
    entry.sortByField === "" &&
    entry.sortByDirection === "asc"
  );
}

function entryLabel(index: number): string {
  if (entries.value.length === 1) {
    return "Grupp 1";
  }
  if (index === 0) {
    return "Grupp 1 – Högst prioritet";
  }
  if (index === entries.value.length - 1) {
    return `Grupp ${index + 1} – Lägst prioritet`;
  }
  return `Grupp ${index + 1}`;
}

function newEntry(): FormEntry {
  return {
    constraints: [newConstraint()],
    sortByField: "",
    sortByDirection: "asc",
  };
}

function constraintToForm(c: Constraint): FormConstraint {
  return {
    field: c.field,
    operator: c.operator,
    value: c.value ?? "",
    from: c.from ?? "",
    to: c.to ?? "",
    offsetDays: c.offset
      ? Number.parseInt(c.offset.replace(/^-?(\d+)d$/, "$1"), 10)
      : 7,
  };
}

function entryToForm(e: SorteringsordningEntry): FormEntry {
  return {
    constraints: (e.constraints ?? []).map(constraintToForm),
    sortByField: e.sort_by?.field ?? "",
    sortByDirection: e.sort_by?.direction ?? "asc",
  };
}

const route = useRoute();
const router = useRouter();
const { confirmModal } = useModal();

const id = route.params.id as string;

const namn = ref("");
const entries = ref<FormEntry[]>([newEntry()]);
const isDefault = ref(false);
const isLoading = ref(false);
const isSubmitting = ref(false);
const error = ref<string | null>(null);

let pristineSnapshot = "";
const hasUnsavedChanges = computed(
  () =>
    pristineSnapshot !== "" &&
    JSON.stringify({
      namn: namn.value,
      entries: entries.value,
      isDefault: isDefault.value,
    }) !== pristineSnapshot,
);
let justSaved = false;

function handleBeforeUnload(event: BeforeUnloadEvent): void {
  if (hasUnsavedChanges.value && !justSaved) {
    event.preventDefault();
  }
}

onMounted(() => {
  window.addEventListener("beforeunload", handleBeforeUnload);
});

onUnmounted(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
});

onBeforeRouteLeave(async () => {
  if (!hasUnsavedChanges.value || justSaved) {
    return true;
  }
  return await confirmModal({
    heading: "Osparade ändringar",
    content:
      "Du har osparade ändringar som kommer att gå förlorade om du lämnar sidan. Vill du fortsätta?",
    confirm: "Lämna sidan",
    dismiss: "Stanna kvar",
  });
});

async function load(): Promise<void> {
  isLoading.value = true;
  error.value = null;
  try {
    const [sorteringsordning, defaultSO] = await Promise.all([
      getSorteringsordning(id),
      getDefaultSorteringsordning(),
    ]);
    if (sorteringsordning === null) {
      error.value = "Sorteringsordningen hittades inte.";
      return;
    }
    namn.value = sorteringsordning.namn;
    entries.value =
      sorteringsordning.entries.length > 0
        ? sorteringsordning.entries.map(entryToForm)
        : [newEntry()];
    isDefault.value = defaultSO?.id === id;
    pristineSnapshot = JSON.stringify({
      namn: namn.value,
      entries: entries.value,
      isDefault: isDefault.value,
    });
  } catch {
    error.value = "Kunde inte hämta sorteringsordningen.";
  } finally {
    isLoading.value = false;
  }
}

function addEntry(): void {
  entries.value.push(newEntry());
}

async function removeEntry(index: number): Promise<void> {
  const entry = entries.value[index];
  if (entry && !isEntryUntouched(entry)) {
    const confirmed = await confirmModal({
      heading: "Ta bort grupp",
      content:
        "Är du säker på att du vill ta bort gruppen och alla dess filter?",
      confirm: "Ta bort",
      dismiss: "Avbryt",
    });
    if (!confirmed) {
      return;
    }
  }
  entries.value.splice(index, 1);
}

function moveUp(index: number): void {
  if (index === 0) {
    return;
  }
  const item = entries.value.splice(index, 1)[0];
  entries.value.splice(index - 1, 0, item);
}

function moveDown(index: number): void {
  if (index === entries.value.length - 1) {
    return;
  }
  const item = entries.value.splice(index, 1)[0];
  entries.value.splice(index + 1, 0, item);
}

function addConstraint(entryIndex: number): void {
  entries.value[entryIndex]?.constraints.push(newConstraint());
}

async function removeConstraint(
  entryIndex: number,
  constraintIndex: number,
): Promise<void> {
  const constraint = entries.value[entryIndex]?.constraints[constraintIndex];
  if (constraint && !isConstraintUntouched(constraint)) {
    const confirmed = await confirmModal({
      heading: "Ta bort filter",
      content: "Är du säker på att du vill ta bort filtret?",
      confirm: "Ta bort",
      dismiss: "Avbryt",
    });
    if (!confirmed) {
      return;
    }
  }
  entries.value[entryIndex]?.constraints.splice(constraintIndex, 1);
}

function onFieldChange(constraint: FormConstraint): void {
  const ops = operatorsForField(constraint.field);
  if (!ops.includes(constraint.operator)) {
    constraint.operator = ops[0] ?? "eq";
  }
  constraint.value = "";
  constraint.from = "";
  constraint.to = "";
  constraint.offsetDays = 7;
}

function buildSpec() {
  return {
    namn: namn.value,
    entries: entries.value.map((e): SorteringsordningEntry => {
      const entry: SorteringsordningEntry = {};

      if (e.constraints.length > 0) {
        entry.constraints = e.constraints.map((c): Constraint => {
          if (c.operator === "between") {
            return {
              field: c.field,
              operator: "between",
              from: c.from,
              to: c.to,
            };
          }
          if (c.operator === "offset_to_now") {
            return {
              field: c.field,
              operator: "offset_to_now",
              offset: `-${c.offsetDays}d`,
            };
          }
          return {
            field: c.field,
            operator: c.operator as "eq" | "contains",
            value: c.value,
          };
        });
      }

      if (e.sortByField) {
        entry.sort_by = {
          field: e.sortByField,
          direction: e.sortByDirection,
        } as SortBy;
      }

      return entry;
    }),
  };
}

async function handleSubmit(): Promise<void> {
  error.value = null;
  isSubmitting.value = true;
  try {
    await updateSorteringsordning(id, buildSpec());
    if (isDefault.value) {
      await setDefaultSorteringsordning(id);
    }
    justSaved = true;
    await router.push("/sorteringsordningar");
  } catch {
    error.value = "Kunde inte spara sorteringsordningen.";
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="redigera-sorteringsordning">
    <h1 id="main-title" class="h1">Redigera sorteringsordning</h1>

    <p v-if="error" class="error-message">{{ error }}</p>

    <template v-if="!isLoading">
      <FValidationForm @submit.prevent="handleSubmit">
        <FTextField v-model="namn" v-validation.required> Namn </FTextField>
        <template #error-message>
          <p>Fyll i alla obligatoriska fält innan du fortsätter.</p>
        </template>

        <div
          v-for="(entry, entryIndex) in entries"
          :key="entryIndex"
          class="entry-card"
        >
          <div class="entry-header">
            <span class="entry-label">{{ entryLabel(entryIndex) }}</span>
            <div class="entry-controls">
              <FButton
                type="button"
                variant="tertiary"
                :disabled="entryIndex === 0"
                title="Flytta upp – ökar prioritet"
                @click="moveUp(entryIndex)"
              >
                ↑ Flytta upp
              </FButton>
              <FButton
                type="button"
                variant="tertiary"
                :disabled="entryIndex === entries.length - 1"
                title="Flytta ned – minskar prioritet"
                @click="moveDown(entryIndex)"
              >
                ↓ Flytta ned
              </FButton>
              <FButton
                type="button"
                variant="tertiary"
                :disabled="entries.length === 1"
                @click="removeEntry(entryIndex)"
              >
                Ta bort grupp
              </FButton>
            </div>
          </div>

          <div class="entry-body">
            <div class="subsection">
              <p class="subsection-heading">Vilka uppgifter ingår i gruppen?</p>
              <p class="subsection-description">
                En uppgift hamnar i den här gruppen om den uppfyller
                <strong>alla</strong> nedanstående filter. Lämna tomt för att
                fånga upp alla uppgifter som inte matchades av en tidigare
                grupp.
              </p>

              <div
                v-if="entry.constraints.length === 0"
                class="catchall-notice"
              >
                <strong>Ingen begränsning</strong> – den här gruppen fångar upp
                alla uppgifter som inte matchades av en tidigare grupp.
              </div>

              <div
                v-for="(constraint, constraintIndex) in entry.constraints"
                :key="constraintIndex"
                class="constraint-row"
              >
                <FSelectField
                  v-model="constraint.field"
                  @change="onFieldChange(constraint)"
                >
                  <template #label>Uppgiftens egenskap</template>
                  <template
                    v-if="entryIndex === 0 && constraintIndex === 0"
                    #tooltip
                  >
                    <FTooltip
                      screen-reader-text="Läs mer om uppgiftens egenskap"
                      header-tag="h2"
                    >
                      <template #header>Uppgiftens egenskap</template>
                      <template #body>
                        <p>
                          Väljer vilken egenskap hos uppgiften som ska filtreras
                          på – avgör om en uppgift hamnar i den här gruppen.
                          Sortering väljs separat nedan under "Sortering inom
                          gruppen".
                          <span class="tooltip-example">
                            Exempel:
                            <strong>{{ fieldLabel(constraint.field) }}</strong>
                            {{ FIELD_EXAMPLES[constraint.field] }}
                          </span>
                        </p>
                      </template>
                    </FTooltip>
                  </template>
                  <option
                    v-for="f in CONSTRAINT_FIELDS"
                    :key="f.value"
                    :value="f.value"
                  >
                    {{ f.label }}
                  </option>
                </FSelectField>

                <FSelectField v-model="constraint.operator">
                  <template #label>Villkor</template>
                  <template
                    v-if="entryIndex === 0 && constraintIndex === 0"
                    #tooltip
                  >
                    <FTooltip
                      screen-reader-text="Läs mer om villkor"
                      header-tag="h2"
                    >
                      <template #header>Villkor</template>
                      <template #body>
                        <template v-if="DATE_FIELDS.has(constraint.field)">
                          <p>Bestämmer hur datumet ska jämföras.</p>
                          <p>
                            <strong>"Är ett datum mellan"</strong>
                            <br />
                            Uppgiften måste ha ett datum som ligger inom det
                            angivna intervallet.
                            <span class="tooltip-example">
                              Exempel: Skapad
                              <strong>är ett datum mellan</strong>
                              2026-01-01 och 2026-01-31.
                            </span>
                          </p>
                          <p>
                            <strong>"Är de senaste"</strong>
                            <br />
                            Uppgiften måste ha ett datum inom det angivna
                            antalet dagar bakåt från idag.
                            <span class="tooltip-example">
                              Exempel: Planerad till
                              <strong>är de senaste</strong> 7 dagarna.
                            </span>
                          </p>
                        </template>
                        <template v-else>
                          <p>
                            Bestämmer hur uppgiftens egenskap ska jämföras med
                            värdet.
                          </p>
                          <p>
                            <strong>"Är"</strong>
                            <br />
                            Uppgiftens faktiska värde måste stämma exakt med
                            Värde.
                            <span class="tooltip-example">
                              Exempel: {{ fieldLabel(constraint.field) }}
                              <strong>är</strong>
                              {{ VALUE_EXAMPLES[constraint.field] }}
                            </span>
                          </p>
                          <p>
                            <strong>"Innehåller"</strong>
                            <br />
                            Värdet behöver bara finnas någonstans i uppgiftens
                            faktiska värde.
                            <span class="tooltip-example">
                              Exempel: {{ fieldLabel(constraint.field) }}
                              <strong>innehåller</strong>
                              {{ VALUE_EXAMPLES[constraint.field] }}
                            </span>
                          </p>
                        </template>
                      </template>
                    </FTooltip>
                  </template>
                  <option
                    v-for="op in operatorsForField(constraint.field)"
                    :key="op"
                    :value="op"
                  >
                    {{ OPERATOR_LABELS[op] }}
                  </option>
                </FSelectField>

                <template v-if="constraint.operator === 'between'">
                  <FTextField
                    v-model="constraint.from"
                    v-validation.required
                    type="date"
                  >
                    Från och med
                    <template
                      v-if="entryIndex === 0 && constraintIndex === 0"
                      #tooltip
                    >
                      <FTooltip
                        screen-reader-text="Läs mer om från och med"
                        header-tag="h2"
                      >
                        <template #header>Från och med</template>
                        <template #body>
                          <p>
                            Det tidigaste datumet som ska ingå i intervallet.
                            <span class="tooltip-example">
                              Exempel: {{ fieldLabel(constraint.field) }}
                              är ett datum mellan
                              <strong>2026-01-01</strong> och 2026-01-31.
                            </span>
                          </p>
                        </template>
                      </FTooltip>
                    </template>
                  </FTextField>
                  <FTextField
                    v-model="constraint.to"
                    v-validation.required
                    type="date"
                  >
                    Till och med
                    <template
                      v-if="entryIndex === 0 && constraintIndex === 0"
                      #tooltip
                    >
                      <FTooltip
                        screen-reader-text="Läs mer om till och med"
                        header-tag="h2"
                      >
                        <template #header>Till och med</template>
                        <template #body>
                          <p>
                            Det senaste datumet som ska ingå i intervallet.
                            <span class="tooltip-example">
                              Exempel: {{ fieldLabel(constraint.field) }}
                              är ett datum mellan 2026-01-01 och
                              <strong>2026-01-31</strong>.
                            </span>
                          </p>
                        </template>
                      </FTooltip>
                    </template>
                  </FTextField>
                </template>
                <template v-else-if="constraint.operator === 'offset_to_now'">
                  <FTextField
                    v-model="constraint.offsetDays"
                    v-validation.required
                    type="number"
                  >
                    Antal dagar tillbaka
                    <template
                      v-if="entryIndex === 0 && constraintIndex === 0"
                      #tooltip
                    >
                      <FTooltip
                        screen-reader-text="Läs mer om antal dagar tillbaka"
                        header-tag="h2"
                      >
                        <template #header>Antal dagar tillbaka</template>
                        <template #body>
                          <p>
                            Antal dagar bakåt i tiden, räknat från idag, som
                            uppgiften måste ligga inom.
                            <span class="tooltip-example">
                              Exempel: {{ fieldLabel(constraint.field) }} är de
                              senaste <strong>7</strong> dagarna.
                            </span>
                          </p>
                        </template>
                      </FTooltip>
                    </template>
                  </FTextField>
                </template>
                <template v-else>
                  <FTextField v-model="constraint.value" v-validation.required>
                    Värde
                    <template
                      v-if="entryIndex === 0 && constraintIndex === 0"
                      #tooltip
                    >
                      <FTooltip
                        screen-reader-text="Läs mer om värde"
                        header-tag="h2"
                      >
                        <template #header>Värde</template>
                        <template #body>
                          <p>
                            Det du jämför uppgiftens egenskap mot, enligt
                            villkoret ovan.
                            <span class="tooltip-example">
                              Exempel: {{ fieldLabel(constraint.field) }}
                              {{ OPERATOR_LABELS[constraint.operator] }}
                              <strong>{{
                                VALUE_EXAMPLES[constraint.field]
                              }}</strong
                              >.
                            </span>
                          </p>
                        </template>
                      </FTooltip>
                    </template>
                  </FTextField>
                </template>

                <FButton
                  type="button"
                  variant="tertiary"
                  @click="removeConstraint(entryIndex, constraintIndex)"
                >
                  Ta bort filter
                </FButton>
              </div>

              <FButton
                type="button"
                variant="tertiary"
                @click="addConstraint(entryIndex)"
              >
                + Lägg till filter
              </FButton>
            </div>

            <div class="subsection subsection--spaced">
              <p class="subsection-heading">Sortering inom gruppen</p>
              <p class="subsection-description">
                Välj i vilken ordning uppgifterna i den här gruppen ska visas.
              </p>

              <div class="sortby-row">
                <FSelectField v-model="entry.sortByField">
                  <template #label>Sortera efter</template>
                  <option value="">Ingen specifik ordning</option>
                  <option
                    v-for="f in SORT_FIELDS"
                    :key="f.value"
                    :value="f.value"
                  >
                    {{ f.label }}
                  </option>
                </FSelectField>

                <FSelectField
                  v-if="entry.sortByField"
                  v-model="entry.sortByDirection"
                >
                  <template #label>Ordning</template>
                  <option value="asc">
                    {{ sortDirectionLabel(entry.sortByField, "asc") }}
                  </option>
                  <option value="desc">
                    {{ sortDirectionLabel(entry.sortByField, "desc") }}
                  </option>
                </FSelectField>
              </div>
            </div>
          </div>
        </div>

        <div class="add-entry-row">
          <FButton type="button" variant="secondary" @click="addEntry">
            + Lägg till prioriteringsgrupp
          </FButton>
        </div>

        <SorteringsordningPreview :spec="buildSpec()" />

        <div class="default-row">
          <label class="default-label">
            <input v-model="isDefault" type="checkbox" />
            Sätt som default sorteringsordning
          </label>
        </div>

        <div class="form-actions">
          <FButton type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? "Sparar..." : "Spara ändringar" }}
          </FButton>
          <FButton
            type="button"
            variant="secondary"
            @click="router.push('/sorteringsordningar')"
          >
            Avbryt
          </FButton>
        </div>
      </FValidationForm>
    </template>
  </div>
</template>

<style scoped>
.redigera-sorteringsordning {
  padding: 1.5rem 2rem;
  max-width: 900px;
}

.tooltip-example {
  display: block;
  margin-top: 0.5rem;
}

.error-message {
  color: var(--color-error, red);
  padding: 0.5rem 0;
}

.entry-card {
  border: 1px solid var(--color-border, #dee2e6);
  border-radius: 0.375rem;
  margin-bottom: 1.5rem;
}

.entry-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
  background: var(--color-grey-100, #f8f9fa);
  border-bottom: 1px solid var(--color-border, #dee2e6);
  border-radius: 0.375rem 0.375rem 0 0;
}

.entry-label {
  font-weight: 600;
  font-size: 1.125rem;
  line-height: 3rem;
  flex: 1;
}

.entry-controls {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  flex-wrap: wrap;
}

.entry-controls button {
  margin: 0;
}

.entry-body {
  padding: 1.25rem 1rem;
}

.subsection {
  margin-bottom: 0;
}

.subsection--spaced {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-border, #dee2e6);
}

.subsection-heading {
  font-weight: 600;
  margin: 0 0 0.25rem;
}

.subsection-description {
  font-size: 0.875rem;
  color: var(--color-grey-600, #555);
  margin: 0 0 1rem;
}

.constraint-row {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.catchall-notice {
  font-size: 0.875rem;
  color: #0c5460;
  background-color: #d1ecf1;
  border: 1px solid #bee5eb;
  border-radius: 0.25rem;
  padding: 0.625rem 0.875rem;
  margin-bottom: 0.875rem;
}

.sortby-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.add-entry-row {
  margin-bottom: 1.5rem;
}

.default-row {
  margin-bottom: 1.5rem;
}

.default-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.95rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}
</style>
