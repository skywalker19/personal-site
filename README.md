# Small Things, Over Time

Calvin's personal home: a quiet archive of Things, Reading, and Travel.

## Local development

```bash
npm install
npm run dev
```

The production build is static and written to `dist/`:

```bash
npm run build
```

## Sensitive project values

Do not commit credentials, UUIDs, account usernames, or email addresses. Keep
required operational values in environment variables or the approved external
secret store; tracked examples must use neutral placeholders only. This policy
covers source, documentation, snapshots, generated `dist/` output, asset
filenames and metadata, and file contents in reachable Git history.

Run the repository check before publishing:

```bash
npm run check:sensitive
```

The check reports only a category and location, never the full value. If a
credential is found, revoke or rotate it through its owning provider in
addition to removing it from the repository and history.

For protected account usernames that cannot be inferred from a format, provide
them only through the untracked `PROTECTED_USERNAMES` environment variable as
a comma- or newline-separated list. CI may provide the same list through its
secret store; never add real usernames to scanner configuration.

## Add a Thing

Create a hidden draft with:

```bash
npm run new -- "thing-slug" "Thing title"
```

Edit the generated Markdown file in `src/content/things/`. Change `draft: true` to `draft: false` when the story is ready.

Lifecycle labels describe different kinds of motion:

- `exploring` — an idea under consideration
- `building` — actively being developed
- `ongoing` — continuously producing new material
- `maintained` — usable and occasionally updated
- `complete` — finished as intended
- `paused` — may resume
- `archived` — preserved, no longer maintained

## Reading sync (read-only)

`/reading/` is built from the checked-in, minimized snapshot at `src/data/reading.snapshot.json`; normal builds never contact Notion and do not need a credential. Before publishing new Reading data, share the source database with a least-privilege integration and run:

```bash
NOTION_READING_TOKEN="<NOTION_READ_TOKEN>" \
NOTION_READING_DATA_SOURCE_ID="<NOTION_DATA_SOURCE_UUID>" \
npm run sync:reading
git diff -- src/data/reading.snapshot.json
```

The sync reads only database properties from the configured Notion source. Set
`NOTION_READING_DATA_SOURCE_ID` through your local environment or approved
secret store; never commit its real value. Every query is server-filtered to
`阅读者 = Calvin`; it never retrieves page blocks or writes to Notion. Review
the snapshot diff before publishing. It intentionally contains only current
reading, this year's completed titles and approved metadata, and older
year/count totals—never credentials, page IDs, dates, notes, keywords, other
readers, or historical titles.

If the snapshot year is stale, `npm run build` will stop with a reminder to run this read-only sync.

## Add a Travel entry

Create a hidden Travel draft with:

```bash
npm run new:travel -- "trip-slug" "Trip title"
```

Edit the generated file in `src/content/travel/`. A published entry needs a title, summary, start/end dates, and at least one destination; set `draft: false` when ready. Use only approximate place context. Do not commit exact addresses, booking references, real-time plans, or private companion names. Each meaningful image needs a public path, intrinsic dimensions, and alt text (or `decorative: true`).

## Xiaoerduo growth story

This repository is the canonical owner of the public Xiaoerduo growth story:

- `src/pages/things/xiaoerdou/growth/index.astro` owns the page structure and narrative presentation.
- `public/things/xiaoerdou/growth/` owns the web-ready scripts, styles, data, and derivative images deployed with the site.
- The podcast workspace owns private source evidence and provenance under `podcast/11_audience_growth/`; do not publish private dashboard originals from there.

When updating the story, verify every date and metric against the podcast evidence, preserve the source filename in the public data, and copy only approved web-ready derivatives into `public/`. Do not maintain a second standalone implementation in the podcast workspace.

## Publish

After the one-time server and GitHub setup in [`deploy/SETUP.md`](deploy/SETUP.md):

```bash
npm run publish -- "Add a new Thing"
```

The command validates and builds locally, shows the pending changes, asks for confirmation, commits, and pushes. GitHub Actions then deploys a versioned release and switches the nginx `current` symlink.
