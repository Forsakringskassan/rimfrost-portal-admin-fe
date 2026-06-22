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

const mockPage = { total: 1, items: [mockSorteringsordning] };

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

  it("returns a page with items on success", async () => {
    mockFetch(mockPage);
    const result = await getSorteringsordningar(10);
    expect(result.total).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe("f47ac10b-0001-0001-0001-000000000001");
    expect(result.items[0].entries[0].sort_by?.field).toBe("skapad");
  });

  it("returns empty page when OUL returns none", async () => {
    mockFetch({ total: 0, items: [] });
    const result = await getSorteringsordningar(10);
    expect(result.total).toBe(0);
    expect(result.items).toEqual([]);
  });

  it("sends limit and default offset as query params", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockPage),
    });
    vi.stubGlobal("fetch", fetchSpy);

    await getSorteringsordningar(25);

    const [url] = fetchSpy.mock.calls[0] as [string];
    expect(url).toContain("limit=25");
    expect(url).toContain("offset=0");
  });

  it("forwards a custom offset", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockPage),
    });
    vi.stubGlobal("fetch", fetchSpy);

    await getSorteringsordningar(10, 20);

    const [url] = fetchSpy.mock.calls[0] as [string];
    expect(url).toContain("offset=20");
  });

  it("throws on HTTP error", async () => {
    mockFetch({}, false);
    await expect(getSorteringsordningar(10)).rejects.toThrow("HTTP 500");
  });

  it("throws on network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    await expect(getSorteringsordningar(10)).rejects.toThrow();
  });
});
