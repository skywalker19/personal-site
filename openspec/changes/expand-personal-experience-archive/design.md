## Context

The site is a small static Astro application with one hand-authored `things` collection, static `/things/` routes, a shared base layout, and a restrained bilingual visual system. Reading data already lives in a shared Notion database; Travel’s verified source is a concise month/destination/duration register. See `proposal.md` for motivation and the capability specs for observable behavior.

The confirmed Notion Reading database is `[UUID_REDACTED]`, with data source `[UUID_REDACTED]`. Its properties include reader, status, start/end dates, title, author, publisher, country, medium, types, language, personal rating, Douban score, and a calculated duration. It contains records for Calvin and other readers and has more than 100 Calvin records, so server-side filtering and pagination are required. Notion must remain strictly read-only, and page bodies must never be retrieved.

The design must preserve existing Things URLs, fit the Git-based publishing workflow, keep production builds independent of Notion, and avoid exposing exact reading dates, notes, other readers’ data, or historical book titles. The uncommitted Xiaoerduo and README changes in the worktree are unrelated and must not be overwritten.

## Goals / Non-Goals

**Goals:**

- Make Reading a useful current-year snapshot plus a restrained long-term annual record.
- Make Calvin-only filtering and the absence of Notion writes enforceable, testable boundaries.
- Minimize synchronized data before it is stored in the repository.
- Give Reading and Travel distinct editorial forms while sharing navigation, accessibility, and responsive primitives.
- Keep the published site static, fast, and maintainable by one person.

**Non-Goals:**

- Editing, repairing, enriching, or otherwise mutating Notion.
- Fetching or publishing Notion page blocks, keywords, reflections, or other notes.
- Public Reading detail pages, public reading dates or durations, and historical title browsing.
- Showing `未读` or `放弃` records or records belonging to Miller or another reader.
- A CMS, account system, comments, likes, social graph, automatic Douban imports, or visitor-submitted content.
- Exact real-time travel tracking or publication of private itinerary details.
- Migrating existing Things or changing their canonical routes.

## Decisions

### 1. Use three peer archives with different depth

The primary information architecture will be `/things/`, `/reading/`, and `/travel/`, with `/about/` retained as a utility destination. Things has detail routes; Travel detail routes exist only for separately authored stories; Reading intentionally stops at `/reading/` because it is a metadata summary rather than a set of public notes. The header exposes all archives directly on desktop and uses an accessible compact treatment at narrow widths.

A universal detail-route convention was rejected because it would create empty Reading pages and imply that private notes are available. A single `/journal/` feed was also rejected because it would hide the domains and make historical Reading privacy harder to communicate.

### 2. Use asymmetric source adapters rather than one universal collection

Travel uses a typed local timeline dataset, with an Astro content collection only for optional authored stories. Reading uses a generated, typed data snapshot created from Notion. Things remains unchanged. Shared components accept small public view models rather than forcing every source into one content-entry schema.

A Markdown Reading collection was rejected because it would duplicate the existing source of truth. Querying Notion inside Astro’s production build was rejected because it would couple deployment to credentials and network availability. A single polymorphic collection was rejected because Reading aggregates and Travel narratives have fundamentally different publication behavior.

### 3. Synchronize Notion through an endpoint allowlist

Add a repository-local synchronization command implemented with the platform HTTP client, avoiding a runtime SDK dependency. It may retrieve the database/data-source schema and POST to the data-source query endpoint, which is a read operation. The query body always contains `阅读者` select `equals: Calvin`, a bounded page size, and the current pagination cursor when present. It follows `has_more` until complete.

The client layer exposes no create, update, archive, restore, delete, or property-management operation. Tests reject unapproved methods/endpoints and assert that every query contains the Calvin filter. The sync never requests `/blocks/<id>/children` or any page-content endpoint. The existing task-assistant helper informed schema discovery but is task-specific and will not become a cross-workspace dependency.

### 4. Transform before persisting a minimized snapshot

The sync processes exact dates and source page IDs in memory only. It maps rows into three outputs:

- `current`: `阅读中` rows, containing title and available approved metadata.
- `completedThisYear`: `已读` rows whose `结束阅读` falls in the active calendar year, sorted by completion date descending before the exact dates are discarded.
- `history`: prior completion years and counts derived only from `已读` rows with usable `结束阅读` dates.

Approved item metadata is limited to title, author, publisher, country, medium, types, language, personal star rating, and Douban score. `未读`, `放弃`, other-reader rows, page IDs, covers, start/end dates, calculated duration, URLs, page bodies, keywords, and reflections are absent from the persisted snapshot. Missing optional fields remain absent rather than receiving guessed values.

The versioned snapshot records only a schema version, generation timestamp, active calendar year, the two public current-year lists, and historical year/count aggregates. Output is schema-validated and atomically replaces the previous file only after every filtered page has been processed successfully.

### 5. Fail safely and keep publishing deterministic

Network, authentication, schema-drift, pagination, or validation failure causes the sync command to exit unsuccessfully while leaving the last valid snapshot untouched. The ordinary production build never contacts Notion and never receives its credential. It validates the checked-in snapshot and fails with a clear resync instruction if the snapshot calendar year differs from the build year.

This permits normal static builds and rollback from Git while preventing a previous-year snapshot from accidentally exposing the wrong “current year” structure. Automatic scheduled synchronization can be considered later; the initial workflow is an explicit read-only sync before publishing Reading changes.

### 6. Present Reading as an annual ledger

The `/reading/` page has three semantic sections: “正在阅读,” “今年已读,” and “往年阅读.” Current and current-year completed items show names and available approved metadata, without dates or durations. Prior years show only year and completed count. `未读` and `放弃` are absent. There are no book links, expandable historical rows, embedded title data, or Reading detail routes.

The page is complete in static HTML and needs no filter script. Its visual language can borrow the existing ledger rhythm while using annual counts to communicate continuity without turning the archive into an exhaustive public catalogue.

### 7. Keep Travel as a factual timeline with optional narratives

The primary Travel archive is a repository-owned factual timeline. Each record has a verified month, destination, and inclusive trip duration, and is rendered as a timeline card. This compact record deliberately avoids inventing exact dates, summaries, coordinates, or narratives that are not present in the source register. Authoring a richer Markdown story remains optional: when one exists, it may add validated date ranges, approximate location context, transport, companion labels, hero/gallery images, highlights, practical notes, and links. Responsive derivatives, intrinsic dimensions, lazy loading, and meaningful alt text apply to optional Travel media. Interactive mapping remains deferred until real content proves its value.

This preserves factual integrity and privacy: the archive can be complete as a timeline without fabricating detail, while richer stories remain locally controlled.

### 8. Compose the home page editorially

The home page retains “Now” and featured Things, and makes its three archive entries role-led: Maker (`创客`) for Things, Reader (`阅读者`) for Reading, and Traveler (`旅行者`) for Travel. The supplied role artwork is represented by one dedicated local image for each role; each is a supporting decorative image while text labels remain present in HTML. The roles are used consistently in primary navigation and archive identity. The home page adds a Reading portal showing current-reading names and/or the current-year completed count, and adds a Travel portal using the latest verified timeline card or an authored empty state. The Reading portal never exposes dates, historical titles, notes, or detail links.

### 9. Preserve URL and metadata continuity

Existing `/things/` and `/things/<id>/` routes remain unchanged. `/reading/` receives unique canonical metadata but generates no child routes. Travel receives archive and detail metadata. Sitemap or RSS support can consume the public view models later, but neither is required for this release.

## Risks / Trade-offs

- [Notion schema or select labels change] → Validate expected property names/types/options and fail before replacing the snapshot.
- [A missing server filter leaks another reader’s data] → Centralize query construction and test the request body plus snapshot/output absence using non-Calvin fixtures.
- [Historical titles or exact dates leak through build artifacts] → Persist only annual aggregates and already-sorted current lists, then scan the snapshot and generated output with known private fixture markers.
- [The Notion credential has broader workspace permissions] → Keep it out of the repository and browser bundle, document least-privilege sharing, and enforce a read-endpoint allowlist in code.
- [Manual snapshots become stale] → Display generation provenance only in developer diagnostics, validate the calendar year during build, and document sync-before-publish.
- [No Reading detail pages limits expression] → Treat Reading as a deliberate ledger; richer reflections can later become separately authored Things if explicitly desired.
- [Four header destinations can crowd small screens] → Test semantic navigation at 320, 390, 768, and desktop widths before polishing archive pages.
- [Travel imagery can degrade performance] → Require dimensions and alt text, generate responsive variants, lazy-load below the fold, and verify a page-weight budget.
- [Sensitive travel details can leak through committed drafts or assets] → Document prohibited data, exclude drafts from production queries, and scan generated output with draft-only fixtures.

## Migration Plan

1. Implement and test the read-only Notion client, Calvin-filtered pagination, schema mapping, minimization, and atomic snapshot write.
2. Generate and inspect the first snapshot, confirming that it contains no other-reader data, page content, exact dates, durations, unread/abandoned rows, or historical titles.
3. Add the verified Travel timeline records and optional-story foundation without changing existing routes.
4. Build shared archive primitives, `/reading/`, `/travel/`, timeline cards, and optional Travel detail routes.
5. Add Reading and Travel portals to the home page and expand navigation only after both archives have complete empty states.
6. Verify static output, accessibility, responsive navigation, snapshot privacy, canonical metadata, performance, and all existing Thing URLs.
7. Publish the synchronized snapshot, content, and navigation together.

Rollback is a single release revert: because Things files and URLs are not migrated and Notion is never modified, reverting the site release restores the previous behavior without source-data conversion.

## Open Questions

- The Travel display label is `旅行`; this does not change routes or content behavior.
- Interactive map discovery should be reconsidered only after the Travel archive contains enough geographically diverse entries to evaluate it with real content.
