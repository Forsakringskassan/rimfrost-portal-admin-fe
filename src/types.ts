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
