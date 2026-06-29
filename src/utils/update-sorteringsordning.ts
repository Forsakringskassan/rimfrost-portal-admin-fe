import { env } from "../config/env";
import type { Sorteringsordning, SorteringsordningSpec } from "../types";

export async function updateSorteringsordning(
  id: string,
  spec: SorteringsordningSpec,
): Promise<Sorteringsordning> {
  const response = await fetch(
    `${env.bffUrl}/admin/sorteringsordning/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(spec),
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}
