import { env } from "../config/env";
import type { SorteringsordningSpec, UppgiftPreviewResult } from "../types";

export async function previewSorteringsordning(
  spec: SorteringsordningSpec,
  limit: number,
  offset = 0,
): Promise<UppgiftPreviewResult> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  const response = await fetch(
    `${env.bffUrl}/admin/sorteringsordning/preview?${params}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(spec),
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}
