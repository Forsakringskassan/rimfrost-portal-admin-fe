import { FButton, FValidationForm } from "@fkui/vue";
import { shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RedigeraSorteringsordning from "../RedigeraSorteringsordning.vue";

const push = vi.fn();

vi.mock("vue-router", () => ({
  useRoute: () => ({ params: { id: "so-1" } }),
  useRouter: () => ({ push }),
  onBeforeRouteLeave: vi.fn(),
}));

vi.mock("@fkui/vue", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@fkui/vue")>()),
  useModal: () => ({ confirmModal: vi.fn().mockResolvedValue(true) }),
}));

vi.mock("../../utils/get-sorteringsordning", () => ({
  getSorteringsordning: vi.fn(),
}));
vi.mock("../../utils/get-aktiv-sorteringsordning", () => ({
  getAktivSorteringsordning: vi.fn(),
}));
vi.mock("../../utils/update-sorteringsordning", () => ({
  updateSorteringsordning: vi.fn(),
}));
vi.mock("../../utils/set-aktiv-sorteringsordning", () => ({
  setAktivSorteringsordning: vi.fn(),
}));

const { getSorteringsordning } =
  await import("../../utils/get-sorteringsordning");
const { getAktivSorteringsordning } =
  await import("../../utils/get-aktiv-sorteringsordning");

const sorteringsordning = {
  id: "so-1",
  namn: "Min sorteringsordning",
  skapad: "2026-06-01T10:00:00Z",
  entries: [],
};

function mountView() {
  return shallowMount(RedigeraSorteringsordning, {
    global: { directives: { validation: {} } },
  });
}

async function flush(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("RedigeraSorteringsordning", () => {
  beforeEach(() => {
    vi.mocked(getSorteringsordning).mockReset();
    vi.mocked(getAktivSorteringsordning).mockReset();
    push.mockReset();
  });

  it("hides the form when the fetch throws", async () => {
    vi.mocked(getSorteringsordning).mockRejectedValue(new Error("BFF down"));
    vi.mocked(getAktivSorteringsordning).mockResolvedValue(null);

    const wrapper = mountView();
    await flush();

    expect(wrapper.find(".error-message").text()).toBe(
      "Kunde inte hämta sorteringsordningen.",
    );
    expect(wrapper.findComponent(FValidationForm).exists()).toBe(false);
    expect(wrapper.find(".form-actions").exists()).toBe(true);
  });

  it("hides the form when the sorteringsordning is not found", async () => {
    vi.mocked(getSorteringsordning).mockResolvedValue(null);
    vi.mocked(getAktivSorteringsordning).mockResolvedValue(null);

    const wrapper = mountView();
    await flush();

    expect(wrapper.find(".error-message").text()).toBe(
      "Sorteringsordningen hittades inte.",
    );
    expect(wrapper.findComponent(FValidationForm).exists()).toBe(false);
  });

  it("renders the form once a retry succeeds", async () => {
    vi.mocked(getSorteringsordning).mockRejectedValueOnce(
      new Error("BFF down"),
    );
    vi.mocked(getAktivSorteringsordning).mockResolvedValue(null);

    const wrapper = mountView();
    await flush();
    expect(wrapper.findComponent(FValidationForm).exists()).toBe(false);

    vi.mocked(getSorteringsordning).mockResolvedValue(sorteringsordning);
    const [retryButton] = wrapper
      .find(".form-actions")
      .findAllComponents(FButton);
    await retryButton.trigger("click");
    await flush();

    expect(wrapper.find(".error-message").exists()).toBe(false);
    expect(wrapper.findComponent(FValidationForm).exists()).toBe(true);
  });

  it("renders the form on a successful load", async () => {
    vi.mocked(getSorteringsordning).mockResolvedValue(sorteringsordning);
    vi.mocked(getAktivSorteringsordning).mockResolvedValue(null);

    const wrapper = mountView();
    await flush();

    expect(wrapper.find(".error-message").exists()).toBe(false);
    expect(wrapper.findComponent(FValidationForm).exists()).toBe(true);
  });
});
