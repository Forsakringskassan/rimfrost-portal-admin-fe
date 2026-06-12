import { afterEach, describe, expect, it, vi } from "vitest";
import type { UpdateUppgiftRequest } from "../../types";
import { updateUppgift } from "../update-uppgift";

const mockRequest: UpdateUppgiftRequest = {
  handlaggarId: { typId: "kortnummer", varde: "12345" },
};

const mockUpdated = {
  uppgiftId: "test-001",
  handlaggningId: "h-001",
  skapad: "2025-01-10T08:00:00Z",
  status: "Tilldelad",
  handlaggarId: { typId: "kortnummer", varde: "12345" },
  planeradTill: "",
  utford: "",
  individer: [],
  regel: "RTF_MANUELL",
  beskrivning: "Test",
  verksamhetslogik: "VAB",
  roll: "Handläggning",
  url: "",
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

describe("updateUppgift", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the updated uppgift on success", async () => {
    mockFetch(mockUpdated, 200);
    const result = await updateUppgift("test-001", mockRequest);
    expect(result).not.toBeNull();
    expect(result?.uppgiftId).toBe("test-001");
    expect(result?.status).toBe("Tilldelad");
  });

  it("sends a PATCH with the request body as JSON", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockUpdated),
    });
    vi.stubGlobal("fetch", fetchSpy);

    await updateUppgift("test-001", mockRequest);

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/admin/tasks/test-001"),
      expect.objectContaining({
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockRequest),
      }),
    );
  });

  it("returns null when not found (404)", async () => {
    mockFetch(null, 404);
    const result = await updateUppgift("does-not-exist", mockRequest);
    expect(result).toBeNull();
  });

  it("throws on other HTTP errors", async () => {
    mockFetch({}, 500);
    await expect(updateUppgift("test-001", mockRequest)).rejects.toThrow(
      "HTTP 500",
    );
  });

  it("throws on network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    await expect(updateUppgift("test-001", mockRequest)).rejects.toThrow();
  });
});
