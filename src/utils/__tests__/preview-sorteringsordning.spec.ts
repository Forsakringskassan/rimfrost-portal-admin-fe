/* eslint-disable camelcase -- Allows snake case from BE */
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SorteringsordningSpec } from "../../types";
import { previewSorteringsordning } from "../preview-sorteringsordning";

const mockSpec: SorteringsordningSpec = {
  entries: [
    {
      constraints: [{ field: "status", operator: "eq", value: "Ny" }],
      sort_by: { field: "skapad", direction: "asc" },
    },
  ],
};

const mockPreviewResult = {
  total: 2,
  operativa_uppgifter: [
    {
      uppgiftId: "a1b2c3d4-0001-0001-0001-000000000001",
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
    },
  ],
};

function mockFetch(data: unknown, ok = true, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      status,
      json: () => Promise.resolve(data),
    }),
  );
}

describe("previewSorteringsordning", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns preview result on success", async () => {
    mockFetch(mockPreviewResult);
    const result = await previewSorteringsordning(mockSpec, 10);
    expect(result.total).toBe(2);
    expect(result.operativa_uppgifter).toHaveLength(1);
    expect(result.operativa_uppgifter[0].uppgiftId).toBe(
      "a1b2c3d4-0001-0001-0001-000000000001",
    );
  });

  it("sends a POST with spec body, limit, and default offset", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockPreviewResult),
    });
    vi.stubGlobal("fetch", fetchSpy);

    await previewSorteringsordning(mockSpec, 20);

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/admin/sorteringsordning/preview");
    expect(url).toContain("limit=20");
    expect(url).toContain("offset=0");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual(
      expect.objectContaining({ "Content-Type": "application/json" }),
    );
    expect(init.body).toBe(JSON.stringify(mockSpec));
  });

  it("forwards a custom offset", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockPreviewResult),
    });
    vi.stubGlobal("fetch", fetchSpy);

    await previewSorteringsordning(mockSpec, 10, 50);

    const [url] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("offset=50");
  });

  it("throws on bad request (400)", async () => {
    mockFetch({}, false, 400);
    await expect(previewSorteringsordning(mockSpec, 10)).rejects.toThrow(
      "HTTP 400",
    );
  });

  it("throws on network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    await expect(previewSorteringsordning(mockSpec, 10)).rejects.toThrow();
  });
});
