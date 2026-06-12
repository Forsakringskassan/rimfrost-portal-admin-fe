import { env } from "../config/env";
import type { Sorteringsordning, SorteringsordningSpec } from "../types";

export async function createSorteringsordning(
  spec: SorteringsordningSpec,
): Promise<Sorteringsordning> {
  const response = await fetch(`${env.bffUrl}/admin/sorteringsordning`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(spec),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}
