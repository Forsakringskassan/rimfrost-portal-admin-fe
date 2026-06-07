import { env } from "../config/env";
import { useOulStore } from "../stores/oul-store";

export async function getOulUppgifter(): Promise<void> {
  const store = useOulStore();
  store.setLoading(true);
  store.setError(null);

  try {
    const bffUrl = env.bffUrl;
    const response = await fetch(`${bffUrl}/admin/tasks`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const items = Array.isArray(data.operativa_uppgifter)
      ? data.operativa_uppgifter.filter(
          (item: { uppgiftId?: unknown }) => item?.uppgiftId != null,
        )
      : [];
    store.setUppgiftLista(items);
  } catch (error) {
    store.setError("Kunde inte hämta uppgifter från OUL. Försök igen senare.");
    console.error("Error loading OUL tasks:", error);
    throw error;
  } finally {
    store.setLoading(false);
  }
}
