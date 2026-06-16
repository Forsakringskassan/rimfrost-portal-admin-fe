import { afterEach, describe, expect, it, vi } from "vitest";
import { setDefaultSorteringsordning } from "../set-default-sorteringsordning";

function mockFetch(status: number) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
    }),
  );
}

describe("setDefaultSorteringsordning", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("resolves without a value on success (204)", async () => {
    mockFetch(204);
    const result = await setDefaultSorteringsordning("some-id");
    expect(result).toBeUndefined();
  });

  it("sends a PUT request to the correct URL", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    vi.stubGlobal("fetch", fetchSpy);

    await setDefaultSorteringsordning("f47ac10b-0001-0001-0001-000000000001");

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "/admin/sorteringsordning/f47ac10b-0001-0001-0001-000000000001/default",
      ),
      expect.objectContaining({ method: "PUT" }),
    );
  });

  it("returns null when not found (404)", async () => {
    mockFetch(404);
    const result = await setDefaultSorteringsordning("does-not-exist");
    expect(result).toBeNull();
  });

  it("throws on other HTTP errors", async () => {
    mockFetch(500);
    await expect(setDefaultSorteringsordning("some-id")).rejects.toThrow(
      "HTTP 500",
    );
  });

  it("throws on network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    await expect(setDefaultSorteringsordning("some-id")).rejects.toThrow();
  });
});
