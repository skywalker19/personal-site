## Why

The site currently presents Calvin mainly through projects and experiments, while his reading history and travel experiences have no durable public home. Expanding the archive around these facets will create a fuller personal record while preserving the quiet, curated character of “Small Things, Over Time.”

## What Changes

- Reframe the top-level information architecture as one personal archive with three clear areas: Things, Reading, and Travel.
- Add a Reading archive sourced from Calvin’s existing Notion Reading database through strictly read-only synchronization.
- Restrict every Reading query to records whose `阅读者` value is exactly `Calvin`; records belonging to Miller or any other reader must never enter the site snapshot or generated output.
- Show Calvin’s current books and the current calendar year’s completed-book list without start or completion dates; represent each earlier year only by its completed-book count.
- Use only Notion database properties for Reading. Do not fetch or display page-body content, including `关键字`, `读后感`, or other notes, and do not create visitor-facing Reading detail pages.
- Add a Travel timeline sourced from Calvin’s verified travel register, showing only month, destination, and duration as timeline cards; locally authored stories remain optional additions rather than a requirement for every trip.
- Evolve the home page into a curated cross-section of Calvin’s current interests while preserving featured Things and all existing Things URLs.
- Provide accessible, responsive top-level archive pages and intentional empty states, with static HTML as the baseline experience.
- Keep production static: synchronize Notion into a validated local Reading snapshot before building, while Travel remains draftable repository content.

## Capabilities

### New Capabilities

- `personal-archive-shell`: Top-level navigation, home-page discovery, shared presentation, and compatibility behavior for the expanded personal archive.
- `reading-journal`: Read-only Notion synchronization and privacy-preserving presentation of Calvin’s current-year reading list and historical annual totals.
- `travel-journal`: Listing and filtering a verified Travel timeline, with optional authored trip stories and imagery.

### Modified Capabilities

None. There are no existing main specs; the established Things behavior is treated as a compatibility constraint rather than re-specified in this change.

## Impact

- Affects Astro data loading, route structure, the base layout and navigation, home-page composition, shared archive components, and global/module styling.
- Adds a read-only Notion synchronization utility, normalized Reading snapshot, schema validation, pagination, and tests that prove non-Calvin records and page bodies are excluded.
- Uses Notion database `[UUID_REDACTED]` and data source `[UUID_REDACTED]`; the Notion view ID is not used as a data source.
- Requires a read-capable Notion credential only during explicit synchronization. Production builds and visitors do not receive the credential and do not call Notion.
- Adds local Travel content and media while preserving `/things/` and `/things/<id>/` as canonical routes and retaining the current static deployment model.
- Notion is strictly read-only and outside the system’s write boundary: this change will not create, update, archive, restore, delete, or reconfigure any Notion object.
