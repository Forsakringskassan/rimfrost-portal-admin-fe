import { defineStore } from "pinia";
import type { OperativUppgiftItem } from "../types";

export const useOulStore = defineStore("oulStore", {
  state: () => ({
    uppgiftLista: [] as OperativUppgiftItem[],
    isLoading: false,
    error: null as string | null,
    hasFetched: false,
  }),
  actions: {
    setUppgiftLista(uppgiftLista: OperativUppgiftItem[]) {
      this.uppgiftLista = uppgiftLista;
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
  },
});
