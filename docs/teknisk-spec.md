# Teknisk spec — Portal Admin Frontend (PAFE)

## Översikt

Fristående administrations-SPA (Vue 3 + TypeScript, Pinia, Vue Router) med FKUI som
komponentbibliotek. Ingen module federation — appen körs inte inbäddad i handläggarportalen.
All data hämtas via `fetch` mot en enda BFF, ingen websocket/polling.

## Komponentstruktur

```text
src/
├── router/            # Ruttdefinitioner: /operativa-uppgifter, /statistik, /konfiguration(/...)
├── components/         # AdminSektioner (vänsternavigering), SorteringsordningPreview m.fl.
├── stores/            # Pinia: oul-store (uppgiftslista), sorteringsordning-relaterat state
├── utils/             # fetch-wrappers mot BFF
└── types.ts           # Domänmodell
```

## API-specifikationer

Ingen extern OpenAPI-specifikation — kontraktet definieras av Portal Admin BFF.

| Metod  | Sökväg                                  | Beskrivning                           |
| ------ | --------------------------------------- | ------------------------------------- |
| GET    | `/admin/tasks`                          | Samtliga operativa uppgifter          |
| POST   | `/admin/tasks/{uppgiftId}/unassign`     | Ta bort tilldelning av uppgift        |
| GET    | `/admin/sorteringsordning`              | Lista sorteringsordningar (paginerad) |
| GET    | `/admin/sorteringsordning/{id}`         | Hämta en sorteringsordning            |
| GET    | `/admin/sorteringsordning/default`      | Hämta standardsorteringsordning       |
| POST   | `/admin/sorteringsordning`              | Skapa sorteringsordning               |
| PUT    | `/admin/sorteringsordning/{id}`         | Uppdatera sorteringsordning           |
| DELETE | `/admin/sorteringsordning/{id}`         | Ta bort sorteringsordning             |
| PUT    | `/admin/sorteringsordning/{id}/default` | Sätt som standard                     |
| POST   | `/admin/sorteringsordning/preview`      | Förhandsgranska matchande uppgifter   |

## Kafka-integration

Ingen. Gränssnittet har ingen meddelandeintegration.

## Konfiguration

| Egenskap                           | Beskrivning                     | Standardvärde                       |
| ---------------------------------- | ------------------------------- | ----------------------------------- |
| `VITE_BFF_URL`                     | BFF-url vid lokal utveckling    | `http://localhost:9091` (dev-proxy) |
| `RUNTIME_BFF_URL` (`window._env_`) | BFF-url vid körning i container | —                                   |

## Liveness

Ingen egen hälsokontroll — statisk frontend, hälsa avgörs av webbservern som serverar den.

## Kända begränsningar och framtida arbete

| Begränsning                                                                                                     | Föreslagen åtgärd                                       |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Statistikvyn är en oimplementerad platshållare                                                                  | Implementera eller ta bort menyalternativet             |
| Ingen UI-väg finns för att tilldela en uppgift till en specifik handläggare, endast för att ta bort tilldelning | Klargör om detta är avsiktligt eller en saknad funktion |
| Ingen paginering för uppgiftslistan; endast en varningsbanner vid trunkering                                    | Inför paginering eller "visa fler"                      |
| Fält- och sorteringslistor för villkorsbyggaren är duplicerade mellan skapa- och redigera-vyn                   | Bryt ut till en delad modul                             |
