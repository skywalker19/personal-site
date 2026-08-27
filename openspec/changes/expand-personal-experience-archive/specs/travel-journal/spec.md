## Purpose

Create a privacy-conscious travel timeline for remembering verified trips through a compact register, with authored stories as optional additions rather than a prerequisite for publication.

## ADDED Requirements

### Requirement: Travel timeline record
Each Travel timeline record SHALL identify a verified year/month, destination, domestic/foreign region, and inclusive trip duration. It MUST NOT invent exact dates, private locations, narratives, or publication metadata absent from the source register. A record MAY link to a separately authored Travel story when one is available.

For this change, the approved travel register is the following 14 records, ordered newest first:

| Year/month | Destination | Region | Days |
| --- | --- | --- | ---: |
| 2026-08 | 土耳其 | 国外 | 13 |
| 2026-02 | 舟山 | 国内 | 4 |
| 2025-08 | 延边 | 国内 | 5 |
| 2025-02 | 西葡 | 国外 | 13 |
| 2024-08 | 澳大利亚 | 国外 | 12 |
| 2024-02 | 大连 | 国内 | 5 |
| 2023-07 | 日本 | 国外 | 11 |
| 2023-01 | 广州 | 国内 | 8 |
| 2022-07 | 新疆 | 国内 | 17 |
| 2021-08 | 四川 | 国内 | 11 |
| 2020-10 | 庐山 | 国内 | 5 |
| 2019-10 | 黄山 | 国内 | 4 |
| 2019-07 | 广西 | 国内 | 8 |
| 2019-05 | 天津 | 国内 | 5 |

#### Scenario: Trip is present in the source register
- **WHEN** a verified trip includes a month, destination, region, and duration
- **THEN** the archive renders the month, destination, and duration as one timeline card

#### Scenario: Exact dates are unavailable
- **WHEN** the source register identifies only a year/month
- **THEN** the archive presents that month without fabricating start or end dates

#### Scenario: No authored story exists
- **WHEN** a timeline record has no linked authored story
- **THEN** its card remains complete and does not display a broken link or empty media region

### Requirement: Travel archive discovery
The Travel archive SHALL list verified timeline records by descending year/month and SHALL let visitors distinguish records by domestic/foreign region, year, destination, and duration.

#### Scenario: Visitor opens the Travel archive
- **WHEN** timeline records exist
- **THEN** each card exposes its month, destination, and duration, with a story link only when that story is available

#### Scenario: Visitor filters travel records
- **WHEN** the visitor selects domestic or foreign, or a represented year
- **THEN** matching timeline cards are shown with an updated result count and a clear way to reset the filter

### Requirement: Optional Travel story experience
An authored Travel story MAY have a canonical detail page that combines a narrative with trip context and progressively presents optional photos, highlights, and practical notes. A timeline record MUST NOT require a detail page.

#### Scenario: Visitor reads a photo-led trip
- **WHEN** a travel entry includes gallery images
- **THEN** the detail page presents responsive images with meaningful alternative text or an explicit decorative designation and preserves the authored image order

#### Scenario: Visitor reads practical notes
- **WHEN** a travel entry includes practical recommendations
- **THEN** the detail page visually distinguishes those notes from the chronological or reflective narrative

### Requirement: Travel privacy protection
Published travel entries MUST NOT require exact private locations, real-time whereabouts, legal identity details, booking references, or private companion names, and draft travel entries MUST be excluded from production output.

#### Scenario: Entry contains approximate geography only
- **WHEN** a published trip supplies location context
- **THEN** the page can communicate the general place without exposing an exact accommodation or private address

#### Scenario: Draft contains sensitive planning notes
- **WHEN** a draft travel entry contains unpublished itinerary details
- **THEN** those details are not present in generated routes, archive data, or public discovery metadata
