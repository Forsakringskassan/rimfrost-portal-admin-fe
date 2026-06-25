import { defineStore } from "pinia";
import type { OperativUppgiftItem } from "../types";

export const useOulStore = defineStore("oulStore", {
  state: () => ({
    uppgiftLista: [] as OperativUppgiftItem[],
    totalUppgifter: 0,
    isLoading: false,
    error: null as string | null,
    hasFetched: false,
    sortAttribute: "skapad",
    sortAscending: false,
  }),
  actions: {
    setUppgiftLista(uppgiftLista: OperativUppgiftItem[], total: number) {
      this.uppgiftLista = uppgiftLista;
      this.totalUppgifter = total;
      this.hasFetched = true;
    },
    setLoading(loading: boolean) {
      this.isLoading = loading;
    },
    setError(error: string | null) {
      this.error = error;
      if (error !== null) {
        this.hasFetched = true;
      }
    },
    setSort(attribute: string, ascending: boolean) {
      this.sortAttribute = attribute;
      this.sortAscending = ascending;
    },
  },
});
