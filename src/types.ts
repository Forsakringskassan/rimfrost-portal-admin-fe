export interface SortBy {
  field: string;
  direction: "asc" | "desc";
}

export interface Constraint {
  field: string;
  operator: "eq" | "contains" | "between" | "offset_to_now";
  value?: string;
  from?: string;
  to?: string;
  offset?: string;
}

export interface SorteringsordningEntry {
  constraints?: Constraint[];
  sort_by?: SortBy;
}

export interface Sorteringsordning {
  id: string;
  skapad: string;
  entries: SorteringsordningEntry[];
}

export interface SorteringsordningSpec {
  entries: SorteringsordningEntry[];
}

export interface UpdateUppgiftRequest {
  handlaggarId?: HandlaggarId | null;
}

export interface UppgiftPreviewResult {
  total: number;

  operativa_uppgifter: OperativUppgiftItem[];
}

export interface HandlaggarId {
  typId: string;
  varde: string;
}

export interface OperativUppgiftItem {
  uppgiftId: string;
  handlaggningId: string;
  skapad: string;
  status: string;
  handlaggarId: HandlaggarId | null;
  planeradTill: string;
  utford: string;
  individer: HandlaggarId[];
  regel: string;
  beskrivning: string;
  verksamhetslogik: string;
  roll: string;
  url: string;
}
