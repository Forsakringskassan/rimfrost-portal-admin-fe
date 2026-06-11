import { env } from "../config/env";
import type { Sorteringsordning } from "../types";

export async function getSorteringsordningar(): Promise<Sorteringsordning[]> {
  const response = await fetch(`${env.bffUrl}/admin/sorteringsordning`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}
