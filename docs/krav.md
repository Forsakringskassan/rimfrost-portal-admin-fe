# Krav — Portal Admin Frontend (PAFE)

## Bakgrund och syfte

Portal Admin Frontend är ett administrationsgränssnitt för Operativt Uppgiftslager (OUL). Det
ger administratörer och driftpersonal insyn i samtliga operativa uppgifter i systemet samt
möjlighet att konfigurera sorteringsordningar — regelbaserade specifikationer som styr i vilken
ordning uppgifter presenteras och tilldelas handläggare. Gränssnittet finns för att administratörer
ska kunna observera och justera uppgiftsprioritering utan direktåtkomst till bakomliggande system.

---

## Intressenter och aktörer

| Aktör                       | Roll                                                                          |
| --------------------------- | ----------------------------------------------------------------------------- |
| Administratör/driftpersonal | Enda användarrollen; övervakar uppgifter och konfigurerar sorteringsordningar |
| Portal Admin BFF            | Enda bakomliggande tjänst gränssnittet anropar                                |

---

## Funktionella krav

### PAFE-FR-01 — Uppgiftsöversikt

- **PAFE-FR-01.1** Gränssnittet ska visa samtliga operativa uppgifter i en tabell med
  identifierare, status, regeltyp, roll, skapandedatum och tilldelad handläggare.
- **PAFE-FR-01.2** Listan ska kunna sorteras på skapandedatum och regeltyp.
- **PAFE-FR-01.3** Administratören ska kunna ta bort tilldelningen av en uppgift från dess
  handläggare direkt i listan.
- **PAFE-FR-01.4** Om bakomliggande tjänst returnerar färre uppgifter än det totala antalet ska
  gränssnittet varna administratören om att listan är trunkerad.
- **PAFE-FR-01.5** Rader utan giltig uppgiftsidentifierare ska filtreras bort från visningen.
- **PAFE-FR-01.6** Administratören ska kunna flytta en uppgift till en angiven handläggare,
  genom att avtilldela och därefter tilldela uppgiften till den angivna identiteten.
- **PAFE-FR-01.7** Den angivna målhandläggaren får inte vara densamma som uppgiftens nuvarande
  handläggare.

### PAFE-FR-02 — Sorteringsordningar

- **PAFE-FR-02.1** Gränssnittet ska visa samtliga konfigurerade sorteringsordningar med namn,
  skapandedatum, antal regler och om den är satt som standard.
- **PAFE-FR-02.2** Administratören ska kunna skapa en ny sorteringsordning bestående av ett namn
  och en ordnad lista av prioritetsgrupper.
- **PAFE-FR-02.3** Varje prioritetsgrupp ska kunna filtrera uppgifter via ett eller flera villkor
  och ange en sorteringsriktning inom gruppen.
- **PAFE-FR-02.4** Prioritetsgrupper ska utvärderas i angiven ordning, där en uppgift tillhör den
  första grupp vars samtliga villkor den uppfyller.
- **PAFE-FR-02.5** Administratören ska kunna redigera en befintlig sorteringsordning, inklusive
  att sätta den som standard.
- **PAFE-FR-02.6** Administratören ska kunna ta bort en sorteringsordning, förutsatt att den inte
  är satt som standard.
- **PAFE-FR-02.7** Administratören ska kunna sätta en sorteringsordning som standard.
- **PAFE-FR-02.8** Gränssnittet ska inte markera en sorteringsordning som standard förrän
  bakomliggande tjänst har bekräftat ändringen.

### PAFE-FR-03 — Förhandsgranskning

- **PAFE-FR-03.1** Vid skapande eller redigering av en sorteringsordning ska administratören
  kunna förhandsgranska vilka uppgifter en (eventuellt osparad) specifikation matchar och i
  vilken ordning.
- **PAFE-FR-03.2** Förhandsgranskningen ska uppdateras automatiskt när specifikationen ändras,
  så länge förhandsgranskningspanelen är öppen.

---

## Icke-funktionella krav

### PAFE-NFR-01 — Feltolerans

- **PAFE-NFR-01.1** Nätverks- och serverfel ska presenteras för administratören som ett
  begripligt felmeddelande, utan att gränssnittet kraschar.
- **PAFE-NFR-01.2** Ett 404-svar vid hämtning av en enskild resurs ska tolkas som att resursen
  inte finns, inte som ett generellt fel.

---

## API-gränssnitt (översikt)

| API                       | Målgrupp         | Specifikationsartefakt                                                   |
| ------------------------- | ---------------- | ------------------------------------------------------------------------ |
| Portal Admin BFF REST-API | Detta gränssnitt | Definieras av Portal Admin BFF (ingen extern OpenAPI-specifikation ännu) |

---

## Integration med Portal Admin BFF

Gränssnittet talar uteslutande med Portal Admin BFF, som i sin tur integrerar mot OUL:s
administrationstjänst. Gränssnittet har ingen egen affärslogik för uppgifts- eller
sorteringsordningsdata.
