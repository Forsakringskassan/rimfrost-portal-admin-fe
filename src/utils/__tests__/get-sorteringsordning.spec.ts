/* eslint-disable camelcase -- Allows snake case from BE */
import { afterEach, describe, expect, it, vi } from "vitest";
import { getSorteringsordning } from "../get-sorteringsordning";

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

function mockFetch(data: unknown, status: number) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data),
    }),
  );
}

describe("getSorteringsordning", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the sorteringsordning on success", async () => {
    mockFetch(mockSorteringsordning, 200);
    const result = await getSorteringsordning(
      "f47ac10b-0001-0001-0001-000000000001",
    );
    expect(result).not.toBeNull();
    expect(result?.id).toBe("f47ac10b-0001-0001-0001-000000000001");
    expect(result?.entries[0].sort_by?.field).toBe("skapad");
  });

  it("returns null when not found (404)", async () => {
    mockFetch(null, 404);
    const result = await getSorteringsordning("does-not-exist");
    expect(result).toBeNull();
  });

  it("throws on other HTTP errors", async () => {
    mockFetch({}, 500);
    await expect(getSorteringsordning("some-id")).rejects.toThrow("HTTP 500");
  });

  it("throws on network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    await expect(getSorteringsordning("some-id")).rejects.toThrow();
  });
});
