/* eslint-disable camelcase -- to bring BE in with snake case */
import { afterEach, describe, expect, it, vi } from "vitest";
import { getSorteringsordningar } from "../get-sorteringsordningar";

const mockSorteringsordning = {
  id: "f47ac10b-0001-0001-0001-000000000001",
  skapad: "2026-06-01T10:00:00Z",
  entries: [
    {
      constraints: [{ field: "status", operator: "eq", value: "Ny" }],
      sort_by: { field: "skapad", direction: "asc" },
    },
  ],
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

describe("getSorteringsordningar", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the list on success", async () => {
    mockFetch([mockSorteringsordning]);
    const result = await getSorteringsordningar();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("f47ac10b-0001-0001-0001-000000000001");
    expect(result[0].entries[0].sort_by?.field).toBe("skapad");
  });

  it("returns empty array when response is empty", async () => {
    mockFetch([]);
    const result = await getSorteringsordningar();
    expect(result).toEqual([]);
  });

  it("returns empty array when response is not an array", async () => {
    mockFetch({ unexpected: "shape" });
    const result = await getSorteringsordningar();
    expect(result).toEqual([]);
  });

  it("throws on HTTP error", async () => {
    mockFetch({}, false);
    await expect(getSorteringsordningar()).rejects.toThrow("HTTP 500");
  });

  it("throws on network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    await expect(getSorteringsordningar()).rejects.toThrow();
  });
});
