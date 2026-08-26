## Purpose

Provide a coherent, accessible frame that lets visitors discover Calvin’s work and lived experiences as parts of one evolving personal archive.

## ADDED Requirements

### Requirement: First-class archive navigation
The site SHALL expose Things, Reading, Travel, and About as first-class destinations and SHALL identify the active destination without relying on color alone.

#### Scenario: Visitor navigates between identities
- **WHEN** a visitor opens any top-level archive or its detail page
- **THEN** the site presents links to every top-level destination and marks the containing destination as current

#### Scenario: Navigation is used on a narrow screen
- **WHEN** the viewport is 320 CSS pixels wide or greater
- **THEN** all top-level destinations remain reachable without horizontal page overflow

### Requirement: Cross-archive home page
The home page SHALL communicate the broader personal-archive premise through the role-led entry points Maker (`创客`), Reader (`阅读者`), and Traveler (`旅行者`); it SHALL retain a curated Things section and provide an identifiable preview and link for Reading and Travel. These role labels SHALL be used consistently in site-wide primary navigation and archive identity.

#### Scenario: Every archive contains public material
- **WHEN** a visitor opens the home page
- **THEN** the visitor can see a representative preview of Things, Reading, and Travel and navigate to each archive

#### Scenario: A journal has no published entries
- **WHEN** a visitor opens the home page before a journal has published content
- **THEN** the journal is represented by an intentional introduction or empty state rather than a broken or missing layout region

### Requirement: Source-aware publication contract
Every public archive SHALL identify its domain. Individually named public narrative items SHALL have a title, while verified Travel timeline records MAY use destination as their sole public identifier and locally authored narrative entries SHALL additionally support summaries, publication metadata, language, themes, featured state, and draft state. Source-specific fields MUST NOT be exposed merely to make heterogeneous archives conform to one universal entry shape.

#### Scenario: Local draft entry is built for production
- **WHEN** a locally authored narrative entry is marked as a draft
- **THEN** it is absent from archive lists, home-page previews, generated detail routes, and public discovery metadata

#### Scenario: Synchronized metadata item is rendered
- **WHEN** a source-approved Reading item is included in the synchronized snapshot
- **THEN** it can appear in the Reading archive without requiring a public detail route, summary, note, or visible reading date

### Requirement: Static and progressively enhanced experience
All archive and applicable detail content SHALL be usable in the generated static HTML; client-side behavior MAY enhance filtering or presentation but MUST NOT be required to discover or read entries.

#### Scenario: Client-side JavaScript is unavailable
- **WHEN** a visitor loads any archive or detail page without executing JavaScript
- **THEN** navigation, archive summaries, public metadata, and available narrative content remain accessible

### Requirement: Existing Things compatibility
The expansion SHALL preserve the current canonical `/things/` archive and `/things/<id>/` detail URLs and SHALL retain all currently published Things entries.

#### Scenario: Existing Thing URL is requested after expansion
- **WHEN** a visitor or search engine requests a previously published Thing URL
- **THEN** the same Thing content is served at that URL without requiring a redirect

### Requirement: Accessible and responsive presentation
Shared archive interfaces SHALL use semantic landmarks, visible keyboard focus, meaningful heading order, descriptive link text, and text alternatives for meaningful images, and SHALL honor reduced-motion preferences.

#### Scenario: Visitor uses keyboard navigation
- **WHEN** a visitor traverses the header, archive controls, cards, and article links by keyboard
- **THEN** focus order follows the visual reading order and every interactive control has a visible focus indicator and accessible name

#### Scenario: Visitor requests reduced motion
- **WHEN** the operating system indicates a reduced-motion preference
- **THEN** non-essential animated transitions are removed or reduced
