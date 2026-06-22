import { env } from "../config/env";
import type { SorteringsordningPage } from "../types";

export async function getSorteringsordningar(
  limit: number,
  offset = 0,
): Promise<SorteringsordningPage> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  const response = await fetch(
    `${env.bffUrl}/admin/sorteringsordning?${params}`,
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}
