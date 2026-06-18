import { env } from "../config/env";
import type { OperativUppgiftItem } from "../types";

export async function unassignUppgift(
  uppgiftId: string,
): Promise<OperativUppgiftItem | null> {
  const response = await fetch(
    `${env.bffUrl}/admin/tasks/${encodeURIComponent(uppgiftId)}/unassign`,
    { method: "POST" },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}
