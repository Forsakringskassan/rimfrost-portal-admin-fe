/* eslint-disable camelcase -- Allows snake case from BE */
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SorteringsordningSpec } from "../../types";
import { createSorteringsordning } from "../create-sorteringsordning";

const mockSpec: SorteringsordningSpec = {
  entries: [
    {
      constraints: [{ field: "status", operator: "eq", value: "Ny" }],
      sort_by: { field: "skapad", direction: "asc" },
    },
  ],
};

const mockCreated = {
  id: "f47ac10b-0001-0001-0001-000000000001",
  skapad: "2026-06-11T09:00:00Z",
  entries: mockSpec.entries,
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

describe("createSorteringsordning", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the created sorteringsordning on success", async () => {
    mockFetch(mockCreated, 201);
    const result = await createSorteringsordning(mockSpec);
    expect(result.id).toBe("f47ac10b-0001-0001-0001-000000000001");
    expect(result.entries).toHaveLength(1);
  });

  it("sends the spec as JSON in the request body", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve(mockCreated),
    });
    vi.stubGlobal("fetch", fetchSpy);

    await createSorteringsordning(mockSpec);

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/admin/sorteringsordning"),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockSpec),
      }),
    );
  });

  it("throws on 400 bad request", async () => {
    mockFetch({}, 400);
    await expect(createSorteringsordning(mockSpec)).rejects.toThrow("HTTP 400");
  });

  it("throws on other HTTP errors", async () => {
    mockFetch({}, 500);
    await expect(createSorteringsordning(mockSpec)).rejects.toThrow("HTTP 500");
  });

  it("throws on network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    await expect(createSorteringsordning(mockSpec)).rejects.toThrow();
  });
});
