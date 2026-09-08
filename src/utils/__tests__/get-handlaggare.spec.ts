import { afterEach, describe, expect, it, vi } from "vitest";
import { getHandlaggare } from "../get-handlaggare";

const mockHandlaggare = [
  {
    handlaggarId: {
      typId: "116759e4-18fd-4209-849c-90abbd257d22",
      varde: "111111111",
    },
    fornamn: "Lisa",
    efternamn: "Tass",
  },
  {
    handlaggarId: {
      typId: "116759e4-18fd-4209-849c-90abbd257d22",
      varde: "222222222",
    },
    fornamn: "Karl",
    efternamn: "von Dobermann",
  },
];

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

describe("getHandlaggare", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the handläggare list on success", async () => {
    mockFetch({ handlaggare: mockHandlaggare }, 200);
    const result = await getHandlaggare();
    expect(result).toHaveLength(2);
    expect(result[0].fornamn).toBe("Lisa");
    expect(result[1].handlaggarId.varde).toBe("222222222");
  });

  it("returns an empty array when the response has no handlaggare field", async () => {
    mockFetch({}, 200);
    const result = await getHandlaggare();
    expect(result).toEqual([]);
  });

  it("throws on HTTP errors", async () => {
    mockFetch({}, 500);
    await expect(getHandlaggare()).rejects.toThrow("HTTP 500");
  });

  it("throws on network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    await expect(getHandlaggare()).rejects.toThrow();
  });
});
