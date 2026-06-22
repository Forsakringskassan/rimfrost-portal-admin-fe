import { env } from "../config/env";

export async function setDefaultSorteringsordning(
  id: string,
): Promise<null | undefined> {
  const response = await fetch(
    `${env.bffUrl}/admin/sorteringsordning/${encodeURIComponent(id)}/default`,
    { method: "PUT" },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
}
