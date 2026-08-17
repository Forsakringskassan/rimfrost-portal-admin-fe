import {
  expect,
  gotoAdmin,
  mockAdminApis,
  mockUppgift,
  test,
} from "./fixtures";

test.describe("operativa-uppgifter", () => {
  test("visar sidans rubrik", async ({ page }) => {
    await mockAdminApis(page);
    await gotoAdmin(page);
    await expect(
      page.getByRole("heading", { name: "operativa-uppgifter" }),
    ).toBeVisible();
  });

  test("visar uppgifter i listan", async ({ page }) => {
    await mockAdminApis(page, [mockUppgift]);
    await gotoAdmin(page);
    await expect(page.getByText("RTF_MANUELL")).toBeVisible();
    await expect(page.getByText("Handläggning")).toBeVisible();
  });

  test("visar sista 8 tecken av handlaggningId som ID", async ({ page }) => {
    await mockAdminApis(page, [mockUppgift]);
    await gotoAdmin(page);
    await expect(
      page.getByText(mockUppgift.handlaggningId.slice(-8)),
    ).toBeVisible();
  });

  test("visar tomt tillstånd när inga uppgifter finns", async ({ page }) => {
    await mockAdminApis(page, []);
    await gotoAdmin(page);
    await expect(
      page.getByText("Inga uppgifter hittades i OUL."),
    ).toBeVisible();
  });

  test("visar felmeddelande när backend inte svarar", async ({ page }) => {
    await page.route("**/admin/tasks", (route) => route.abort());
    await gotoAdmin(page).catch(() => null);
    await expect(
      page.getByText("Kunde inte hämta uppgifter från OUL", { exact: false }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("visar sorteringsdropdown", async ({ page }) => {
    await mockAdminApis(page);
    await gotoAdmin(page);
    await expect(page.getByRole("combobox")).toBeVisible();
  });
});
