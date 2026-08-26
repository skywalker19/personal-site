## 1. Read-Only Notion Synchronization

- [x] 1.1 Add repository-local Reading configuration for database `[UUID_REDACTED]`, data source `[UUID_REDACTED]`, and an environment-provided read credential; verify configuration diagnostics never print the credential and the ordinary site build does not require it.
- [ ] 1.2 Implement a Notion client restricted to schema retrieval and data-source query endpoints, and verify automated tests reject create, update, archive, restore, delete, property-management, and block-children requests.
- [x] 1.3 Build every query with server-side `阅读者 equals Calvin` filtering and cursor pagination, and verify multi-page fixtures are exhausted while Miller and other-reader rows are never returned to transformation, logs, or snapshots.
- [x] 1.4 Validate the expected Reading property names and types and map only database properties, and verify schema drift fails clearly without requesting page bodies or changing Notion.
- [x] 1.5 Transform `阅读中` into the current list, current-year `已读` into the named completed list, and earlier `已读` into year/count aggregates; verify `未读`, `放弃`, missing completion years, and future completion years are excluded from public output.
- [x] 1.6 Sort current-year completed rows in memory by descending completion date, discard exact dates and source identifiers, and verify the normalized snapshot contains no start/end dates, durations, page IDs, URLs, covers, page blocks, `关键字`, `读后感`, historical titles, or non-Calvin fixture markers.
- [ ] 1.7 Validate and atomically replace the versioned Reading snapshot only after complete success, and verify network, authentication, pagination, or validation failures preserve the prior valid snapshot byte-for-byte.
- [ ] 1.8 Add a build-time snapshot check for schema version and current calendar year, and verify a stale-year or missing snapshot fails with a clear read-only sync instruction while a valid snapshot builds without network access.

## 2. Travel Content Foundation

- [x] 2.1 Define a typed Travel timeline record with year/month, destination, and positive duration, plus an optional reference to an authored story; verify it rejects missing or invented-required fields.
- [x] 2.2 Add the five verified timeline records from the approved travel register and verify their month, destination, duration, reverse chronology, and absence of fabricated exact dates or stories in `dist/`.
- [ ] 2.3 Retain an optional authored Travel-story scaffold without changing existing `npm run new` behavior for Things.

## 3. Shared Personal Archive Shell

- [ ] 3.1 Refactor the site header to expose Things, Reading, Travel, and About with active-route semantics, and verify keyboard access and no horizontal overflow at 320, 390, 768, and desktop viewport widths.
- [x] 3.2 Build shared archive primitives for headings, metadata, counts, empty states, cards, and applicable archive-back navigation, and verify Reading can compose an aggregate-only page while Travel composes archive and detail pages without universal-entry conditionals.
- [x] 3.3 Extend the base layout with archive-aware titles, descriptions, canonical URLs, and optional social imagery, and verify `/reading/`, `/travel/`, representative Travel details, and existing Things pages contain unique metadata and expected canonical URLs.

## 4. Reading Annual Ledger

- [x] 4.1 Build a typed loader for the minimized Reading snapshot, and verify it accepts approved metadata plus annual counts while rejecting exact dates, historical item arrays, page content, unsupported statuses, or unknown top-level fields.
- [x] 4.2 Build `/reading/` with semantic “正在阅读,” “今年已读,” and “往年阅读” sections plus intentional empty states, and verify current items show no dates, prior years expose only year/count pairs, and no `/reading/<slug>/` routes are generated.
- [x] 4.3 Render optional title, author, publisher, country, medium, types, language, personal rating, and Douban score without empty labels, and verify notes, keywords, dates, durations, covers, URLs, `未读`, and `放弃` never appear in the page.
- [ ] 4.4 Add Reading-specific responsive styling using an annual ledger rhythm, and verify semantic heading order, focus behavior, contrast, and readable layouts at the target viewport widths with JavaScript disabled.
- [x] 4.5 Scan the checked-in snapshot and generated output with known private fixture markers, and verify historical titles, exact dates, other-reader names/items, Notion credentials, page IDs, and note content are absent.

## 5. Travel Journal

- [x] 5.1 Build `/travel/` as an accessible reverse-chronological timeline of cards showing month, destination, and duration; add destination/year filters and a zero-entry state, and verify every filter/reset combination produces the expected count.
- [ ] 5.2 Preserve optional static `/travel/<slug>/` pages for authored stories only; verify timeline records without stories produce no child route or broken link, while a story with media retains private-location protections.
- [ ] 5.3 Add Travel-specific responsive timeline-card styling and optional-story media behavior, and verify readable cards at target widths plus correct alt/lazy-loading behavior where authored media exists.

## 6. Home Page Integration

- [x] 6.1 Revise the home-page narrative to introduce Calvin’s Things, Reading, and Travel as one personal archive through Maker (`创客`), Reader (`阅读者`), and Traveler (`旅行者`) entries; apply the approved role artwork to the three entries, retain the existing “Now” and featured Things content, and verify all previously published Thing links and routes remain unchanged.
- [x] 6.2 Add a Reading portal showing current-reading names and/or the current-year completed count, and verify it links only to `/reading/` and contains no dates, historical titles, notes, or book-detail URLs.
- [x] 6.3 Add a Travel portal using the latest verified timeline record, then an authored-empty-state fallback; verify it represents month, destination, and duration without fabricating a story link.

## 7. Documentation and Release Verification

- [x] 7.1 Document the strictly read-only Reading sync, Calvin-only filter, source IDs, environment setup, snapshot privacy rules, sync-before-publish workflow, and Travel authoring/media guidance; verify another operator can refresh Reading and create a Travel draft using only the README.
- [x] 7.2 Run the read-only sync and inspect its diff before publishing, and verify only the minimized snapshot changes while Notion retains identical page, database, property, option, view, icon, cover, and block state.
- [x] 7.3 Run the production build and inspect generated routes to verify `/reading/`, the Travel archive/details, and every existing Thing page build; no Reading child routes, drafts, credentials, or disallowed Reading data are emitted.
- [ ] 7.4 Perform keyboard, reduced-motion, no-JavaScript, semantic heading, image-alt, and responsive checks across the home page, both archives, representative Travel details, and existing Things pages; record and resolve every blocking accessibility issue.
- [ ] 7.5 Measure production page weight and image behavior for `/reading/` and the richest Travel page, and verify visitors make no Notion or map-service requests and performance remains within the project’s agreed static-site budget.
