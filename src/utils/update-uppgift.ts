import { env } from "../config/env";
import type { OperativUppgiftItem, UpdateUppgiftRequest } from "../types";

export async function updateUppgift(
  uppgiftId: string,
  request: UpdateUppgiftRequest,
): Promise<OperativUppgiftItem | null> {
  const response = await fetch(
    `${env.bffUrl}/admin/tasks/${encodeURIComponent(uppgiftId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}
