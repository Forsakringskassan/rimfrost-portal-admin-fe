import { env } from "../config/env";
import type { HandlaggarId, Handlaggare } from "../types";

export function handlaggareKey(id: HandlaggarId): string {
  return `${id.typId}|${id.varde}`;
}

export async function getHandlaggare(): Promise<Handlaggare[]> {
  const response = await fetch(`${env.bffUrl}/admin/handlaggare`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data.handlaggare) ? data.handlaggare : [];
}
