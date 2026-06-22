import { afterEach, describe, expect, it, vi } from "vitest";
import { unassignUppgift } from "../unassign-uppgift";

const mockUppgift = {
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

describe("unassignUppgift", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the unassigned uppgift on success", async () => {
    mockFetch(mockUppgift);
    const result = await unassignUppgift("test-001");
    expect(result).not.toBeNull();
    expect(result?.uppgiftId).toBe("test-001");
    expect(result?.status).toBe("Ny");
  });

  it("sends a POST to the correct URL with no body", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockUppgift),
    });
    vi.stubGlobal("fetch", fetchSpy);

    await unassignUppgift("test-001");

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/admin/tasks/test-001/unassign"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("returns null when not found (404)", async () => {
    mockFetch(null, false, 404);
    const result = await unassignUppgift("does-not-exist");
    expect(result).toBeNull();
  });

  it("throws on other HTTP errors", async () => {
    mockFetch({}, false, 500);
    await expect(unassignUppgift("test-001")).rejects.toThrow("HTTP 500");
  });

  it("throws on network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    await expect(unassignUppgift("test-001")).rejects.toThrow();
  });
});
