# Small Things, Over Time

Calvin's personal home: a quiet archive of projects, experiments, and writing.

## Local development

```bash
npm install
npm run dev
```

The production build is static and written to `dist/`:

```bash
npm run build
```

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

## Publish

After the one-time server and GitHub setup in [`deploy/SETUP.md`](deploy/SETUP.md):

```bash
npm run publish -- "Add a new Thing"
```

The command validates and builds locally, shows the pending changes, asks for confirmation, commits, and pushes. GitHub Actions then deploys a versioned release and switches the nginx `current` symlink.
