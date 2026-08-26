## Purpose

Provide a privacy-preserving public summary of Calvin’s reading activity by synchronizing selected metadata from his existing Notion Reading database without exposing notes or detailed historical timelines.

## ADDED Requirements

### Requirement: Calvin-only source eligibility
The Reading synchronization SHALL query Notion data source `[UUID_REDACTED]` with a server-side condition requiring the `阅读者` select value to equal `Calvin` exactly, and SHALL follow pagination until all matching rows have been processed.

#### Scenario: Calvin record is returned
- **WHEN** a Notion row has `阅读者` equal to `Calvin`
- **THEN** the row is eligible for transformation according to its reading status and year

#### Scenario: Another reader has a record
- **WHEN** a Notion row belongs to Miller or any reader other than Calvin
- **THEN** the row is excluded by the Notion query and MUST NOT be stored, logged, counted, or exposed by the site synchronization

#### Scenario: Calvin has more than one result page
- **WHEN** Notion indicates that additional Calvin-filtered results are available
- **THEN** synchronization follows the returned cursor until no result page remains

### Requirement: Strictly read-only Notion boundary
The system SHALL use Notion only for read operations and MUST NOT create, update, archive, restore, delete, or reconfigure pages, databases, data sources, properties, options, views, icons, covers, or blocks.

#### Scenario: Reading synchronization runs
- **WHEN** the site retrieves Reading data from Notion
- **THEN** every Notion request is a retrieval or filtered query and no mutation request is issued

#### Scenario: Site content needs correction
- **WHEN** a synchronized Reading value is missing or incorrect
- **THEN** the site reports or tolerates the source value without attempting to repair it in Notion

### Requirement: Database-properties-only retrieval
The Reading synchronization SHALL use database row properties only and MUST NOT request or store Notion page block children or page-body content, including sections named `关键字`, `读后感`, or any other notes.

#### Scenario: A Reading page contains notes
- **WHEN** a Calvin Reading page has non-empty body blocks
- **THEN** those blocks are neither requested nor represented in the synchronized snapshot or public site

#### Scenario: A Reading page body is empty
- **WHEN** a Calvin Reading page contains no body content
- **THEN** its eligible metadata can still contribute to the Reading archive without an empty notes region

### Requirement: Reading property interpretation
The synchronization SHALL interpret the existing Notion properties `Name`, `作者`, `出版社`, `国家`, `媒介`, `开始阅读`, `类型`, `结束阅读`, `评分`, `语言`, `豆瓣得分`, `阅读状态`, and `阅读者` without adding or changing source properties. It SHALL map `阅读中` to current reading and `已读` to completed reading; `未读` and `放弃` SHALL not appear in the public site.

#### Scenario: Current book has sparse metadata
- **WHEN** an eligible row has `阅读状态` equal to `阅读中` and lacks optional metadata
- **THEN** its title still appears in the current-reading list and no empty metadata label is rendered

#### Scenario: Completed book has supported metadata
- **WHEN** an eligible row has `阅读状态` equal to `已读`
- **THEN** its title and available public metadata can be used in the appropriate current-year list or historical count

#### Scenario: Unread or abandoned book is synchronized
- **WHEN** an eligible Calvin row has `阅读状态` equal to `未读` or `放弃`
- **THEN** it is omitted from public Reading output and historical totals

### Requirement: Current-year public book lists
The Reading archive SHALL determine the current calendar year dynamically, show Calvin’s `阅读中` books in a current-reading section, and show individually named `已读` books whose `结束阅读` year equals the current year in descending completion-date order. It MUST NOT display start dates, completion dates, calculated reading durations, notes, keywords, or links to visitor-facing Reading detail pages.

#### Scenario: Visitor opens Reading during the current year
- **WHEN** current or current-year completed books exist
- **THEN** the archive lists current-year completed books from most recently completed to least recently completed, with their names and available approved metadata but without displaying any reading date or duration

#### Scenario: Current-year completed book has no completion date
- **WHEN** a row is marked `已读` but has no usable `结束阅读` year
- **THEN** it is excluded from year-based public lists and totals rather than assigned an invented year

#### Scenario: Visitor selects a current-year book
- **WHEN** a visitor interacts with a Reading list item
- **THEN** the site does not expose a local Reading note or detail route for that book

### Requirement: Historical annual totals
For every year before the current calendar year, the Reading archive SHALL display only the year and the number of Calvin rows that are `已读` with an `结束阅读` date in that year. Historical book titles and metadata MUST NOT be present in rendered HTML, client data, public assets, or discovery metadata.

#### Scenario: Earlier year contains completed books
- **WHEN** one or more eligible completed books have an `结束阅读` year before the current year
- **THEN** the archive shows that year and the number of completed books, without listing or embedding their titles

#### Scenario: Earlier year has no completed books
- **WHEN** no eligible completed books belong to an earlier year
- **THEN** the archive does not invent or display a zero-count year

### Requirement: Minimized static snapshot
Synchronization SHALL produce a validated local snapshot containing only the public current-reading list, the public current-year completed list, historical year/count aggregates, and generation metadata needed to validate freshness. Exact reading dates, other-reader records, page bodies, unread records, abandoned records, and Notion credentials MUST NOT be written to the snapshot.

#### Scenario: Synchronization succeeds
- **WHEN** all Calvin-filtered pages are retrieved and transformed successfully
- **THEN** the previous snapshot is atomically replaced with validated minimized output for the active calendar year

#### Scenario: Synchronization fails
- **WHEN** Notion is unavailable, authentication fails, pagination is incomplete, or transformed data is invalid
- **THEN** the command fails without partially replacing the last valid snapshot or modifying Notion

#### Scenario: Production build runs
- **WHEN** the site builds from a valid current-year snapshot
- **THEN** no Notion credential or network request is required and the generated Reading page contains only approved public fields

#### Scenario: Snapshot belongs to a previous year
- **WHEN** the snapshot’s recorded calendar year differs from the build’s current year
- **THEN** the build fails with guidance to run the read-only synchronization before publishing

### Requirement: Reading archive accessibility
The Reading archive SHALL expose its current-reading list, current-year completed list, and historical year/count summary through semantic static HTML that remains understandable without client-side JavaScript.

#### Scenario: JavaScript is unavailable
- **WHEN** a visitor opens `/reading/` without executing client-side JavaScript
- **THEN** all approved current book metadata and historical annual totals remain readable

#### Scenario: No public Reading data exists
- **WHEN** the minimized snapshot contains no current books and no historical totals
- **THEN** the archive presents an intentional empty state without broken lists or controls
