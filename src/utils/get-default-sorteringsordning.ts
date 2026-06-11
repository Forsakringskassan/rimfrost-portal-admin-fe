import { env } from "../config/env";
import type { Sorteringsordning } from "../types";

export async function getDefaultSorteringsordning(): Promise<Sorteringsordning | null> {
  const response = await fetch(`${env.bffUrl}/admin/sorteringsordning/default`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}
