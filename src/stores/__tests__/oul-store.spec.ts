import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import type { OperativUppgiftItem } from "../../types";
import { useOulStore } from "../oul-store";

const mockUppgift: OperativUppgiftItem = {
  uppgiftId: "test-001",
  handlaggningId: "h-001",
  skapad: "2025-01-10T08:00:00Z",
  status: "Ny",
  handlaggarId: null,
  planeradTill: "",
  utford: "",
  individer: [],
  regel: "RTF_MANUELL",
  beskrivning: "Test",
  verksamhetslogik: "VAB",
  roll: "Handläggning",
  url: "",
};

describe("oulStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("has correct initial state", () => {
    const store = useOulStore();
    expect(store.uppgiftLista).toEqual([]);
    expect(store.isLoading).toBe(false);
    expect(store.error).toBeNull();
    expect(store.hasFetched).toBe(false);
    expect(store.sortAttribute).toBe("skapad");
    expect(store.sortAscending).toBe(false);
  });

  describe("setUppgiftLista", () => {
    it("replaces the list and marks hasFetched", () => {
      const store = useOulStore();
      store.setUppgiftLista([mockUppgift]);
      expect(store.uppgiftLista).toHaveLength(1);
      expect(store.hasFetched).toBe(true);
    });

    it("clears the list when called with an empty array", () => {
      const store = useOulStore();
      store.setUppgiftLista([mockUppgift]);
      store.setUppgiftLista([]);
      expect(store.uppgiftLista).toEqual([]);
    });
  });

  describe("setLoading", () => {
    it("sets isLoading to true", () => {
      const store = useOulStore();
      store.setLoading(true);
      expect(store.isLoading).toBe(true);
    });

    it("sets isLoading to false", () => {
      const store = useOulStore();
      store.setLoading(true);
      store.setLoading(false);
      expect(store.isLoading).toBe(false);
    });
  });

  describe("setError", () => {
    it("sets error message and marks hasFetched", () => {
      const store = useOulStore();
      store.setError("something went wrong");
      expect(store.error).toBe("something went wrong");
      expect(store.hasFetched).toBe(true);
    });

    it("clears error when called with null", () => {
      const store = useOulStore();
      store.setError("oops");
      store.setError(null);
      expect(store.error).toBeNull();
    });
  });

  describe("setSort", () => {
    it("updates sortAttribute", () => {
      const store = useOulStore();
      store.setSort("regel", false);
      expect(store.sortAttribute).toBe("regel");
    });

    it("updates sortAscending", () => {
      const store = useOulStore();
      store.setSort("skapad", true);
      expect(store.sortAscending).toBe(true);
    });

    it("persists sort state across multiple calls", () => {
      const store = useOulStore();
      store.setSort("regel", true);
      store.setSort("skapad", false);
      expect(store.sortAttribute).toBe("skapad");
      expect(store.sortAscending).toBe(false);
    });
  });
});
