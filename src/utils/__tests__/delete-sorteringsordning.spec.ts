import { afterEach, describe, expect, it, vi } from "vitest";
import { deleteSorteringsordning } from "../delete-sorteringsordning";

function mockFetch(status: number) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
    }),
  );
}

describe("deleteSorteringsordning", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("resolves without a value on success (204)", async () => {
    mockFetch(204);
    const result = await deleteSorteringsordning("some-id");
    expect(result).toBeUndefined();
  });

  it("sends a DELETE request to the correct URL", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    vi.stubGlobal("fetch", fetchSpy);

    await deleteSorteringsordning("f47ac10b-0001-0001-0001-000000000001");

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "/admin/sorteringsordning/f47ac10b-0001-0001-0001-000000000001",
      ),
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("returns null when not found (404)", async () => {
    mockFetch(404);
    const result = await deleteSorteringsordning("does-not-exist");
    expect(result).toBeNull();
  });

  it("throws on conflict (409) when deleting the default", async () => {
    mockFetch(409);
    await expect(deleteSorteringsordning("some-id")).rejects.toThrow(
      "HTTP 409",
    );
  });

  it("throws on network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    await expect(deleteSorteringsordning("some-id")).rejects.toThrow();
  });
});
