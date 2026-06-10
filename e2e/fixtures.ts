import { type Page, test as base } from "@playwright/test";
import type { OperativUppgiftItem } from "../src/types";

export const mockUppgift: OperativUppgiftItem = {
  uppgiftId: "a1b2c3d4-0001-0001-0001-000000000001",
  handlaggningId: "h1b2c3d4-0001-0001-0001-000000000001",
  skapad: "2025-01-10T08:00:00Z",
  status: "Ny",
  handlaggarId: null,
  planeradTill: "",
  utford: "",
  individer: [],
  regel: "RTF_MANUELL",
  beskrivning: "Testbeskrivning",
  verksamhetslogik: "VAB",
  roll: "Handläggning",
  url: "",
};

export async function mockAdminApis(
  page: Page,
  uppgifter: OperativUppgiftItem[] = [mockUppgift],
) {
  await page.route("**/admin/tasks", async (route) => {
    // eslint-disable-next-line camelcase -- API uses snake_case
    await route.fulfill({ json: { operativa_uppgifter: uppgifter } });
  });
}

export async function gotoAdmin(page: Page, path = "/") {
  const ready = page.waitForResponse("**/admin/tasks", { timeout: 30_000 });
  await page.goto(path);
  await ready;
}

export const test = base.extend<{ setupMocks: Page }>({
  setupMocks: async ({ page }, use) => {
    await mockAdminApis(page);
    await gotoAdmin(page);
    await use(page);
  },
});

export { expect } from "@playwright/test";
