import { env } from "../config/env";
import type { Sorteringsordning } from "../types";

export async function getSorteringsordning(
  id: string,
): Promise<Sorteringsordning | null> {
  const response = await fetch(
    `${env.bffUrl}/admin/sorteringsordning/${encodeURIComponent(id)}`,
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}
