import { env } from "../config/env";

export async function deleteSorteringsordning(
  id: string,
): Promise<null | undefined> {
  const response = await fetch(
    `${env.bffUrl}/admin/sorteringsordning/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
}
