import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useOulStore } from "../../stores/oul-store";
import { getOulUppgifter } from "../get-oul-uppgifter";

const mockItem = {
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

function mockFetch(data: unknown, ok = true) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      status: ok ? 200 : 500,
      json: () => Promise.resolve(data),
    }),
  );
}

describe("getOulUppgifter", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("populates the store with items on success", async () => {
    // eslint-disable-next-line camelcase -- API uses snake_case
    mockFetch({ operativa_uppgifter: [mockItem] });
    const store = useOulStore();
    await getOulUppgifter();
    expect(store.uppgiftLista).toHaveLength(1);
    expect(store.uppgiftLista[0].uppgiftId).toBe("test-001");
  });

  it("filters out items missing uppgiftId", async () => {
    mockFetch({
      // eslint-disable-next-line camelcase -- API uses snake_case
      operativa_uppgifter: [mockItem, { handlaggningId: "no-id" }],
    });
    const store = useOulStore();
    await getOulUppgifter();
    expect(store.uppgiftLista).toHaveLength(1);
  });

  it("handles an empty list", async () => {
    // eslint-disable-next-line camelcase -- API uses snake_case
    mockFetch({ operativa_uppgifter: [] });
    const store = useOulStore();
    await getOulUppgifter();
    expect(store.uppgiftLista).toEqual([]);
    expect(store.error).toBeNull();
  });

  it("sets error on HTTP error response", async () => {
    mockFetch({}, false);
    const store = useOulStore();
    await expect(getOulUppgifter()).rejects.toThrow();
    expect(store.error).not.toBeNull();
    expect(store.uppgiftLista).toEqual([]);
  });

  it("sets error on network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    const store = useOulStore();
    await expect(getOulUppgifter()).rejects.toThrow();
    expect(store.error).not.toBeNull();
  });

  it("clears a previous error on successful fetch", async () => {
    mockFetch({}, false);
    const store = useOulStore();
    await getOulUppgifter().catch(() => undefined);
    expect(store.error).not.toBeNull();

    // eslint-disable-next-line camelcase -- API uses snake_case
    mockFetch({ operativa_uppgifter: [mockItem] });
    await getOulUppgifter();
    expect(store.error).toBeNull();
  });

  it("sets isLoading to false when done", async () => {
    // eslint-disable-next-line camelcase -- API uses snake_case
    mockFetch({ operativa_uppgifter: [] });
    const store = useOulStore();
    await getOulUppgifter();
    expect(store.isLoading).toBe(false);
  });
});
